/**
 * Notification Engine
 *
 * Runs on a daily cron schedule. For each active notificationRule it
 * calculates a target date, queries the matching records (vaccines,
 * preventive treatments, plan renewals), resolves the pet's tutors,
 * de-duplicates via notificationLog, and dispatches in-app + WhatsApp
 * alerts.
 */

import { db } from "@/lib/db";
import {
  notificationRules,
  notificationLog,
} from "@/lib/db/schema-notifications";
import {
  petVaccinations,
  preventiveTreatments,
  notifications,
  petTutors,
  users,
  pets,
  vaccineLibrary,
} from "@/lib/db/schema";
import { petPlans } from "@/lib/db/schema-plans";
import { eq, and, sql } from "drizzle-orm";
import { WhatsAppService, WhatsAppTemplates } from "@/lib/services/whatsapp";
import { inngest } from "@/lib/inngest/client";

// ============================================
// Types
// ============================================

interface MatchedRecord {
  referenceType: string;
  referenceId: number;
  petId: number;
  petName: string;
  /** Human-readable label for the event (vaccine name, product name, plan name) */
  label: string;
  /** Formatted target date string (dd/MM/yyyy) */
  dateLabel: string;
  dosage?: string;
}

interface CheckResult {
  checked: number;
  sent: number;
  errors: number;
}

// ============================================
// Helpers
// ============================================

function formatDateBR(date: Date): string {
  const dd = String(date.getDate()).padStart(2, "0");
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const yyyy = date.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

/**
 * Resolve tutors for a given pet via petTutors join users.
 * Returns tutor user rows that have not been soft-deleted.
 */
async function getTutorsForPet(petId: number) {
  const rows = await db
    .select({
      userId: users.id,
      name: users.name,
      phone: users.phone,
      role: users.role,
    })
    .from(petTutors)
    .innerJoin(users, eq(petTutors.tutorId, users.id))
    .where(and(eq(petTutors.petId, petId), sql`${users.deletedAt} IS NULL`));

  return rows;
}

/**
 * Get all admin users (for in-app notifications).
 */
async function getAdminUsers() {
  return db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.role, "admin"), sql`${users.deletedAt} IS NULL`));
}

/**
 * Check if a notification has already been sent for this reference.
 */
async function alreadySent(
  referenceType: string,
  referenceId: number,
  userId: number,
): Promise<boolean> {
  const [row] = await db
    .select({ id: notificationLog.id })
    .from(notificationLog)
    .where(
      and(
        eq(notificationLog.referenceType, referenceType),
        eq(notificationLog.referenceId, referenceId),
        eq(notificationLog.userId, userId),
      ),
    )
    .limit(1);

  return !!row;
}

// ============================================
// Event-type handlers
// ============================================

async function queryVaccines(targetDateStr: string): Promise<MatchedRecord[]> {
  const rows = await db
    .select({
      id: petVaccinations.id,
      petId: petVaccinations.petId,
      petName: pets.name,
      vaccineName: vaccineLibrary.name,
    })
    .from(petVaccinations)
    .innerJoin(pets, eq(petVaccinations.petId, pets.id))
    .innerJoin(vaccineLibrary, eq(petVaccinations.vaccineId, vaccineLibrary.id))
    .where(sql`DATE(${petVaccinations.nextDueDate}) = ${targetDateStr}`);

  return rows.map((r) => ({
    referenceType: "vaccine",
    referenceId: r.id,
    petId: r.petId,
    petName: r.petName,
    label: r.vaccineName,
    dateLabel: formatDateBR(new Date(targetDateStr)),
  }));
}

async function queryPreventive(targetDateStr: string): Promise<MatchedRecord[]> {
  const rows = await db
    .select({
      id: preventiveTreatments.id,
      petId: preventiveTreatments.petId,
      petName: pets.name,
      productName: preventiveTreatments.productName,
      dosage: preventiveTreatments.dosage,
    })
    .from(preventiveTreatments)
    .innerJoin(pets, eq(preventiveTreatments.petId, pets.id))
    .where(sql`DATE(${preventiveTreatments.nextDueDate}) = ${targetDateStr}`);

  return rows.map((r) => ({
    referenceType: "preventive",
    referenceId: r.id,
    petId: r.petId,
    petName: r.petName,
    label: r.productName,
    dateLabel: formatDateBR(new Date(targetDateStr)),
    dosage: r.dosage ?? undefined,
  }));
}

async function queryPlanRenewal(targetDayOfMonth: number): Promise<MatchedRecord[]> {
  const rows = await db
    .select({
      id: petPlans.id,
      petId: petPlans.petId,
      petName: pets.name,
      customName: petPlans.customName,
    })
    .from(petPlans)
    .innerJoin(pets, eq(petPlans.petId, pets.id))
    .where(
      and(
        eq(petPlans.status, "active"),
        eq(petPlans.renewalDay, targetDayOfMonth),
      ),
    );

  return rows.map((r) => ({
    referenceType: "plan_renewal",
    referenceId: r.id,
    petId: r.petId,
    petName: r.petName,
    label: r.customName ?? "Plano mensalista",
    dateLabel: formatDateBR(new Date()),
  }));
}

// ============================================
// Dispatch helpers
// ============================================

