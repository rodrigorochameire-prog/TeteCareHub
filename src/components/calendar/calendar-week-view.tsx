"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Moon } from "lucide-react";
import {
  format,
  addDays,
  isSameDay,
  isToday,
  parseISO,
  isWithinInterval,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import type { UnifiedCalendarEvent } from "./types";

const DAY_LABELS = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb", "Dom"];

interface CalendarWeekViewProps {
  events: UnifiedCalendarEvent[];
  weekStart: Date;
  onDayClick: (date: Date) => void;
}

function getEventsForDay(
  events: UnifiedCalendarEvent[],
  day: Date
): UnifiedCalendarEvent[] {
  return events.filter((ev) => {
    const start = parseISO(ev.startDate);
    const end = ev.endDate ? parseISO(ev.endDate) : start;
    return isWithinInterval(day, { start, end }) || isSameDay(day, start);
  });
}

const EVENT_COLOR_MAP: Record<string, string> = {
  creche: "border-l-teal-500",
  checkin: "border-l-teal-500",
  hospedagem: "border-l-violet-500",
  vaccination: "border-l-blue-500",
  medication: "border-l-purple-500",
  medical: "border-l-rose-500",
  preventive: "border-l-cyan-500",
  general: "border-l-amber-500",
};

export function CalendarWeekView({
  events,
  weekStart,
  onDayClick,
}: CalendarWeekViewProps) {
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart]
  );

  // Eventos de hospedagem que cruzam vários dias (renderizar barra no topo)
  const multiDayEvents = useMemo(
    () =>
      events.filter(
        (ev) =>
          ev.type === "hospedagem" &&
          ev.endDate &&
          ev.startDate !== ev.endDate
      ),
    [events]
  );

  return (
    <div className="space-y-2">
      {/* Barras de hospedagem multi-dia */}
      {multiDayEvents.map((ev) => {
        const start = parseISO(ev.startDate);
        const end = parseISO(ev.endDate!);

        // Calcular colunas de início/fim dentro da semana visível
        let colStart = 0;
        let colEnd = 6;
        for (let i = 0; i < 7; i++) {
          if (isSameDay(days[i], start) || days[i] > start) {
            colStart = i;
            break;
          }
        }
        for (let i = 6; i >= 0; i--) {
          if (isSameDay(days[i], end) || days[i] < end) {
            colEnd = i;
            break;
          }
        }

        return (
          <div
            key={`multi-${ev.id}`}
            className="flex items-center gap-1.5 rounded-lg bg-violet-50 dark:bg-violet-950/40 border border-violet-200 dark:border-violet-800 px-3 py-1.5 text-xs"
            style={{
              marginLeft: `${(colStart / 7) * 100}%`,
              width: `${((colEnd - colStart + 1) / 7) * 100}%`,
            }}
          >
            <Moon className="h-3 w-3 text-violet-600 dark:text-violet-400 shrink-0" />
            <span className="font-medium text-violet-800 dark:text-violet-200 truncate">
              {ev.petName}
            </span>
            <span className="text-violet-600 dark:text-violet-400 truncate">
              {format(start, "dd/MM", { locale: ptBR })}–
              {format(end, "dd/MM", { locale: ptBR })}
            </span>
          </div>
        );
      })}

      {/* Grid semanal */}
      <div className="grid grid-cols-7 gap-px rounded-xl border border-border/40 bg-border/20 overflow-hidden">
        {/* Cabeçalho */}
        {days.map((day, i) => (
          <div
            key={`header-${i}`}
            className={cn(
              "bg-card px-2 py-2 text-center",
              isToday(day) && "bg-primary/5"
            )}
          >
            <p className="text-xs text-muted-foreground">{DAY_LABELS[i]}</p>
            <button
              type="button"
              onClick={() => onDayClick(day)}
              className={cn(
                "mt-0.5 inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-medium transition-colors hover:bg-primary/10",
                isToday(day) && "bg-primary text-primary-foreground hover:bg-primary/90"
              )}
            >
              {format(day, "d")}
            </button>
          </div>
        ))}

        {/* Células com eventos */}
        {days.map((day, i) => {
          const dayEvents = getEventsForDay(events, day);
          return (
            <button
              key={`cell-${i}`}
              type="button"
              onClick={() => onDayClick(day)}
              className={cn(
                "min-h-[120px] bg-card p-1.5 text-left transition-colors hover:bg-accent/30 cursor-pointer",
                isToday(day) && "bg-primary/5"
              )}
            >
              <div className="space-y-1">
                {dayEvents.map((ev) => {
                  const borderColor =
                    EVENT_COLOR_MAP[ev.type] ?? "border-l-muted-foreground";
                  return (
                    <div
                      key={ev.id}
                      className={cn(
                        "rounded-md border-l-[3px] bg-muted/50 px-1.5 py-1 text-xs truncate",
                        borderColor
                      )}
                    >
                      <span className="font-medium text-foreground">
                        {ev.petName}
                      </span>
                      {ev.startTime && (
                        <span className="ml-1 text-muted-foreground">
                          {ev.startTime}
                        </span>
                      )}
                    </div>
                  );
                })}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
