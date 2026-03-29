import { z } from "zod";
import { router, adminProcedure } from "../init";
import {
  db,
  calendarEvents,
  petVaccinations,
  preventiveTreatments,
  bookingRequests,
  pets,
  users,
  petTutors,
  vaccineLibrary,
} from "@/lib/db";
import { eq, and, gte, lte, between, sql } from "drizzle-orm";
import { safeAsync } from "@/lib/errors";
import { addDays, startOfDay, endOfDay, differenceInCalendarDays } from "date-fns";

// ==========================================
// TYPES
// ==========================================

interface UnifiedCalendarEvent {
  id: string;
  type: string;
  title: string;
  petId: number;
  petName: string;
  tutorName: string;
  startDate: string;
  endDate?: string;
  startTime?: string;
  endTime?: string;
  color: string;
  status?: string;
  notes?: string;
}

interface CalendarAlert {
  petId: number;
  petName: string;
  type: "vaccine" | "preventive";
  itemName: string;
  dueDate: string;
  daysRemaining: number;
  urgency: "green" | "yellow" | "red";
}

// ==========================================
// CONSTANTS
// ==========================================

const COLORS: Record<string, string> = {
  checkin: "#22c55e",
  checkout: "#ef4444",
  vaccine: "#3b82f6",
  preventive: "#8b5cf6",
  medication: "#f59e0b",
  booking: "#06b6d4",
  event: "#6b7280",
};

// ==========================================
// HELPERS
// ==========================================

