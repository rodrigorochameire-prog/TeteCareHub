"use client";

import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  ChevronLeft,
  ChevronRight,
  Plus,
  Filter,
  Search,
  Calendar as CalendarIcon,
  Syringe,
  Pill,
  Heart,
  AlertCircle,
  Clock,
  MapPin,
  LogIn,
  LogOut,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

// Event type configurations with colors and icons
const EVENT_TYPES = {
  vaccination: {
    label: "Vacinação",
    color: "bg-blue-200 dark:bg-blue-900",
    lightColor: "bg-blue-50 dark:bg-blue-950",
    textColor: "text-gray-900 dark:text-gray-100",
    borderColor: "border-blue-100 dark:border-blue-800",
    icon: Syringe,
  },
  medication: {
    label: "Medicamento",
    color: "bg-purple-200 dark:bg-purple-900",
    lightColor: "bg-purple-50 dark:bg-purple-950",
    textColor: "text-gray-900 dark:text-gray-100",
    borderColor: "border-purple-100 dark:border-purple-800",
    icon: Pill,
  },
  medical: {
    label: "Consulta Médica",
    color: "bg-rose-200 dark:bg-rose-900",
    lightColor: "bg-rose-50 dark:bg-rose-950",
    textColor: "text-gray-900 dark:text-gray-100",
    borderColor: "border-rose-100 dark:border-rose-800",
    icon: Heart,
  },
  general: {
    label: "Geral",
    color: "bg-slate-200 dark:bg-slate-800",
    lightColor: "bg-slate-50 dark:bg-slate-900",
    textColor: "text-gray-900 dark:text-gray-100",
    borderColor: "border-slate-100 dark:border-slate-700",
    icon: CalendarIcon,
  },
  holiday: {
    label: "Feriado",
    color: "bg-emerald-200 dark:bg-emerald-900",
    lightColor: "bg-emerald-50 dark:bg-emerald-950",
    textColor: "text-gray-900 dark:text-gray-100",
    borderColor: "border-emerald-100 dark:border-emerald-800",
    icon: CalendarIcon,
  },
  closure: {
    label: "Fechamento",
    color: "bg-orange-200 dark:bg-orange-900",
    lightColor: "bg-orange-50 dark:bg-orange-950",
    textColor: "text-gray-900 dark:text-gray-100",
    borderColor: "border-orange-100 dark:border-orange-800",
    icon: AlertCircle,
  },
  checkin: {
    label: "Check-in",
    color: "bg-teal-200 dark:bg-teal-900",
    lightColor: "bg-teal-50 dark:bg-teal-950",
    textColor: "text-gray-900 dark:text-gray-100",
    borderColor: "border-teal-100 dark:border-teal-800",
    icon: LogIn,
  },
  checkout: {
    label: "Check-out",
    color: "bg-amber-200 dark:bg-amber-900",
    lightColor: "bg-amber-50 dark:bg-amber-950",
    textColor: "text-gray-900 dark:text-gray-100",
    borderColor: "border-amber-100 dark:border-amber-800",
    icon: LogOut,
  },
  preventive: {
    label: "Preventivo",
    color: "bg-cyan-200 dark:bg-cyan-900",
    lightColor: "bg-cyan-50 dark:bg-cyan-950",
    textColor: "text-gray-900 dark:text-gray-100",
    borderColor: "border-cyan-100 dark:border-cyan-800",
    icon: Shield,
  },
} as const;

type EventType = keyof typeof EVENT_TYPES;

export type CalendarEvent = {
  id: number;
  title: string;
  description?: string | null;
  eventDate: Date;
  endDate?: Date | null;
  eventType: EventType;
  petId?: number | null;
  petName?: string;
  location?: string | null;
  isAllDay: boolean;
  checkInDate?: Date | null;
  checkOutDate?: Date | null;
};

type PremiumCalendarProps = {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onCreateEvent?: (event: Partial<CalendarEvent>) => void;
  pets?: Array<{ id: number; name: string }>;
  showCreateButton?: boolean;
};

