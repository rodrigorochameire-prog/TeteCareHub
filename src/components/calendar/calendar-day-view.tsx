"use client";

import { useMemo } from "react";
import { cn } from "@/lib/utils";
import { Moon, LogIn, Plus } from "lucide-react";
import { format, parseISO, differenceInCalendarDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { UnifiedCalendarEvent } from "./types";

const HOURS = Array.from({ length: 15 }, (_, i) => i + 6); // 6h–20h

interface CalendarDayViewProps {
  events: UnifiedCalendarEvent[];
  date: Date;
  onCheckin: () => void;
  onCheckout: (petId: number) => void;
}

function getTopAndHeight(startTime?: string, endTime?: string) {
  const [sh, sm] = (startTime ?? "08:00").split(":").map(Number);
  const [eh, em] = (endTime ?? "17:00").split(":").map(Number);
  const startMinutes = (sh - 6) * 60 + sm;
  const endMinutes = (eh - 6) * 60 + em;
  const top = (startMinutes / (14 * 60)) * 100;
  const height = Math.max(((endMinutes - startMinutes) / (14 * 60)) * 100, 2);
  return { top: `${top}%`, height: `${height}%` };
}

function formatTimeRange(startTime?: string, endTime?: string): string {
  return `${startTime ?? "08:00"} → ${endTime ?? "17:00"}`;
}

function getHospedagemDayLabel(
  event: UnifiedCalendarEvent,
  currentDate: Date
): string {
  if (!event.startDate || !event.endDate) return "";
  const start = parseISO(event.startDate);
  const end = parseISO(event.endDate);
  const totalDays = differenceInCalendarDays(end, start) + 1;
  const currentDay = differenceInCalendarDays(currentDate, start) + 1;
  const startStr = format(start, "dd/MM", { locale: ptBR });
  const endStr = format(end, "dd/MM", { locale: ptBR });
  return `Dia ${currentDay} de ${totalDays} · ${startStr}–${endStr}`;
}

export function CalendarDayView({
  events,
  date,
  onCheckin,
  onCheckout,
}: CalendarDayViewProps) {
  const { crecheCount, hospedagemCount } = useMemo(() => {
    let creche = 0;
    let hospedagem = 0;
    for (const ev of events) {
      if (ev.type === "hospedagem") hospedagem++;
      else if (ev.type === "creche" || ev.type === "checkin") creche++;
    }
    return { crecheCount: creche, hospedagemCount: hospedagem };
  }, [events]);

  return (
    <div className="space-y-3">
      {/* Resumo do dia */}
      <div className="flex items-center gap-3 rounded-xl border border-border/40 bg-card px-4 py-2.5">
        <span className="text-sm font-medium text-foreground">
          {crecheCount + hospedagemCount} pets
        </span>
        <span className="text-muted-foreground">·</span>
        <span className="text-sm text-muted-foreground">
          {hospedagemCount} hospedados
        </span>
      </div>

      {/* Timeline */}
      <div className="relative rounded-xl border border-border/40 bg-card">
        {/* Horários */}
        <div className="relative" style={{ height: "840px" }}>
          {HOURS.map((hour) => {
            const topPct = ((hour - 6) / 14) * 100;
            return (
              <div
                key={hour}
                className="absolute left-0 right-0 border-t border-border/20"
                style={{ top: `${topPct}%` }}
              >
                <span className="absolute -top-2.5 left-2 text-xs text-muted-foreground">
                  {String(hour).padStart(2, "0")}:00
                </span>
              </div>
            );
          })}

          {/* Área clicável para novo check-in */}
          <button
            type="button"
            className="absolute inset-0 left-16 cursor-pointer opacity-0 hover:opacity-100 transition-opacity"
            onClick={onCheckin}
            aria-label="Novo check-in"
          >
            <div className="flex h-full items-center justify-center">
              <div className="flex items-center gap-1.5 rounded-lg bg-primary/10 px-3 py-1.5 text-sm text-primary">
                <Plus className="h-4 w-4" />
                Novo check-in
              </div>
            </div>
          </button>

          {/* Eventos */}
          {events.map((event, idx) => {
            const isHospedagem = event.type === "hospedagem";
            const style = getTopAndHeight(event.startTime, event.endTime);

            return (
              <button
                key={event.id}
                type="button"
                className={cn(
                  "absolute left-16 right-4 rounded-lg px-3 py-1.5 text-left transition-all hover:shadow-md cursor-pointer",
                  "border-l-4",
                  isHospedagem
                    ? "border-l-violet-500 bg-violet-50 dark:bg-violet-950/40"
                    : "bg-teal-50 dark:bg-teal-950/40 border-l-teal-500"
                )}
                style={{
                  top: style.top,
                  height: style.height,
                  zIndex: 10 + idx,
                }}
                onClick={() => onCheckout(event.petId)}
                aria-label={`Check-out ${event.petName}`}
              >
                <div className="flex items-center gap-1.5">
                  {isHospedagem && (
                    <Moon className="h-3.5 w-3.5 text-violet-600 dark:text-violet-400" />
                  )}
                  {!isHospedagem && (
                    <LogIn className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
                  )}
                  <span
                    className={cn(
                      "text-sm font-medium truncate",
                      isHospedagem
                        ? "text-violet-800 dark:text-violet-200"
                        : "text-teal-800 dark:text-teal-200"
                    )}
                  >
                    {event.petName}
                  </span>
                </div>
                <p
                  className={cn(
                    "text-xs mt-0.5 truncate",
                    isHospedagem
                      ? "text-violet-600 dark:text-violet-400"
                      : "text-teal-600 dark:text-teal-400"
                  )}
                >
                  {isHospedagem
                    ? getHospedagemDayLabel(event, date)
                    : formatTimeRange(event.startTime, event.endTime)}
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
