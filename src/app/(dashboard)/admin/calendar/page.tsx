"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
import { Calendar, Dog, Moon, CalendarDays } from "lucide-react";
import { toast } from "sonner";
import {
  startOfDay,
  endOfDay,
  startOfWeek,
  endOfWeek,
  startOfMonth,
  endOfMonth,
} from "date-fns";
import {
  CalendarToolbar,
  CalendarDayView,
  CalendarWeekView,
  CalendarMonthView,
  CalendarAlertsPanel,
  CalendarCheckinDialog,
  CalendarCheckoutDialog,
} from "@/components/calendar";
import type {
  CalendarView,
  CalendarFilters,
  CalendarAlert,
  UnifiedCalendarEvent,
} from "@/components/calendar";
import { CalendarSkeleton } from "@/components/shared/skeletons";

// ─── Helpers ────────────────────────────────────────────────

function getDateRange(view: CalendarView, date: Date) {
  switch (view) {
    case "day":
      return { start: startOfDay(date), end: endOfDay(date) };
    case "week":
      return {
        start: startOfWeek(date, { weekStartsOn: 1 }),
        end: endOfWeek(date, { weekStartsOn: 1 }),
      };
    case "month":
      return { start: startOfMonth(date), end: endOfMonth(date) };
  }
}

/** Map router alert type ("vaccine"|"preventive") to component type ("Vacina"|"Preventivo") */
function mapAlertType(type: string): CalendarAlert["type"] {
  return type === "vaccine" ? "Vacina" : "Preventivo";
}

// ─── Page ───────────────────────────────────────────────────

