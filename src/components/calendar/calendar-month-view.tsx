"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  isSameMonth,
  isToday,
  parseISO,
  isWithinInterval,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { UnifiedCalendarEvent } from "./types";

const WEEK_DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

const DOT_COLORS: Record<string, string> = {
  creche: "bg-teal-400",
  checkin: "bg-teal-400",
  hospedagem: "bg-violet-400",
  vaccination: "bg-blue-400",
  medication: "bg-purple-400",
  medical: "bg-rose-400",
  preventive: "bg-cyan-400",
  general: "bg-amber-400",
};

interface CalendarMonthViewProps {
  events: UnifiedCalendarEvent[];
  month: Date;
  onDayClick: (date: Date) => void;
}

export function CalendarMonthView({
  events,
  month,
  onDayClick,
}: CalendarMonthViewProps) {
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(month);
    const monthEnd = endOfMonth(month);
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 });
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });

    const days: Date[] = [];
    let current = calStart;
    while (current <= calEnd) {
      days.push(current);
      current = addDays(current, 1);
    }
    return days;
  }, [month]);

  function getEventsForDay(day: Date): UnifiedCalendarEvent[] {
    return events.filter((ev) => {
      const start = parseISO(ev.startDate);
      const end = ev.endDate ? parseISO(ev.endDate) : start;
      return isWithinInterval(day, { start, end }) || isSameDay(day, start);
    });
  }

  function countCheckins(dayEvents: UnifiedCalendarEvent[]): number {
    return dayEvents.filter(
      (ev) => ev.type === "creche" || ev.type === "checkin"
    ).length;
  }

  return (
    <div className="rounded-xl border border-border/40 bg-card overflow-hidden">
      {/* Cabeçalho dos dias da semana */}
      <div className="grid grid-cols-7 border-b border-border/20">
        {WEEK_DAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-center text-xs font-medium text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>

      {/* Grid de dias */}
      <div className="grid grid-cols-7 gap-px bg-border/20">
        {calendarDays.map((day) => {
          const dayEvents = getEventsForDay(day);
          const checkinCount = countCheckins(dayEvents);
          const inMonth = isSameMonth(day, month);
          const today = isToday(day);

          // Até 4 dots, depois "+N mais"
          const maxDots = 4;
          const visibleEvents = dayEvents.slice(0, maxDots);
          const extraCount = dayEvents.length - maxDots;

          return (
            <button
              key={day.toISOString()}
              type="button"
              onClick={() => onDayClick(day)}
              className={cn(
                "min-h-[80px] bg-card p-1.5 text-left transition-colors hover:bg-accent/30 cursor-pointer",
                !inMonth && "opacity-40",
                today && "bg-primary/5"
              )}
            >
              <div className="flex items-start justify-between">
                <span
                  className={cn(
                    "inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                    today &&
                      "bg-primary text-primary-foreground",
                    !today && inMonth && "text-foreground",
                    !today && !inMonth && "text-muted-foreground"
                  )}
                >
                  {format(day, "d")}
                </span>
                {checkinCount > 0 && (
                  <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-teal-100 dark:bg-teal-900/40 px-1 text-[10px] font-semibold text-teal-700 dark:text-teal-300">
                    {checkinCount}
                  </span>
                )}
              </div>

              {/* Dots dos eventos */}
              <div className="mt-1 flex flex-wrap gap-1">
                {visibleEvents.map((ev) => (
                  <span
                    key={ev.id}
                    className={cn(
                      "h-2 w-2 rounded-full",
                      DOT_COLORS[ev.type] ?? "bg-muted-foreground"
                    )}
                    title={`${ev.petName} – ${ev.title}`}
                  />
                ))}
                {extraCount > 0 && (
                  <span className="text-[10px] text-muted-foreground leading-none">
                    +{extraCount}
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
