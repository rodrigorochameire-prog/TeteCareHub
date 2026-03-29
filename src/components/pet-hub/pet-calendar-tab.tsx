"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
import { AddEventDialog } from "./dialogs/add-event-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import {
  Calendar,
  Plus,
  Trash2,
  Clock,
  MapPin,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  Syringe,
  Shield,
  DoorOpen,
  DoorClosed,
} from "lucide-react";
import {
  format,
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  getDay,
  isSameDay,
  isSameMonth,
  addMonths,
  subMonths,
  differenceInCalendarDays,
} from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

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

const URGENCY_STYLES: Record<string, { bg: string; border: string; text: string; badge: "destructive" | "warning" | "success" }> = {
  red: { bg: "bg-destructive/10", border: "border-destructive/30", text: "text-destructive", badge: "destructive" },
  yellow: { bg: "bg-warning/10", border: "border-warning/30", text: "text-warning", badge: "warning" },
  green: { bg: "bg-success/10", border: "border-success/30", text: "text-success", badge: "success" },
};

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

// ── Alerts Section ─────────────────────────────────────────
function PetAlerts({ petId }: { petId: number }) {
  const { data: vaccinations } = trpc.vaccines.getPetVaccinations.useQuery({ petId });
  const { data: preventives } = trpc.preventives.byPet.useQuery({ petId });

  const alerts = useMemo(() => {
    const now = new Date();
    const items: Array<{
      id: string;
      type: "vaccine" | "preventive";
      name: string;
      dueDate: Date;
      daysRemaining: number;
      urgency: "green" | "yellow" | "red";
    }> = [];

    // Vaccine alerts
    if (vaccinations) {
      for (const row of vaccinations) {
        const nextDue = row.vaccination.nextDueDate;
        if (!nextDue) continue;
        const dueDate = new Date(nextDue);
        if (dueDate < now) continue;
        const daysRemaining = differenceInCalendarDays(dueDate, now);
        if (daysRemaining > 30) continue;
        items.push({
          id: `vax-${row.vaccination.id}`,
          type: "vaccine",
          name: row.vaccine.name,
          dueDate,
          daysRemaining,
          urgency: daysRemaining <= 3 ? "red" : daysRemaining <= 7 ? "yellow" : "green",
        });
      }
    }

    // Preventive alerts
    if (preventives) {
      for (const row of preventives) {
        const nextDue = row.nextDueDate;
        if (!nextDue) continue;
        const dueDate = new Date(nextDue);
        if (dueDate < now) continue;
        const daysRemaining = differenceInCalendarDays(dueDate, now);
        if (daysRemaining > 30) continue;
        items.push({
          id: `prev-${row.id}`,
          type: "preventive",
          name: `${row.productName} (${row.type})`,
          dueDate,
          daysRemaining,
          urgency: daysRemaining <= 3 ? "red" : daysRemaining <= 7 ? "yellow" : "green",
        });
      }
    }

    // Sort: red first, then yellow, then green
    const urgencyOrder = { red: 0, yellow: 1, green: 2 };
    items.sort((a, b) => {
      const diff = urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
      return diff !== 0 ? diff : a.daysRemaining - b.daysRemaining;
    });

    return items;
  }, [vaccinations, preventives]);

  if (alerts.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-warning" />
          Alertas de Saúde
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {alerts.map((alert) => {
          const style = URGENCY_STYLES[alert.urgency];
          return (
            <div
              key={alert.id}
              className={`flex items-center gap-3 p-3 rounded-lg border ${style.bg} ${style.border} transition-all duration-200`}
            >
              {alert.type === "vaccine" ? (
                <Syringe className={`h-4 w-4 shrink-0 ${style.text}`} />
              ) : (
                <Shield className={`h-4 w-4 shrink-0 ${style.text}`} />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{alert.name}</p>
                <p className="text-xs text-muted-foreground">
                  Vence em {format(alert.dueDate, "dd/MM/yyyy", { locale: ptBR })}
                </p>
              </div>
              <Badge variant={style.badge} className="text-[10px] shrink-0">
                {alert.daysRemaining === 0
                  ? "Hoje"
                  : alert.daysRemaining === 1
                    ? "1 dia"
                    : `${alert.daysRemaining} dias`}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ── Check-in History Section ───────────────────────────────
function CheckInHistory({ events }: { events: Array<{
  id: number;
  eventType: string;
  eventDate: string | Date;
  endDate?: string | Date | null;
  title: string;
  status?: string | null;
}> }) {
  // Group checkin/checkout events and pair them
  const checkinHistory = useMemo(() => {
    const checkins = events.filter((e) => e.eventType === "checkin");
    const checkouts = events.filter((e) => e.eventType === "checkout");

    // Build map: date key -> checkout
    const checkoutByDate = new Map<string, typeof checkouts[number]>();
    for (const co of checkouts) {
      const dateKey = format(new Date(co.eventDate), "yyyy-MM-dd");
      checkoutByDate.set(dateKey, co);
    }

    const paired: Array<{
      id: number;
      checkinDate: Date;
      checkoutDate: Date | null;
      isMultiDay: boolean;
    }> = [];

    for (const ci of checkins) {
      const ciDate = new Date(ci.eventDate);
      const dateKey = format(ciDate, "yyyy-MM-dd");
      const co = checkoutByDate.get(dateKey);

      // Check for multi-day (hospedagem): if endDate is set and different day
      const endDate = ci.endDate ? new Date(ci.endDate) : null;
      const isMultiDay = endDate !== null && differenceInCalendarDays(endDate, ciDate) > 0;

      paired.push({
        id: ci.id,
        checkinDate: ciDate,
        checkoutDate: co ? new Date(co.eventDate) : (endDate ?? null),
        isMultiDay,
      });
    }

    // Sort newest first
    paired.sort((a, b) => b.checkinDate.getTime() - a.checkinDate.getTime());

    return paired.slice(0, 10); // Limit to last 10
  }, [events]);

  if (checkinHistory.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <DoorOpen className="h-4 w-4 text-primary" />
          Histórico de Check-ins
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {checkinHistory.map((entry) => {
          const formatTimeStr = (d: Date) =>
            format(d, "HH:mm", { locale: ptBR });
          const formatDateTimeStr = (d: Date) =>
            format(d, "dd/MM HH:mm", { locale: ptBR });

          return (
            <div
              key={entry.id}
              className="flex items-center gap-3 p-3 rounded-lg border bg-muted/30 text-sm transition-all duration-200 hover:bg-muted/50"
            >
              {entry.isMultiDay ? (
                <DoorClosed className="h-4 w-4 text-accent shrink-0" />
              ) : (
                <DoorOpen className="h-4 w-4 text-primary shrink-0" />
              )}
              <div className="flex-1 min-w-0">
                <p className="text-xs text-muted-foreground">
                  {format(entry.checkinDate, "EEEE, dd/MM/yyyy", { locale: ptBR })}
                </p>
                {entry.isMultiDay ? (
                  // Hospedagem: show full date range
                  <p className="font-medium">
                    {formatDateTimeStr(entry.checkinDate)}
                    {" → "}
                    {entry.checkoutDate
                      ? formatDateTimeStr(entry.checkoutDate)
                      : "em andamento"}
                  </p>
                ) : (
                  // Creche: show time range
                  <p className="font-medium">
                    {formatTimeStr(entry.checkinDate)}
                    {" → "}
                    {entry.checkoutDate
                      ? formatTimeStr(entry.checkoutDate)
                      : "em andamento"}
                  </p>
                )}
              </div>
              <Badge variant={entry.isMultiDay ? "info" : "secondary"} className="text-[10px] shrink-0">
                {entry.isMultiDay ? "Hospedagem" : "Creche"}
              </Badge>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

// ── Main Component ─────────────────────────────────────────
export function PetCalendarTab({ petId, role }: PetCalendarTabProps) {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.calendar.byPet.useQuery({ petId });
  const [currentMonth, setCurrentMonth] = useState(new Date());

  const deleteEvent = trpc.calendar.delete.useMutation({
    onSuccess: () => {
      toast.success("Evento removido com sucesso");
      utils.calendar.byPet.invalidate({ petId });
    },
    onError: (err) => toast.error(err.message),
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{ id: number; title: string } | null>(null);

  function handleDeleteClick(id: number, title: string) {
    setPendingDelete({ id, title });
    setConfirmOpen(true);
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    deleteEvent.mutate({ id: pendingDelete.id });
    setConfirmOpen(false);
    setPendingDelete(null);
  }

  function handleEventSuccess() {
    utils.calendar.byPet.invalidate({ petId });
  }

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

  // Checkin/checkout events for history
  const checkinEvents = (data ?? []).filter(
    (e) => e.eventType === "checkin" || e.eventType === "checkout"
  );

  return (
    <div className="space-y-4">
      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirmar remoção"
        description={`Tem certeza que deseja remover o evento "${pendingDelete?.title ?? ""}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={deleteEvent.isPending}
      />

      {/* Health Alerts */}
      <PetAlerts petId={petId} />

      {/* Mini Month View */}
      <MiniCalendar
        events={(data ?? []).map((e) => ({ eventDate: e.eventDate }))}
        currentMonth={currentMonth}
        onMonthChange={setCurrentMonth}
      />

      {/* Check-in History */}
      <CheckInHistory events={checkinEvents} />

      {/* Events List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              Próximos Eventos
            </CardTitle>
            <AddEventDialog petId={petId} onSuccess={handleEventSuccess} />
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0 transition-colors duration-200"
                        onClick={() => handleDeleteClick(event.id, event.title)}
                      >
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
              <AddEventDialog petId={petId} onSuccess={handleEventSuccess}>
                <Button variant="outline" size="sm" className="mt-4 gap-1.5 transition-all duration-200">
                  <Plus className="h-3.5 w-3.5" /> Adicionar
                </Button>
              </AddEventDialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
