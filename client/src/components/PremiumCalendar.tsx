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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Sparkles,
  Zap,
  Star,
  Users,
  User,
  Building2,
} from "lucide-react";
import { cn } from "@/lib/utils";

// Event type configurations with PREMIUM colors, gradients, and icons
const EVENT_TYPES = {
  vaccination: {
    label: "Vacinação",
    color: "bg-gradient-to-br from-blue-400 to-blue-600",
    lightColor: "bg-gradient-to-br from-blue-50 via-blue-100 to-blue-50",
    hoverColor: "hover:from-blue-100 hover:via-blue-200 hover:to-blue-100",
    textColor: "text-blue-900",
    borderColor: "border-blue-300",
    shadowColor: "shadow-blue-200/50",
    icon: Syringe,
    glow: "shadow-lg shadow-blue-400/30",
  },
  medication: {
    label: "Medicamento",
    color: "bg-gradient-to-br from-purple-400 to-purple-600",
    lightColor: "bg-gradient-to-br from-purple-50 via-purple-100 to-purple-50",
    hoverColor: "hover:from-purple-100 hover:via-purple-200 hover:to-purple-100",
    textColor: "text-purple-900",
    borderColor: "border-purple-300",
    shadowColor: "shadow-purple-200/50",
    icon: Pill,
    glow: "shadow-lg shadow-purple-400/30",
  },
  medical: {
    label: "Consulta Médica",
    color: "bg-gradient-to-br from-rose-400 to-rose-600",
    lightColor: "bg-gradient-to-br from-rose-50 via-rose-100 to-rose-50",
    hoverColor: "hover:from-rose-100 hover:via-rose-200 hover:to-rose-100",
    textColor: "text-rose-900",
    borderColor: "border-rose-300",
    shadowColor: "shadow-rose-200/50",
    icon: Heart,
    glow: "shadow-lg shadow-rose-400/30",
  },
  general: {
    label: "Geral",
    color: "bg-gradient-to-br from-slate-400 to-slate-600",
    lightColor: "bg-gradient-to-br from-slate-50 via-slate-100 to-slate-50",
    hoverColor: "hover:from-slate-100 hover:via-slate-200 hover:to-slate-100",
    textColor: "text-slate-900",
    borderColor: "border-slate-300",
    shadowColor: "shadow-slate-200/50",
    icon: CalendarIcon,
    glow: "shadow-lg shadow-slate-400/30",
  },
  holiday: {
    label: "Feriado",
    color: "bg-gradient-to-br from-emerald-400 to-emerald-600",
    lightColor: "bg-gradient-to-br from-emerald-50 via-emerald-100 to-emerald-50",
    hoverColor: "hover:from-emerald-100 hover:via-emerald-200 hover:to-emerald-100",
    textColor: "text-emerald-900",
    borderColor: "border-emerald-300",
    shadowColor: "shadow-emerald-200/50",
    icon: Sparkles,
    glow: "shadow-lg shadow-emerald-400/30",
  },
  closure: {
    label: "Fechamento",
    color: "bg-gradient-to-br from-orange-400 to-orange-600",
    lightColor: "bg-gradient-to-br from-orange-50 via-orange-100 to-orange-50",
    hoverColor: "hover:from-orange-100 hover:via-orange-200 hover:to-orange-100",
    textColor: "text-orange-900",
    borderColor: "border-orange-300",
    shadowColor: "shadow-orange-200/50",
    icon: AlertCircle,
    glow: "shadow-lg shadow-orange-400/30",
  },
  checkin: {
    label: "Check-in",
    color: "bg-gradient-to-br from-teal-400 to-teal-600",
    lightColor: "bg-gradient-to-br from-teal-50 via-teal-100 to-teal-50",
    hoverColor: "hover:from-teal-100 hover:via-teal-200 hover:to-teal-100",
    textColor: "text-teal-900",
    borderColor: "border-teal-300",
    shadowColor: "shadow-teal-200/50",
    icon: LogIn,
    glow: "shadow-lg shadow-teal-400/30",
  },
  checkout: {
    label: "Check-out",
    color: "bg-gradient-to-br from-amber-400 to-amber-600",
    lightColor: "bg-gradient-to-br from-amber-50 via-amber-100 to-amber-50",
    hoverColor: "hover:from-amber-100 hover:via-amber-200 hover:to-amber-100",
    textColor: "text-amber-900",
    borderColor: "border-amber-300",
    shadowColor: "shadow-amber-200/50",
    icon: LogOut,
    glow: "shadow-lg shadow-amber-400/30",
  },
  preventive: {
    label: "Preventivo",
    color: "bg-gradient-to-br from-cyan-400 to-cyan-600",
    lightColor: "bg-gradient-to-br from-cyan-50 via-cyan-100 to-cyan-50",
    hoverColor: "hover:from-cyan-100 hover:via-cyan-200 hover:to-cyan-100",
    textColor: "text-cyan-900",
    borderColor: "border-cyan-300",
    shadowColor: "shadow-cyan-200/50",
    icon: Shield,
    glow: "shadow-lg shadow-cyan-400/30",
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
  // Multi-day period fields
  checkInDate?: Date | null;
  checkOutDate?: Date | null;
  dailyCount?: number | null;
  // Status fields (from admin calendar)
  status?: "overdue" | "upcoming" | "future";
  amount?: number;
  // Co-management fields
  createdByRole?: "admin" | "user" | null;
  createdByName?: string | null;
};

type ViewMode = "month" | "week" | "day";

type PremiumCalendarProps = {
  events: CalendarEvent[];
  onEventClick?: (event: CalendarEvent) => void;
  onDateClick?: (date: Date) => void;
  onDayClick?: (date: Date) => void;
  onCreateEvent?: (event: Partial<CalendarEvent>) => void;
  onEventDrop?: (eventId: number, newDate: Date) => void;
  pets?: Array<{ id: number; name: string }>;
  showCreateButton?: boolean;
  role?: "admin" | "tutor";
};

export function PremiumCalendar({
  events,
  onEventClick,
  onDateClick,
  onDayClick,
  onCreateEvent,
  onEventDrop,
  pets = [],
  showCreateButton = true,
  role = "admin",
}: PremiumCalendarProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>("month");
  const [selectedEventType, setSelectedEventType] = useState<EventType | "all">("all");
  const [selectedPet, setSelectedPet] = useState<number | "all">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [hoveredDate, setHoveredDate] = useState<Date | null>(null);

  // Filter events
  const filteredEvents = useMemo(() => {
    // Ensure events is always an array
    const safeEvents = Array.isArray(events) ? events : [];
    
    return safeEvents.filter((event) => {
      // Validate event structure
      if (!event || !event.eventDate) return false;
      
      // Validate eventDate is a valid Date
      if (!(event.eventDate instanceof Date) || isNaN(event.eventDate.getTime())) {
        return false;
      }
      
      if (selectedEventType !== "all" && event.eventType !== selectedEventType) {
        return false;
      }
      if (selectedPet !== "all" && event.petId !== selectedPet) {
        return false;
      }
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        return (
          (event.title?.toLowerCase() || "").includes(query) ||
          (event.description?.toLowerCase() || "").includes(query) ||
          (event.petName?.toLowerCase() || "").includes(query)
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

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }

    // Add days of month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day));
    }

    return days;
  };

  // Get events for a specific date
  const getEventsForDate = (date: Date | null) => {
    if (!date) return [];
    return filteredEvents.filter((event) => {
      if (!event || !event.eventDate) return false;
      
      // Validate and get eventDate
      const eventDate = event.eventDate instanceof Date ? event.eventDate : new Date(event.eventDate);
      if (isNaN(eventDate.getTime())) return false;
      
      // Check if event is on this specific date
      const isOnDate = (
        eventDate.getDate() === date.getDate() &&
        eventDate.getMonth() === date.getMonth() &&
        eventDate.getFullYear() === date.getFullYear()
      );
      
      // Check if date falls within multi-day period
      const isInPeriod = event.checkInDate && event.checkOutDate && (() => {
        try {
          const checkIn = event.checkInDate instanceof Date 
            ? new Date(event.checkInDate) 
            : new Date(event.checkInDate);
          if (isNaN(checkIn.getTime())) return false;
          
          const checkOut = event.checkOutDate instanceof Date 
            ? new Date(event.checkOutDate) 
            : new Date(event.checkOutDate);
          if (isNaN(checkOut.getTime())) return false;
          
          checkIn.setHours(0, 0, 0, 0);
          checkOut.setHours(0, 0, 0, 0);
          const current = new Date(date);
          current.setHours(0, 0, 0, 0);
          return current >= checkIn && current <= checkOut;
        } catch {
          return false;
        }
      })();
      
      return isOnDate || isInPeriod;
    });
  };

  // Navigation
  const goToPreviousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthYear = currentDate.toLocaleDateString("pt-BR", {
    month: "long",
    year: "numeric",
  });

  const days = getDaysInMonth(currentDate);
  const weekDays = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return (
    <TooltipProvider delayDuration={200}>
      <div className="space-y-6">
        {/* Header with filters and controls */}
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="outline"
              size="icon"
              onClick={goToPreviousMonth}
              className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ChevronLeft className="h-5 w-5" />
            </Button>
            <Button
              variant="outline"
              onClick={goToToday}
              className="min-w-[120px] rounded-xl font-semibold hover:bg-primary/10 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <Zap className="h-4 w-4 mr-2" />
              Hoje
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={goToNextMonth}
              className="h-10 w-10 rounded-xl hover:bg-primary/10 hover:scale-105 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ChevronRight className="h-5 w-5" />
            </Button>
            <h2 className="text-2xl font-bold capitalize ml-2 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              {monthYear}
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Search */}
            <div className="relative group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <Input
                placeholder="Buscar eventos..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10 w-[200px] rounded-xl border-2 focus:border-primary transition-all shadow-sm hover:shadow-md"
              />
            </div>

            {/* Event Type Filter */}
            <Select
              value={selectedEventType}
              onValueChange={(value) => setSelectedEventType(value as EventType | "all")}
            >
              <SelectTrigger className="w-[180px] rounded-xl border-2 shadow-sm hover:shadow-md transition-all">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tipo de evento" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {Object.entries(EVENT_TYPES).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    <div className="flex items-center gap-2">
                      <div className={cn("w-3 h-3 rounded-full", config.color, "shadow-sm")} />
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
                <SelectTrigger className="w-[180px] rounded-xl border-2 shadow-sm hover:shadow-md transition-all">
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
                  <Button className="rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 hover:scale-105 bg-gradient-to-r from-primary to-primary/80">
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

        {/* Event Type Legend - Premium chips with animations */}
        <div className="flex flex-wrap gap-2">
          {Object.entries(EVENT_TYPES).map(([key, config]) => {
            const Icon = config.icon;
            const count = filteredEvents.filter((e) => e.eventType === key).length;
            return (
              <Tooltip key={key}>
                <TooltipTrigger asChild>
                  <div
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full border-2 transition-all text-xs cursor-pointer group",
                      config.lightColor,
                      config.borderColor,
                      "hover:shadow-lg hover:scale-105 duration-200",
                      config.glow
                    )}
                  >
                    <Icon className={cn("h-3.5 w-3.5 transition-transform group-hover:scale-110", config.textColor)} />
                    <span className={cn("font-semibold", config.textColor)}>
                      {config.label}
                    </span>
                    <Badge
                      variant="secondary"
                      className={cn(
                        "ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs font-bold",
                        config.textColor,
                        "bg-white/50"
                      )}
                    >
                      {count}
                    </Badge>
                  </div>
                </TooltipTrigger>
                <TooltipContent>
                  <p>{count} {config.label.toLowerCase()}{count !== 1 ? "s" : ""}</p>
                </TooltipContent>
              </Tooltip>
            );
          })}
        </div>

        {/* Calendar Grid - PREMIUM VERSION - COMPACT */}
        <Card className="p-4 shadow-2xl border-2 bg-gradient-to-br from-background via-background to-muted/20">
          <div className="grid grid-cols-7 gap-2">
            {/* Week day headers - Premium style */}
            {weekDays.map((day) => (
              <div
                key={day}
                className="text-center font-bold text-xs text-muted-foreground py-2 bg-gradient-to-b from-muted/50 to-transparent rounded-lg"
              >
                {day}
              </div>
            ))}

            {/* Calendar days - PREMIUM INTERACTIVE SQUARES - COMPACT */}
            {days.map((date, index) => {
              const dayEvents = getEventsForDate(date);
              const isToday =
                date &&
                date.getDate() === today.getDate() &&
                date.getMonth() === today.getMonth() &&
                date.getFullYear() === today.getFullYear();
              const isPast = date && date < today;
              const isHovered = date && hoveredDate && 
                date.getDate() === hoveredDate.getDate() &&
                date.getMonth() === hoveredDate.getMonth() &&
                date.getFullYear() === hoveredDate.getFullYear();
              const isWeekend = date && (date.getDay() === 0 || date.getDay() === 6);

              return (
                <Tooltip key={index}>
                  <TooltipTrigger asChild>
                    <div
                      className={cn(
                        "min-h-[110px] p-2 rounded-lg border-2 transition-all duration-300 cursor-pointer group relative overflow-hidden",
                        // Base styles
                        date ? "bg-gradient-to-br from-card via-card to-muted/30" : "bg-muted/20",
                        // Hover effects
                        date && "hover:scale-[1.02] hover:shadow-xl hover:border-primary/50",
                        // Today highlight
                        isToday && "ring-2 ring-primary ring-offset-1 bg-gradient-to-br from-primary/10 via-primary/5 to-primary/10 border-primary shadow-lg",
                        // Past dates
                        isPast && "opacity-50",
                        // Weekend subtle styling
                        isWeekend && date && "bg-gradient-to-br from-card via-muted/20 to-card",
                        // Hovered state
                        isHovered && "ring-2 ring-primary/50 shadow-lg scale-[1.02]"
                      )}
                      onClick={() => {
                        if (date) {
                          onDateClick?.(date);
                          onDayClick?.(date);
                        }
                      }}
                      onMouseEnter={() => date && setHoveredDate(date)}
                      onMouseLeave={() => setHoveredDate(null)}
                      onDragOver={(e) => {
                        if (date) {
                          e.preventDefault();
                          e.currentTarget.classList.add("ring-4", "ring-primary", "bg-primary/20", "scale-105");
                        }
                      }}
                      onDragLeave={(e) => {
                        e.currentTarget.classList.remove("ring-4", "ring-primary", "bg-primary/20", "scale-105");
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        e.currentTarget.classList.remove("ring-4", "ring-primary", "bg-primary/20", "scale-105");
                        if (date) {
                          const eventId = e.dataTransfer.getData("eventId");
                          if (eventId && onEventDrop) {
                            onEventDrop(parseInt(eventId), date);
                          }
                        }
                      }}
                    >
                      {/* Animated background gradient on hover */}
                      {date && (
                        <div className="absolute inset-0 bg-gradient-to-br from-primary/0 via-primary/0 to-primary/0 group-hover:from-primary/5 group-hover:via-primary/10 group-hover:to-primary/5 transition-all duration-500 rounded-xl -z-0" />
                      )}

                      {date && (
                        <div className="relative z-10">
                          {/* Date number with premium styling */}
                          <div className="flex items-center justify-between mb-2">
                            <span
                              className={cn(
                                "text-base font-bold transition-all duration-200",
                                isToday && "text-primary scale-110",
                                !isToday && "text-foreground group-hover:text-primary group-hover:scale-110"
                              )}
                            >
                              {date.getDate()}
                            </span>
                            {/* Event count badge - Premium */}
                            {dayEvents.length > 0 && (
                              <Badge
                                variant="secondary"
                                className={cn(
                                  "h-6 w-6 p-0 flex items-center justify-center text-xs font-bold transition-all duration-200",
                                  "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground",
                                  "shadow-md group-hover:shadow-lg group-hover:scale-110"
                                )}
                              >
                                {dayEvents.length}
                              </Badge>
                            )}
                            {/* Star indicator for today */}
                            {isToday && (
                              <Star className="h-4 w-4 text-primary fill-primary animate-pulse" />
                            )}
                          </div>

                          {/* Events list - Premium cards */}
                          <div className="space-y-1.5">
                            {dayEvents.slice(0, 3).map((event, eventIndex) => {
                              const config = EVENT_TYPES[event.eventType];
                              const Icon = config.icon;
                              
                              // Check if this is a multi-day period event
                              const isPeriodEvent = event.checkInDate && event.checkOutDate;
                              const isFirstDay = isPeriodEvent && (() => {
                                if (!event.checkInDate) return false;
                                const checkIn = event.checkInDate instanceof Date 
                                  ? new Date(event.checkInDate) 
                                  : new Date(event.checkInDate);
                                if (isNaN(checkIn.getTime())) return false;
                                return checkIn.getDate() === date.getDate() &&
                                       checkIn.getMonth() === date.getMonth() &&
                                       checkIn.getFullYear() === date.getFullYear();
                              })();
                              const isLastDay = isPeriodEvent && (() => {
                                if (!event.checkOutDate) return false;
                                const checkOut = event.checkOutDate instanceof Date 
                                  ? new Date(event.checkOutDate) 
                                  : new Date(event.checkOutDate);
                                if (isNaN(checkOut.getTime())) return false;
                                return checkOut.getDate() === date.getDate() &&
                                       checkOut.getMonth() === date.getMonth() &&
                                       checkOut.getFullYear() === date.getFullYear();
                              })();

                              // Status indicators
                              const isOverdue = event.status === "overdue";
                              const isUpcoming = event.status === "upcoming";
                              
                              // Co-management indicator
                              const isCreatedByAdmin = event.createdByRole === "admin";
                              const isCreatedByTutor = event.createdByRole === "user";

                              return (
                                <Tooltip key={event.id}>
                                  <TooltipTrigger asChild>
                                    <div
                                      draggable
                                      onDragStart={(e) => {
                                        e.dataTransfer.setData("eventId", event.id.toString());
                                        e.dataTransfer.effectAllowed = "move";
                                      }}
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        onEventClick?.(event);
                                      }}
                                      className={cn(
                                        "px-2 py-1 rounded-md text-[11px] font-semibold cursor-move transition-all duration-200",
                                        "border-2 group/event relative overflow-hidden",
                                        // Premium gradient background
                                        config.lightColor,
                                        config.borderColor,
                                        // Hover effects
                                        "hover:scale-105 hover:shadow-lg hover:border-opacity-100",
                                        config.glow,
                                        // Period event styling
                                        isPeriodEvent && "border-dashed border-2",
                                        // Status styling
                                        isOverdue && "ring-2 ring-red-500/50 bg-gradient-to-br from-red-50 to-red-100",
                                        isUpcoming && "ring-2 ring-yellow-500/50 bg-gradient-to-br from-yellow-50 to-yellow-100",
                                        // Animation delay for staggered effect
                                        `animate-in fade-in slide-in-from-left-2 duration-300`,
                                        `[animation-delay:${eventIndex * 50}ms]`
                                      )}
                                    >
                                      {/* Hover gradient overlay */}
                                      <div className={cn(
                                        "absolute inset-0 opacity-0 group-hover/event:opacity-100 transition-opacity duration-200 rounded-md",
                                        config.hoverColor
                                      )} />

                                      <div className="relative z-10 flex items-center gap-1">
                                        <Icon className={cn(
                                          "h-3 w-3 flex-shrink-0 transition-transform group-hover/event:scale-110 group-hover/event:rotate-12",
                                          config.textColor
                                        )} />
                                        <span className={cn("truncate font-semibold flex-1", config.textColor)}>
                                          {isFirstDay && "👉 "}
                                          {event.title}
                                          {isLastDay && " 🏁"}
                                          {isPeriodEvent && !isFirstDay && !isLastDay && " 🟦"}
                                        </span>
                                        {/* Co-management indicator - Melhorado para tutor */}
                                        {role === "tutor" && isCreatedByAdmin && (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <div className="flex items-center gap-0.5">
                                                <Building2 className="h-2.5 w-2.5 text-blue-600 flex-shrink-0 animate-pulse" />
                                                <Badge variant="outline" className="h-3 px-1 text-[8px] border-blue-500 text-blue-700 bg-blue-50">
                                                  Creche
                                                </Badge>
                                              </div>
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p className="font-medium">Criado pela Creche</p>
                                              {event.createdByName && <p className="text-xs text-muted-foreground">por {event.createdByName}</p>}
                                              <p className="text-xs text-muted-foreground mt-1">Cogestão ativa</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        )}
                                        {role === "admin" && isCreatedByTutor && (
                                          <Tooltip>
                                            <TooltipTrigger asChild>
                                              <User className="h-2.5 w-2.5 text-green-600 flex-shrink-0" />
                                            </TooltipTrigger>
                                            <TooltipContent>
                                              <p>Criado pelo Tutor{event.createdByName ? ` (${event.createdByName})` : ""}</p>
                                            </TooltipContent>
                                          </Tooltip>
                                        )}
                                        {/* Status badges */}
                                        {isOverdue && (
                                          <Badge variant="destructive" className="h-3.5 px-1 text-[9px] ml-auto">
                                            Atrasado
                                          </Badge>
                                        )}
                                        {isUpcoming && (
                                          <Badge variant="outline" className="h-3.5 px-1 text-[9px] border-yellow-500 text-yellow-700 ml-auto">
                                            Próximo
                                          </Badge>
                                        )}
                                      </div>
                                      
                                      {/* Additional info row - COMPACT */}
                                      {(isPeriodEvent && event.dailyCount) || !event.isAllDay || event.petName ? (
                                        <div className="relative z-10 flex items-center gap-1.5 mt-0.5">
                                          {isPeriodEvent && event.dailyCount && (
                                            <div className={cn("text-[9px] font-medium", config.textColor, "opacity-70")}>
                                              📅 {event.dailyCount} {event.dailyCount === 1 ? 'dia' : 'dias'}
                                            </div>
                                          )}
                                          {!event.isAllDay && (
                                            <div className={cn("flex items-center gap-0.5 text-[9px]", config.textColor, "opacity-70")}>
                                              <Clock className="h-2 w-2" />
                                              {(() => {
                                                const eventDate = event.eventDate instanceof Date 
                                                  ? event.eventDate 
                                                  : new Date(event.eventDate);
                                                if (isNaN(eventDate.getTime())) return "";
                                                return eventDate.toLocaleTimeString("pt-BR", {
                                                  hour: "2-digit",
                                                  minute: "2-digit",
                                                });
                                              })()}
                                            </div>
                                          )}
                                          {event.petName && (
                                            <div className={cn("text-[9px] font-medium truncate", config.textColor, "opacity-70")}>
                                              🐾 {event.petName}
                                            </div>
                                          )}
                                        </div>
                                      ) : null}
                                    </div>
                                  </TooltipTrigger>
                                  <TooltipContent side="right" className="max-w-xs">
                                    <div className="space-y-1">
                                      <p className="font-semibold">{event.title}</p>
                                      {event.description && (
                                        <p className="text-xs text-muted-foreground">{event.description}</p>
                                      )}
                                      {event.petName && (
                                        <p className="text-xs">Pet: {event.petName}</p>
                                      )}
                                      {event.location && (
                                        <p className="text-xs">📍 {event.location}</p>
                                      )}
                                    </div>
                                  </TooltipContent>
                                </Tooltip>
                              );
                            })}
                            {dayEvents.length > 3 && (
                              <div className="text-[10px] text-muted-foreground text-center py-1 font-semibold bg-muted/50 rounded-md transition-all hover:bg-muted hover:scale-105 cursor-pointer">
                                ✨ +{dayEvents.length - 3} mais
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </TooltipTrigger>
                  {date && dayEvents.length > 0 && (
                    <TooltipContent side="top" className="max-w-sm">
                      <div className="space-y-1">
                        <p className="font-semibold">
                          {date.toLocaleDateString("pt-BR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                          })}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {dayEvents.length} {dayEvents.length === 1 ? "evento" : "eventos"} agendado{dayEvents.length > 1 ? "s" : ""}
                        </p>
                      </div>
                    </TooltipContent>
                  )}
                </Tooltip>
              );
            })}
          </div>
        </Card>
      </div>
    </TooltipProvider>
  );
}

// Create Event Form Component (unchanged)
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
    eventDate: new Date().toISOString().slice(0, 16),
    endDate: "",
    eventType: "general" as EventType,
    petId: null as number | null,
    location: "",
    isAllDay: true,
    // Multi-day period fields
    checkInDate: "",
    checkOutDate: "",
  });
  
  // Calculate daily count when check-in/check-out dates change
  const dailyCount = useMemo(() => {
    if (!formData.checkInDate || !formData.checkOutDate) return null;
    const checkIn = new Date(formData.checkInDate);
    const checkOut = new Date(formData.checkOutDate);
    const diffMs = checkOut.getTime() - checkIn.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
    return Math.max(1, diffDays);
  }, [formData.checkInDate, formData.checkOutDate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate end date if provided
    if (formData.endDate) {
      const start = new Date(formData.eventDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        alert("Data de término deve ser posterior à data de início");
        return;
      }
    }

    // Validate period dates if provided
    if (formData.checkInDate && formData.checkOutDate) {
      const checkIn = new Date(formData.checkInDate);
      const checkOut = new Date(formData.checkOutDate);
      if (checkOut < checkIn) {
        alert("Data de check-out deve ser posterior à data de check-in");
        return;
      }
    }

    onSubmit({
      ...formData,
      eventDate: new Date(formData.eventDate),
      endDate: formData.endDate ? new Date(formData.endDate) : undefined,
      checkInDate: formData.checkInDate ? new Date(formData.checkInDate) : undefined,
      checkOutDate: formData.checkOutDate ? new Date(formData.checkOutDate) : undefined,
    } as any);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="title">Título *</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          required
          className="rounded-xl"
        />
      </div>

      <div>
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          className="rounded-xl"
          rows={3}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="eventType">Tipo de Evento *</Label>
          <Select
            value={formData.eventType}
            onValueChange={(value) =>
              setFormData({ ...formData, eventType: value as EventType })
            }
          >
            <SelectTrigger className="rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {Object.entries(EVENT_TYPES).map(([key, config]) => (
                <SelectItem key={key} value={key}>
                  {config.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {pets.length > 0 && (
          <div>
            <Label htmlFor="petId">Pet (opcional)</Label>
            <Select
              value={formData.petId?.toString() || "none"}
              onValueChange={(value) =>
                setFormData({
                  ...formData,
                  petId: value === "none" ? null : parseInt(value),
                })
              }
            >
              <SelectTrigger className="rounded-xl">
                <SelectValue placeholder="Selecione um pet" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum pet</SelectItem>
                {pets.map((pet) => (
                  <SelectItem key={pet.id} value={pet.id.toString()}>
                    {pet.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      <div>
        <Label htmlFor="eventDate">Data e Hora de Início *</Label>
        <Input
          id="eventDate"
          type="datetime-local"
          value={formData.eventDate}
          onChange={(e) => setFormData({ ...formData, eventDate: e.target.value })}
          required
          className="rounded-xl"
        />
      </div>

      <div>
        <Label htmlFor="endDate">Data e Hora de Término (Opcional)</Label>
        <Input
          id="endDate"
          type="datetime-local"
          value={formData.endDate}
          onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
          min={formData.eventDate}
          className="rounded-xl"
        />
        <p className="text-sm text-muted-foreground mt-1.5">
          Para eventos que duram vários dias (ex: viagem, hospedagem, tratamento)
        </p>
      </div>

      <div>
        <Label htmlFor="location">Local</Label>
        <Input
          id="location"
          value={formData.location}
          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
          className="rounded-xl"
          placeholder="Ex: Clínica Veterinária"
        />
      </div>

      {/* Multi-day period section (for checkin events) */}
      {(formData.eventType === "checkin" || formData.eventType === "checkout") && (
        <div className="border-t pt-4 space-y-4">
          <div>
            <Label className="text-base font-semibold">Período de Diárias</Label>
            <p className="text-sm text-muted-foreground mt-1">
              Configure o período de hospedagem (check-in a check-out)
            </p>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="checkInDate">Data de Check-in</Label>
              <Input
                id="checkInDate"
                type="date"
                value={formData.checkInDate}
                onChange={(e) => setFormData({ ...formData, checkInDate: e.target.value })}
                className="rounded-xl"
              />
            </div>
            
            <div>
              <Label htmlFor="checkOutDate">Data de Check-out</Label>
              <Input
                id="checkOutDate"
                type="date"
                value={formData.checkOutDate}
                onChange={(e) => setFormData({ ...formData, checkOutDate: e.target.value })}
                className="rounded-xl"
                min={formData.checkInDate}
              />
            </div>
          </div>
          
          {dailyCount !== null && dailyCount > 0 && (
            <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800 rounded-xl p-3">
              <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                📅 Total: <span className="font-bold">{dailyCount} {dailyCount === 1 ? 'diária' : 'diárias'}</span>
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-300 mt-1">
                {(() => {
                  const checkIn = formData.checkInDate instanceof Date 
                    ? formData.checkInDate 
                    : new Date(formData.checkInDate);
                  const checkOut = formData.checkOutDate instanceof Date 
                    ? formData.checkOutDate 
                    : new Date(formData.checkOutDate);
                  if (isNaN(checkIn.getTime()) || isNaN(checkOut.getTime())) return "";
                  return `${checkIn.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })} a ${checkOut.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })}`;
                })()}
              </p>
            </div>
          )}
        </div>
      )}

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isAllDay"
          checked={formData.isAllDay}
          onChange={(e) => setFormData({ ...formData, isAllDay: e.target.checked })}
          className="rounded"
        />
        <Label htmlFor="isAllDay" className="cursor-pointer">
          Evento de dia inteiro
        </Label>
      </div>

      <div className="flex justify-end gap-3 pt-4">
        <Button type="submit" className="rounded-xl">
          Criar Evento
        </Button>
      </div>
    </form>
  );
}