function formatTime(date: Date): string {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function getUrgency(daysRemaining: number): "green" | "yellow" | "red" {
  return daysRemaining > 7 ? "green" : daysRemaining > 3 ? "yellow" : "red";
}

/**
 * Resolve pet name and primary tutor name for a given petId.
 * Returns cached results when available.
 */
async function resolvePetInfo(
  petId: number,
  cache: Map<number, { petName: string; tutorName: string }>
): Promise<{ petName: string; tutorName: string }> {
  if (cache.has(petId)) return cache.get(petId)!;

  const pet = await db.query.pets.findFirst({
    where: eq(pets.id, petId),
  });

  let tutorName = "—";
  const primaryTutor = await db
    .select({ name: users.name })
    .from(petTutors)
    .innerJoin(users, eq(petTutors.tutorId, users.id))
    .where(eq(petTutors.petId, petId))
    .limit(1);

  if (primaryTutor.length > 0) {
    tutorName = primaryTutor[0].name;
  }

  const result = { petName: pet?.name ?? "Pet removido", tutorName };
  cache.set(petId, result);
  return result;
}

// ==========================================
// ROUTER
// ==========================================

export const unifiedCalendarRouter = router({
  /**
   * Retorna eventos unificados de todas as fontes no período
   */
  getEvents: adminProcedure
    .input(
      z.object({
        start: z.string(),
        end: z.string(),
        type: z.string().optional(),
        petId: z.number().optional(),
        tutorId: z.number().optional(),
      })
    )
    .query(async ({ input }) => {
      return safeAsync(async () => {
        const startDate = new Date(input.start);
        const endDate = new Date(input.end);
        const results: UnifiedCalendarEvent[] = [];
        const petCache = new Map<number, { petName: string; tutorName: string }>();

        // If filtering by tutorId, resolve their petIds first
        let allowedPetIds: Set<number> | null = null;
        if (input.tutorId) {
          const tutorPets = await db
            .select({ petId: petTutors.petId })
            .from(petTutors)
            .where(eq(petTutors.tutorId, input.tutorId));
          allowedPetIds = new Set(tutorPets.map((p) => p.petId));
        }

        // Helper to check if event passes filters
        const passesFilters = (petId: number, eventType: string): boolean => {
          if (input.petId && petId !== input.petId) return false;
          if (allowedPetIds && !allowedPetIds.has(petId)) return false;
          if (input.type && eventType !== input.type) return false;
          return true;
        };

        // ── 1. Calendar Events ──────────────────────────────
        const calEvents = await db
          .select({
            event: calendarEvents,
            petName: pets.name,
          })
          .from(calendarEvents)
          .leftJoin(pets, eq(calendarEvents.petId, pets.id))
          .where(
            and(
              gte(calendarEvents.eventDate, startDate),
              lte(calendarEvents.eventDate, endDate)
            )
          );

        // Group checkin/checkout by petId + date for pairing
        const checkinMap = new Map<string, { eventDate: Date; id: number; title: string; notes: string | null; status: string | null }>();
        const checkoutMap = new Map<string, { eventDate: Date; id: number }>();
        const processedCheckinKeys = new Set<string>();

        for (const row of calEvents) {
          const ev = row.event;
          if (!ev.petId) continue;

          const eventType = ev.eventType;

          if (eventType === "checkin" || eventType === "checkout") {
            const dayKey = `${ev.petId}-${ev.eventDate.toISOString().slice(0, 10)}`;
            if (eventType === "checkin") {
              checkinMap.set(dayKey, { eventDate: ev.eventDate, id: ev.id, title: ev.title, notes: ev.notes, status: ev.status });
            } else {
              checkoutMap.set(dayKey, { eventDate: ev.eventDate, id: ev.id });
            }
            continue;
          }

          // Non check-in/out calendar events
          if (!passesFilters(ev.petId, eventType)) continue;

          const info = await resolvePetInfo(ev.petId, petCache);
          results.push({
            id: `event-${ev.id}`,
            type: eventType,
            title: ev.title,
            petId: ev.petId,
            petName: info.petName,
            tutorName: info.tutorName,
            startDate: ev.eventDate.toISOString(),
            endDate: ev.endDate?.toISOString(),
            startTime: !ev.isAllDay ? formatTime(ev.eventDate) : undefined,
            endTime: ev.endDate && !ev.isAllDay ? formatTime(ev.endDate) : undefined,
            color: COLORS[eventType] || COLORS.event,
            status: ev.status ?? undefined,
            notes: ev.notes ?? undefined,
          });
        }

        // Pair checkin + checkout
        for (const [dayKey, checkin] of Array.from(checkinMap.entries())) {
          const petId = Number(dayKey.split("-")[0]);
          if (!passesFilters(petId, "checkin")) continue;

          const info = await resolvePetInfo(petId, petCache);
          const checkout = checkoutMap.get(dayKey);

          results.push({
            id: `event-${checkin.id}`,
            type: "checkin",
            title: checkin.title,
            petId,
            petName: info.petName,
            tutorName: info.tutorName,
            startDate: checkin.eventDate.toISOString(),
            startTime: formatTime(checkin.eventDate),
            endTime: checkout ? formatTime(checkout.eventDate) : undefined,
            color: COLORS.checkin,
            status: checkin.status ?? undefined,
            notes: checkin.notes ?? undefined,
          });
          processedCheckinKeys.add(dayKey);
        }

        // Standalone checkouts (no matching checkin)
        for (const [dayKey, checkout] of Array.from(checkoutMap.entries())) {
          if (processedCheckinKeys.has(dayKey)) continue;
          const petId = Number(dayKey.split("-")[0]);
          if (!passesFilters(petId, "checkout")) continue;

          const info = await resolvePetInfo(petId, petCache);
          results.push({
            id: `event-${checkout.id}`,
            type: "checkout",
            title: "Check-out",
            petId,
            petName: info.petName,
            tutorName: info.tutorName,
            startDate: checkout.eventDate.toISOString(),
            startTime: formatTime(checkout.eventDate),
            color: COLORS.checkout,
          });
        }

        // ── 2. Vaccinations ────────────────────────────────
        if (!input.type || input.type === "vaccine") {
          const vaccinations = await db
            .select({
              vaccination: petVaccinations,
              petName: pets.name,
              vaccineName: vaccineLibrary.name,
            })
            .from(petVaccinations)
            .innerJoin(pets, eq(petVaccinations.petId, pets.id))
            .innerJoin(vaccineLibrary, eq(petVaccinations.vaccineId, vaccineLibrary.id))
            .where(
              and(
                gte(petVaccinations.nextDueDate, startDate),
                lte(petVaccinations.nextDueDate, endDate)
              )
            );

          for (const row of vaccinations) {
            const v = row.vaccination;
            if (!passesFilters(v.petId, "vaccine")) continue;

            const info = await resolvePetInfo(v.petId, petCache);
            results.push({
              id: `vaccine-${v.id}`,
              type: "vaccine",
              title: row.vaccineName,
              petId: v.petId,
              petName: info.petName,
              tutorName: info.tutorName,
              startDate: v.nextDueDate!.toISOString(),
              color: COLORS.vaccine,
              notes: v.notes ?? undefined,
            });
          }
        }

        // ── 3. Preventive Treatments ───────────────────────
        if (!input.type || input.type === "preventive") {
          const preventives = await db
            .select({
              treatment: preventiveTreatments,
              petName: pets.name,
            })
            .from(preventiveTreatments)
            .innerJoin(pets, eq(preventiveTreatments.petId, pets.id))
            .where(
              and(
                gte(preventiveTreatments.nextDueDate, startDate),
                lte(preventiveTreatments.nextDueDate, endDate)
              )
            );

          for (const row of preventives) {
            const t = row.treatment;
            if (!passesFilters(t.petId, "preventive")) continue;

            const info = await resolvePetInfo(t.petId, petCache);
            results.push({
              id: `preventive-${t.id}`,
              type: "preventive",
              title: `${t.productName} (${t.type})`,
              petId: t.petId,
              petName: info.petName,
              tutorName: info.tutorName,
              startDate: t.nextDueDate!.toISOString(),
              color: COLORS.preventive,
              notes: t.notes ?? undefined,
            });
          }
        }

        // ── 4. Approved Bookings ───────────────────────────
        if (!input.type || input.type === "booking") {
          const bookings = await db
            .select({
              booking: bookingRequests,
              petName: pets.name,
            })
            .from(bookingRequests)
            .innerJoin(pets, eq(bookingRequests.petId, pets.id))
            .where(
              and(
                eq(bookingRequests.status, "approved"),
                lte(bookingRequests.startDate, endDate),
                gte(bookingRequests.endDate, startDate)
              )
            );

          for (const row of bookings) {
            const b = row.booking;
            if (!passesFilters(b.petId, "booking")) continue;

            const info = await resolvePetInfo(b.petId, petCache);
            const isHotel = b.requestType === "hotel";

            results.push({
              id: `booking-${b.id}`,
              type: "booking",
              title: `${isHotel ? "Hospedagem" : "Creche"} - ${info.petName}`,
              petId: b.petId,
              petName: info.petName,
              tutorName: info.tutorName,
              startDate: b.startDate.toISOString(),
              endDate: isHotel ? b.endDate.toISOString() : undefined,
              color: COLORS.booking,
              status: b.status,
              notes: b.notes ?? undefined,
            });
          }
        }

        // Sort by startDate
        results.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime());

        return results;
      }, "Erro ao buscar eventos unificados do calendário");
    }),

  /**
   * Retorna alertas de vacinas e preventivos próximos do vencimento
   */
  getAlerts: adminProcedure
    .input(
      z.object({
        daysAhead: z.number().optional().default(30),
      }).optional()
    )
    .query(async ({ input }) => {
      return safeAsync(async () => {
        const daysAhead = input?.daysAhead ?? 30;
        const now = new Date();
        const limitDate = addDays(now, daysAhead);
        const alerts: CalendarAlert[] = [];

        // ── Vaccine alerts ──
        const vaccineAlerts = await db
          .select({
            vaccination: petVaccinations,
            petName: pets.name,
            vaccineName: vaccineLibrary.name,
          })
          .from(petVaccinations)
          .innerJoin(pets, eq(petVaccinations.petId, pets.id))
          .innerJoin(vaccineLibrary, eq(petVaccinations.vaccineId, vaccineLibrary.id))
          .where(
            and(
              gte(petVaccinations.nextDueDate, now),
              lte(petVaccinations.nextDueDate, limitDate)
            )
          );

        for (const row of vaccineAlerts) {
          const daysRemaining = differenceInCalendarDays(row.vaccination.nextDueDate!, now);
          alerts.push({
            petId: row.vaccination.petId,
            petName: row.petName,
            type: "vaccine",
            itemName: row.vaccineName,
            dueDate: row.vaccination.nextDueDate!.toISOString(),
            daysRemaining,
            urgency: getUrgency(daysRemaining),
          });
        }

        // ── Preventive alerts ──
        const preventiveAlerts = await db
          .select({
            treatment: preventiveTreatments,
            petName: pets.name,
          })
          .from(preventiveTreatments)
          .innerJoin(pets, eq(preventiveTreatments.petId, pets.id))
          .where(
            and(
              gte(preventiveTreatments.nextDueDate, now),
              lte(preventiveTreatments.nextDueDate, limitDate)
            )
          );

        for (const row of preventiveAlerts) {
          const daysRemaining = differenceInCalendarDays(row.treatment.nextDueDate!, now);
          alerts.push({
            petId: row.treatment.petId,
            petName: row.petName,
            type: "preventive",
            itemName: `${row.treatment.productName} (${row.treatment.type})`,
            dueDate: row.treatment.nextDueDate!.toISOString(),
            daysRemaining,
            urgency: getUrgency(daysRemaining),
          });
        }

        // Sort by urgency (red first) then daysRemaining
        const urgencyOrder = { red: 0, yellow: 1, green: 2 };
        alerts.sort((a, b) => {
          const urgDiff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
          if (urgDiff !== 0) return urgDiff;
          return a.daysRemaining - b.daysRemaining;
        });

        return alerts;
      }, "Erro ao buscar alertas do calendário");
    }),

  /**
   * Retorna resumo do dia: creche, hospedagem, eventos, vacinas
   */
  getDaySummary: adminProcedure
    .input(
      z.object({
        date: z.string(),
      })
    )
    .query(async ({ input }) => {
      return safeAsync(async () => {
        const targetDate = new Date(input.date);
        const dayStart = startOfDay(targetDate);
        const dayEnd = endOfDay(targetDate);

        // Pets in daycare: checkin events on this day with no matching checkout
        const checkinEvents = await db
          .select({ petId: calendarEvents.petId, eventType: calendarEvents.eventType })
          .from(calendarEvents)
          .where(
            and(
              gte(calendarEvents.eventDate, dayStart),
              lte(calendarEvents.eventDate, dayEnd),
              sql`${calendarEvents.eventType} IN ('checkin', 'checkout')`
            )
          );

        const checkins = new Set<number>();
        const checkouts = new Set<number>();
        for (const ev of checkinEvents) {
          if (!ev.petId) continue;
          if (ev.eventType === "checkin") checkins.add(ev.petId);
          if (ev.eventType === "checkout") checkouts.add(ev.petId);
        }
        // Pets still in daycare = checked in but not checked out
        const petsInDaycare = Array.from(checkins).filter((id) => !checkouts.has(id)).length;

        // Pets hosted: hotel bookings overlapping this day
        const hotelBookings = await db
          .select({ id: bookingRequests.id })
          .from(bookingRequests)
          .where(
            and(
              eq(bookingRequests.status, "approved"),
              eq(bookingRequests.requestType, "hotel"),
              lte(bookingRequests.startDate, dayEnd),
              gte(bookingRequests.endDate, dayStart)
            )
          );
        const petsHosted = hotelBookings.length;

        // Total events on this day
        const allEvents = await db
          .select({ id: calendarEvents.id })
          .from(calendarEvents)
          .where(
            and(
              gte(calendarEvents.eventDate, dayStart),
              lte(calendarEvents.eventDate, dayEnd)
            )
          );
        const eventsCount = allEvents.length;

        // Vaccines due on this day
        const vaccinesDueRows = await db
          .select({ id: petVaccinations.id })
          .from(petVaccinations)
          .where(
            and(
              gte(petVaccinations.nextDueDate, dayStart),
              lte(petVaccinations.nextDueDate, dayEnd)
            )
          );
        const vaccinesDue = vaccinesDueRows.length;

        return {
          petsInDaycare,
          petsHosted,
          eventsCount,
          vaccinesDue,
        };
      }, "Erro ao buscar resumo do dia");
    }),
});