export default function AdminCalendarPage() {
  // State
  const [view, setView] = useState<CalendarView>("day");
  const [date, setDate] = useState(new Date());
  const [filters, setFilters] = useState<CalendarFilters>({ types: [] });
  const [checkoutPet, setCheckoutPet] = useState<{
    id: number;
    name: string;
  } | null>(null);

  // Date range for queries
  const { start: rangeStart, end: rangeEnd } = useMemo(
    () => getDateRange(view, date),
    [view, date]
  );

  // ─── Queries ──────────────────────────────────────────────

  const {
    data: events,
    isLoading: eventsLoading,
    refetch: refetchEvents,
  } = trpc.unifiedCalendar.getEvents.useQuery({
    start: rangeStart.toISOString(),
    end: rangeEnd.toISOString(),
    type: filters.types.length === 1 ? filters.types[0] : undefined,
    petId: filters.petId,
    tutorId: filters.tutorId,
  });

  const { data: alertsRaw } = trpc.unifiedCalendar.getAlerts.useQuery({
    daysAhead: 30,
  });

  const { data: daySummary } = trpc.unifiedCalendar.getDaySummary.useQuery(
    { date: date.toISOString() },
    { enabled: view === "day" }
  );

  const { data: petsData } = trpc.pets.list.useQuery();
  const { data: tutorsData } = trpc.tutors.list.useQuery();

  // ─── Derived data ─────────────────────────────────────────

  const pets: Array<{ id: number; name: string }> = useMemo(
    () => (petsData ?? []).map((p: any) => ({ id: p.id, name: p.name })),
    [petsData]
  );

  const tutors: Array<{ id: number; name: string }> = useMemo(
    () => (tutorsData ?? []).map((t: any) => ({ id: t.id, name: t.name })),
    [tutorsData]
  );

  /** Filter events client-side when multiple types are selected */
  const filteredEvents: UnifiedCalendarEvent[] = useMemo(() => {
    const raw = (events ?? []) as UnifiedCalendarEvent[];
    if (filters.types.length <= 1) return raw;
    return raw.filter((ev) => filters.types.includes(ev.type));
  }, [events, filters.types]);

  /** Map alerts from router shape to component shape */
  const alerts: CalendarAlert[] = useMemo(
    () =>
      (alertsRaw ?? []).map((a: any) => ({
        ...a,
        type: mapAlertType(a.type),
      })),
    [alertsRaw]
  );

  // ─── Handlers ─────────────────────────────────────────────

  function handleDayClick(clickedDate: Date) {
    setDate(clickedDate);
    setView("day");
  }

  function handleCheckout(petId: number) {
    const pet = pets.find((p) => p.id === petId);
    if (pet) {
      setCheckoutPet({ id: petId, name: pet.name });
    }
  }

  function handleNotifyAlert(alert: CalendarAlert) {
    toast.success(`Notificação enviada para tutor de ${alert.petName} sobre ${alert.itemName}`);
  }

  function handleMutationSuccess() {
    refetchEvents();
  }

  // ─── Loading ──────────────────────────────────────────────

  if (eventsLoading && !events) {
    return <CalendarSkeleton />;
  }

  // ─── Render ───────────────────────────────────────────────

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-icon">
            <Calendar />
          </div>
          <div className="page-header-info">
            <h1>Calendário</h1>
            <p>Visualize creche, hospedagem, vacinas e eventos em um só lugar</p>
          </div>
        </div>
        <CalendarCheckinDialog pets={pets} onSuccess={handleMutationSuccess} />
      </div>

      {/* 1. Alerts panel */}
      {alerts.length > 0 && (
        <CalendarAlertsPanel alerts={alerts} onNotifyNow={handleNotifyAlert} />
      )}

      {/* 2. Toolbar */}
      <CalendarToolbar
        view={view}
        onViewChange={setView}
        date={date}
        onDateChange={setDate}
        filters={filters}
        onFiltersChange={setFilters}
        pets={pets}
        tutors={tutors}
      />

      {/* 3. Day summary (only in day view) */}
      {view === "day" && daySummary && (
        <div className="flex flex-wrap items-center gap-3 rounded-xl border border-border/40 bg-card px-4 py-2.5">
          <div className="flex items-center gap-1.5">
            <Dog className="h-4 w-4 text-teal-600 dark:text-teal-400" />
            <span className="text-sm font-medium text-foreground">
              {daySummary.petsInDaycare} pets na creche
            </span>
          </div>
          <span className="text-muted-foreground">·</span>
          <div className="flex items-center gap-1.5">
            <Moon className="h-4 w-4 text-violet-600 dark:text-violet-400" />
            <span className="text-sm text-muted-foreground">
              {daySummary.petsHosted} hospedados
            </span>
          </div>
          <span className="text-muted-foreground">·</span>
          <div className="flex items-center gap-1.5">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {daySummary.eventsCount} eventos
            </span>
          </div>
          {daySummary.vaccinesDue > 0 && (
            <>
              <span className="text-muted-foreground">·</span>
              <span className="text-sm font-medium text-amber-600 dark:text-amber-400">
                {daySummary.vaccinesDue} vacinas pendentes
              </span>
            </>
          )}
        </div>
      )}

      {/* 4. View component */}
      {view === "day" && (
        <CalendarDayView
          events={filteredEvents}
          date={date}
          onCheckin={() => {
            // The CalendarCheckinDialog manages its own trigger, so we just let it be
          }}
          onCheckout={handleCheckout}
        />
      )}

      {view === "week" && (
        <CalendarWeekView
          events={filteredEvents}
          weekStart={startOfWeek(date, { weekStartsOn: 1 })}
          onDayClick={handleDayClick}
        />
      )}

      {view === "month" && (
        <CalendarMonthView
          events={filteredEvents}
          month={date}
          onDayClick={handleDayClick}
        />
      )}

      {/* 5. Check-out dialog */}
      {checkoutPet && (
        <CalendarCheckoutDialog
          petId={checkoutPet.id}
          petName={checkoutPet.name}
          open={!!checkoutPet}
          onOpenChange={(open) => {
            if (!open) setCheckoutPet(null);
          }}
          onSuccess={handleMutationSuccess}
        />
      )}
    </div>
  );
}