export function PremiumCalendar({
  events,
  onEventClick,
  onDateClick,
  onCreateEvent,
  pets = [],
  showCreateButton = true,
}: PremiumCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEventType, setSelectedEventType] = useState<EventType | "all">("all");
  const [selectedPet, setSelectedPet] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);

  // Filter events
  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      if (selectedEventType !== "all" && event.eventType !== selectedEventType) {
        return false;
      }
      if (selectedPet !== "all" && event.petId !== selectedPet) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          event.title.toLowerCase().includes(query) ||
          event.description?.toLowerCase().includes(query) ||
          event.petName?.toLowerCase().includes(query)
        );
      }
      return true;
    });
  }, [events, selectedEventType, selectedPet, searchQuery]);

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (Date | null)[] = [];

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    return filteredEvents.filter((event) => {
      const eventDate = new Date(event.eventDate);
      const isOnDate =
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear();

      const isInPeriod =
        event.checkInDate &&
        event.checkOutDate &&
        (() => {
          const checkIn = new Date(event.checkInDate);
          checkIn.setHours(0, 0, 0, 0);
          const checkOut = new Date(event.checkOutDate);
          checkOut.setHours(0, 0, 0, 0);
          const current = new Date(date);
          current.setHours(0, 0, 0, 0);
          return current >= checkIn && current <= checkOut;
        })();

      return isOnDate || isInPeriod;
    });
  };

  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthYear = format(currentDate, "MMMM yyyy", { locale: ptBR });
  const days = getDaysInMonth(currentDate);
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <div className="space-y-6">
      {/* Header with filters and controls */}
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousMonth}
            className="h-10 w-10 rounded-xl hover:bg-primary/10 transition-all"
          >
            <ChevronLeft className="h-5 w-5" />
          </Button>
          <Button
            variant="outline"
            onClick={goToToday}
            className="min-w-[100px] rounded-xl font-semibold hover:bg-primary/10 transition-all"
          >
            Hoje
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={goToNextMonth}
            className="h-10 w-10 rounded-xl hover:bg-primary/10 transition-all"
          >
            <ChevronRight className="h-5 w-5" />
          </Button>
          <h2 className="text-2xl font-bold capitalize ml-2">{monthYear}</h2>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar eventos..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-[200px] rounded-xl"
            />
          </div>

          {/* Event Type Filter */}
          <Select
            value={selectedEventType}
            onValueChange={(value) => setSelectedEventType(value as EventType | "all")}
          >
            <SelectTrigger className="w-[180px] rounded-xl">
              <Filter className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tipo de evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              {Object.entries(EVENT_TYPES).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", config.color)} />
                    {config.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Pet Filter */}
          {pets.length > 0 && (
            <Select
              value={selectedPet.toString()}
              onValueChange={(value) => setSelectedPet(value === "all" ? "all" : parseInt(value))}
            >
              <SelectTrigger className="w-[180px] rounded-xl">
                <SelectValue placeholder="Filtrar por pet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os pets</SelectItem>
                {pets.map((pet) => (
                  <SelectItem key={pet.id} value={pet.id.toString()}>
                    {pet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}

          {/* Create Event Button */}
          {showCreateButton && onCreateEvent && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-xl shadow-lg hover:shadow-xl transition-all">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Evento
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Criar Novo Evento</DialogTitle>
                  <DialogDescription>
                    Adicione um novo evento ao calendário
                  </DialogDescription>
                </DialogHeader>
                <CreateEventForm
                  onSubmit={(event) => {
                    onCreateEvent(event);
                    setIsCreateDialogOpen(false);
                  }}
                  pets={pets}
                />
              </DialogContent>
            </Dialog>
          )}
        </div>
      </div>

      {/* Event Type Legend */}
      <div className="flex flex-wrap gap-2">
        {Object.entries(EVENT_TYPES).map(([key, config]) => {
          const Icon = config.icon;
          const count = filteredEvents.filter((e) => e.eventType === key).length;
          return (
            <div
              key={key}
              className={cn(
                "flex items-center gap-1.5 px-2.5 py-1 rounded-full border transition-all text-xs",
                config.lightColor,
                config.borderColor,
                "hover:shadow-sm"
              )}
            >
              <Icon className="h-3 w-3" />
              <span className="font-medium">{config.label}</span>
              <span className="opacity-70 ml-0.5">{count}</span>
            </div>
          );
        })}
      </div>

      {/* Calendar Grid */}
      <Card className="p-6 shadow-xl border-2">
        <div className="grid grid-cols-7 gap-2">
          {/* Week day headers */}
          {weekDays.map((day) => (
            <div
              key={day}
              className="text-center font-bold text-sm text-muted-foreground py-3"
            >
              {day}
            </div>
          ))}

          {/* Calendar days */}
          {days.map((date, index) => {
            const dayEvents = getEventsForDate(date);
            const isToday =
              date &&
              date.getDate() === today.getDate() &&
              date.getMonth() === today.getMonth() &&
              date.getFullYear() === today.getFullYear();
            const isPast = date && date < today;

            return (
              <div
                key={index}
                className={cn(
                  "min-h-[120px] p-2 rounded-xl border-2 transition-all cursor-pointer",
                  date
                    ? "bg-card hover:bg-accent/5 hover:border-primary/30 hover:shadow-md"
                    : "bg-muted/20",
                  isToday && "ring-2 ring-primary ring-offset-2 bg-primary/5",
                  isPast && "opacity-60"
                )}
                onClick={() => {
                  if (date) {
                    onDateClick?.(date);
                  }
                }}
              >
                {date && (
                  <>
                    <div
                      className={cn(
                        "text-sm font-semibold mb-1",
                        isToday && "text-primary"
                      )}
                    >
                      {date.getDate()}
                    </div>
                    <div className="space-y-1">
                      {dayEvents.slice(0, 3).map((event) => {
                        const config = EVENT_TYPES[event.eventType];
                        const Icon = config.icon;
                        return (
                          <div
                            key={event.id}
                            className={cn(
                              "flex items-center gap-1 px-1.5 py-0.5 rounded text-xs truncate cursor-pointer",
                              config.color,
                              config.textColor
                            )}
                            onClick={(e) => {
                              e.stopPropagation();
                              onEventClick?.(event);
                            }}
                          >
                            <Icon className="h-3 w-3 flex-shrink-0" />
                            <span className="truncate">{event.title}</span>
                          </div>
                        );
                      })}
                      {dayEvents.length > 3 && (
                        <div className="text-xs text-muted-foreground px-1">
                          +{dayEvents.length - 3} mais
                        </div>
                      )}
                    </div>
                  </>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

// Create Event Form Component
function CreateEventForm({
  onSubmit,
  pets,
}: {
  onSubmit: (event: Partial<CalendarEvent>) => void;
  pets: Array<{ id: number; name: string }>;
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    eventDate: "",
    eventTime: "",
    endDate: "",
    endTime: "",
    eventType: "general" as EventType,
    petId: "",
    location: "",
    isAllDay: false,
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const eventDate = new Date(formData.eventDate);
    if (formData.eventTime && !formData.isAllDay) {
      const [hours, minutes] = formData.eventTime.split(":");
      eventDate.setHours(parseInt(hours), parseInt(minutes));
    }

    let endDate: Date | undefined;
    if (formData.endDate) {
      endDate = new Date(formData.endDate);
      if (formData.endTime && !formData.isAllDay) {
        const [hours, minutes] = formData.endTime.split(":");
        endDate.setHours(parseInt(hours), parseInt(minutes));
      }
    }

    onSubmit({
      title: formData.title,
      description: formData.description || undefined,
      eventDate,
      endDate,
      eventType: formData.eventType,
      petId: formData.petId ? parseInt(formData.petId) : undefined,
      location: formData.location || undefined,
      isAllDay: formData.isAllDay,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="col-span-2">
          <Label htmlFor="title">Título *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="eventType">Tipo de Evento *</Label>
          <Select
            value={formData.eventType}
            onValueChange={(value) =>
              setFormData({ ...formData, eventType: value as EventType })
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(EVENT_TYPES).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  <div className="flex items-center gap-2">
                    <div className={cn("w-3 h-3 rounded-full", config.color)} />
                    {config.label}
                  </div>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="petId">Pet (opcional)</Label>
          <Select
            value={formData.petId}
            onValueChange={(value) => setFormData({ ...formData, petId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecione um pet" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">Nenhum</SelectItem>
              {pets.map((pet) => (
                <SelectItem key={pet.id} value={pet.id.toString()}>
                  {pet.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="eventDate">Data *</Label>
          <Input
            id="eventDate"
            type="date"
            value={formData.eventDate}
            onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
            required
          />
        </div>

        <div>
          <Label htmlFor="eventTime">Hora</Label>
          <Input
            id="eventTime"
            type="time"
            value={formData.eventTime}
            onChange={(e) => setFormData({ ...formData, eventTime: e.target.value })}
            disabled={formData.isAllDay}
          />
        </div>

        <div>
          <Label htmlFor="endDate">Data Final (opcional)</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          />
        </div>

        <div>
          <Label htmlFor="endTime">Hora Final</Label>
          <Input
            id="endTime"
            type="time"
            value={formData.endTime}
            onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
            disabled={formData.isAllDay}
          />
        </div>

        <div className="col-span-2 flex items-center gap-2">
          <Checkbox
            id="isAllDay"
            checked={formData.isAllDay}
            onCheckedChange={(checked) =>
              setFormData({ ...formData, isAllDay: checked as boolean })
            }
          />
          <Label htmlFor="isAllDay">Dia inteiro</Label>
        </div>

        <div className="col-span-2">
          <Label htmlFor="location">Local (opcional)</Label>
          <Input
            id="location"
            value={formData.location}
            onChange={(e) => setFormData({ ...formData, location: e.target.value })}
            placeholder="Ex: Clínica Veterinária"
          />
        </div>

        <div className="col-span-2">
          <Label htmlFor="description">Descrição (opcional)</Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            rows={3}
          />
        </div>
      </div>

      <div className="flex justify-end gap-2">
        <Button type="submit">Criar Evento</Button>
      </div>
    </form>
  );
}

