"use client";

import { Button } from "@/components/ui/button";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { Bell, Syringe, Shield } from "lucide-react";
import { cn } from "@/lib/utils";
import { format, parseISO } from "date-fns";
import { ptBR } from "date-fns/locale";
import type { CalendarAlert } from "./types";

interface CalendarAlertsPanelProps {
  alerts: CalendarAlert[];
  onNotifyNow: (alert: CalendarAlert) => void;
}

const URGENCY_STYLES = {
  green: {
    border: "border-emerald-300 dark:border-emerald-700",
    bg: "bg-emerald-50/80 dark:bg-emerald-950/40",
    badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300",
  },
  yellow: {
    border: "border-amber-300 dark:border-amber-700",
    bg: "bg-amber-50/80 dark:bg-amber-950/40",
    badge: "bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300",
  },
  red: {
    border: "border-red-300 dark:border-red-700",
    bg: "bg-red-50/80 dark:bg-red-950/40",
    badge: "bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300",
  },
};

function urgencyLabel(daysRemaining: number): string {
  if (daysRemaining < 0) return `${Math.abs(daysRemaining)}d atrasado`;
  if (daysRemaining === 0) return "Hoje";
  return `${daysRemaining}d restantes`;
}

export function CalendarAlertsPanel({
  alerts,
  onNotifyNow,
}: CalendarAlertsPanelProps) {
  if (alerts.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Bell className="h-4 w-4 text-muted-foreground" />
        <h3 className="text-sm font-semibold text-foreground">
          Vencimentos próximos
        </h3>
      </div>

      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-2">
          {alerts.map((alert, idx) => {
            const styles = URGENCY_STYLES[alert.urgency];
            const TypeIcon =
              alert.type === "Vacina" ? Syringe : Shield;

            return (
              <div
                key={`${alert.petId}-${alert.itemName}-${idx}`}
                className={cn(
                  "flex min-w-[220px] max-w-[260px] flex-col gap-2 rounded-xl border p-3",
                  styles.border,
                  styles.bg
                )}
              >
                <div className="flex items-center gap-2">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-card">
                    <TypeIcon className="h-4 w-4 text-muted-foreground" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-foreground truncate">
                      {alert.petName}
                    </p>
                    <p className="text-xs text-muted-foreground truncate">
                      {alert.type} · {alert.itemName}
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">
                      {format(parseISO(alert.dueDate), "dd/MM/yyyy", {
                        locale: ptBR,
                      })}
                    </p>
                    <span
                      className={cn(
                        "mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] font-semibold",
                        styles.badge
                      )}
                    >
                      {urgencyLabel(alert.daysRemaining)}
                    </span>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    onClick={() => onNotifyNow(alert)}
                  >
                    Notificar
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