async function sendAppNotification(
  userId: number,
  petId: number,
  title: string,
  message: string,
  type: string = "info",
) {
  await db.insert(notifications).values({
    userId,
    petId,
    title,
    message,
    type,
    isRead: false,
  });
}

async function sendWhatsApp(
  phone: string,
  message: string,
  petId: number,
  tutorId: number,
) {
  try {
    // Try Inngest first for resilient delivery
    await inngest.send({
      name: "whatsapp/send.message",
      data: {
        to: phone,
        message,
        petId,
        tutorId,
      },
    });
  } catch {
    // Fallback: send directly via WhatsAppService
    const service = WhatsAppService.fromEnv();
    if (service) {
      await service.sendText(phone, message, { petId });
    }
  }
}

// ============================================
// Main engine
// ============================================

export async function runNotificationCheck(): Promise<CheckResult> {
  const result: CheckResult = { checked: 0, sent: 0, errors: 0 };

  // 1. Fetch active rules
  const rules = await db
    .select()
    .from(notificationRules)
    .where(eq(notificationRules.isActive, true));

  // Pre-fetch admin users once
  const admins = await getAdminUsers();

  for (const rule of rules) {
    try {
      const daysBefore = rule.daysBeforeCustom ?? rule.daysBeforeDefault;

      // Calculate target date
      const targetDate = new Date();
      targetDate.setDate(targetDate.getDate() + daysBefore);
      const targetDateStr = targetDate.toISOString().split("T")[0];

      // 2. Query matching records based on event type
      let matches: MatchedRecord[] = [];

      switch (rule.eventType) {
        case "vaccine":
          matches = await queryVaccines(targetDateStr);
          break;
        case "preventive":
          matches = await queryPreventive(targetDateStr);
          break;
        case "plan_renewal":
          matches = await queryPlanRenewal(targetDate.getDate());
          break;
        default:
          console.warn(`[NotificationEngine] Unknown eventType: ${rule.eventType}`);
          continue;
      }

      result.checked += matches.length;

      // 3. For each match, resolve tutors and dispatch
      for (const match of matches) {
        try {
          const tutors = await getTutorsForPet(match.petId);

          for (const tutor of tutors) {
            // De-dup check
            if (await alreadySent(match.referenceType, match.referenceId, tutor.userId)) {
              continue;
            }

            // Build notification text
            let title: string;
            let message: string;
            let whatsappMessage: string | undefined;

            switch (rule.eventType) {
              case "vaccine":
                title = `Vacina pendente: ${match.label}`;
                message = `O pet ${match.petName} tem vacina de ${match.label} prevista para ${match.dateLabel}.`;
                whatsappMessage = WhatsAppTemplates.vaccineReminder(
                  match.petName,
                  match.label,
                  match.dateLabel,
                );
                break;
              case "preventive":
                title = `Tratamento preventivo: ${match.label}`;
                message = `O pet ${match.petName} tem aplicação de ${match.label} prevista para ${match.dateLabel}.`;
                whatsappMessage = WhatsAppTemplates.medicationReminder(
                  match.petName,
                  match.label,
                  match.dosage ?? "",
                );
                break;
              case "plan_renewal":
                title = `Renovação de plano: ${match.label}`;
                message = `O plano "${match.label}" do pet ${match.petName} vence em breve.`;
                whatsappMessage = `🔔 Renovação de Plano\n\nOlá ${tutor.name}! O plano "${match.label}" do(a) ${match.petName} está próximo da renovação.\n\nEntre em contato para renovar! 💙`;
                break;
            }

            // In-app notification for tutor
            if (rule.notifyApp) {
              await sendAppNotification(tutor.userId, match.petId, title!, message!, "warning");

              // Also notify admins
              for (const admin of admins) {
                if (await alreadySent(match.referenceType, match.referenceId, admin.id)) {
                  continue;
                }
                await sendAppNotification(admin.id, match.petId, title!, message!, "info");
                await db.insert(notificationLog).values({
                  ruleId: rule.id,
                  petId: match.petId,
                  userId: admin.id,
                  channel: "app",
                  referenceType: match.referenceType,
                  referenceId: match.referenceId,
                  status: "sent",
                });
              }
            }

            // WhatsApp notification for tutor
            if (rule.notifyWhatsapp && tutor.phone && whatsappMessage) {
              await sendWhatsApp(tutor.phone, whatsappMessage, match.petId, tutor.userId);
            }

            // Log for tutor (covers both channels)
            await db.insert(notificationLog).values({
              ruleId: rule.id,
              petId: match.petId,
              userId: tutor.userId,
              channel: rule.notifyWhatsapp && tutor.phone ? "whatsapp" : "app",
              referenceType: match.referenceType,
              referenceId: match.referenceId,
              status: "sent",
            });

            result.sent++;
          }
        } catch (err) {
          console.error(
            `[NotificationEngine] Error processing match ${match.referenceType}:${match.referenceId}`,
            err,
          );
          result.errors++;
        }
      }
    } catch (err) {
      console.error(`[NotificationEngine] Error processing rule ${rule.id}`, err);
      result.errors++;
    }
  }

  console.log(`[NotificationEngine] Done: ${JSON.stringify(result)}`);
  return result;
}
