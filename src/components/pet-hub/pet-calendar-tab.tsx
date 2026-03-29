"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Plus, Trash2, Clock, MapPin, ChevronLeft, ChevronRight } from "lucide-react";
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth, addMonths, subMonths } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useState, useMemo } from "react";

interface PetCalendarTabProps {
  petId: number;
  role: "admin" | "tutor";
}

const STATUS_LABELS: Record<string, { label: string; variant: "success" | "info" | "warning" | "secondary" | "destructive" }> = {
  scheduled: { label: "Agendado", variant: "info" },
  completed: { label: "Concluído", variant: "success" },
  cancelled: { label: "Cancelado", variant: "destructive" },
  pending: { label: "Pendente", variant: "warning" },
};

const WEEKDAY_LABELS = ["D", "S", "T", "Q", "Q", "S", "S"];

function MiniCalendar({ events, currentMonth, onMonthChange }: {
  events: Array<{ eventDate: string | Date }>;
  currentMonth: Date;
  onMonthChange: (date: Date) => void;
}) {
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
  const startDow = getDay(monthStart);
  const today = new Date();

  const eventDates = useMemo(() => {
    const set = new Set<string>();
    for (const e of events) {
      const d = new Date(e.eventDate);
      if (isSameMonth(d, currentMonth)) {
        set.add(format(d, "yyyy-MM-dd"));
      }
    }
    return set;
  }, [events, currentMonth]);

  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-3">
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 transition-colors duration-200"
            onClick={() => onMonthChange(subMonths(currentMonth, 1))}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm font-medium text-foreground capitalize">
            {format(currentMonth, "MMMM yyyy", { locale: ptBR })}
          </span>
          <Button
            variant="ghost"
            size="sm"
            className="h-7 w-7 p-0 transition-colors duration-200"
            onClick={() => onMonthChange(addMonths(currentMonth, 1))}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        {/* Weekday headers */}
        <div className="grid grid-cols-7 gap-0.5 mb-1">
          {WEEKDAY_LABELS.map((d, i) => (
            <div key={i} className="text-center text-[10px] text-muted-foreground font-medium py-1">
              {d}
            </div>
          ))}
        </div>
        {/* Days */}
        <div className="grid grid-cols-7 gap-0.5">
          {/* Empty cells for offset */}
          {Array.from({ length: startDow }).map((_, i) => (
            <div key={`empty-${i}`} className="h-8" />
          ))}
          {days.map((day) => {
            const key = format(day, "yyyy-MM-dd");
            const hasEvent = eventDates.has(key);
            const isToday = isSameDay(day, today);
            return (
              <div
                key={key}
                className={`h-8 flex flex-col items-center justify-center rounded-md text-xs transition-colors duration-200 ${
                  isToday ? "bg-primary/10 font-bold text-primary" : "text-foreground"
                }`}
              >
                <span>{day.getDate()}</span>
                {hasEvent && (
                  <span className="h-1 w-1 rounded-full bg-primary mt-0.5" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

export function PetCalendarTab({ petId, role }: PetCalendarTabProps) {
  const { data, isLoading } = trpc.calendar.byPet.useQuery({ petId });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <Skeleton className="h-48 w-full rounded-lg" />
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-24" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Sort upcoming events
  const now = new Date();
  const upcoming = (data ?? [])
    .filter((e) => new Date(e.eventDate) >= now && e.status !== "cancelled")
    .sort((a, b) => new Date(a.eventDate).getTime() - new Date(b.eventDate).getTime());

  return (
    <div className="space-y-4">
      {/* Mini Month View */}
      <MiniCalendar
        events={(data ?? []).map((e) => ({ eventDate: e.eventDate }))}
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
      />

      {/* Events List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Próximos Eventos
            </CardTitle>
            <Button variant="outline" size="sm" className="gap-1.5 transition-all duration-200 hover:bg-primary/5">
              <Plus className="h-3.5 w-3.5" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {data && data.length > 0 ? (
            <div className="space-y-3">
              {(upcoming.length > 0 ? upcoming : data).map((event) => {
                const statusInfo = STATUS_LABELS[event.status ?? "scheduled"] ?? STATUS_LABELS.scheduled;
                return (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-3 rounded-lg border text-sm transition-all duration-200 hover:bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        {event.color && (
                          <span
                            className="w-2.5 h-2.5 rounded-full shrink-0"
                            style={{ backgroundColor: event.color }}
                          />
                        )}
                        <p className="font-medium truncate">{event.title}</p>
                        <Badge variant={statusInfo.variant} className="text-[10px]">
                          {statusInfo.label}
                        </Badge>
                        {event.typeInfo && (
                          <Badge variant="secondary" className="text-[10px]">
                            {event.typeInfo.label}
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground text-xs mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(event.eventDate), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                        </span>
                        {event.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {event.location}
                          </span>
                        )}
                      </div>
                      {event.description && (
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                          {event.description}
                        </p>
                      )}
                    </div>
                    {role === "admin" && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0 transition-colors duration-200">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Calendar className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">Nenhum evento registrado</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Agende consultas, banhos e outros compromissos.</p>
              <Button variant="outline" size="sm" className="mt-4 gap-1.5 transition-all duration-200">
                <Plus className="h-3.5 w-3.5" /> Adicionar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
