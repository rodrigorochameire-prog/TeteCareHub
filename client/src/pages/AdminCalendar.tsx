import { useState, useMemo } from "react";
import AdminLayout from "@/components/AdminLayout";
import { PremiumCalendar, CalendarEvent } from "@/components/PremiumCalendar";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { 
  Calendar, Clock, MapPin, Dog, Trash2, TrendingUp, AlertCircle, CheckCircle2, Edit, X, Save, Download,
  Syringe, Pill, Shield, Bug, Search, Filter, FileDown, Users, CreditCard, DollarSign, Sparkles
} from "lucide-react";
import { CreateEventForms } from "@/components/CreateEventForms";
import { EditEventForms } from "@/components/EditEventForms";
import { BookingRequestsManager } from "@/components/BookingRequestsManager";
import { generateMonthlyReport } from "@/lib/exportMonthlyReport";
import { format, startOfMonth, endOfMonth, startOfDay, isBefore, addDays, isSameDay } from "date-fns";

type EventType = 
  | "vaccine" 
  | "medication" 
  | "flea" 
  | "deworming" 
  | "checkin" 
  | "checkout" 
  | "payment-income" 
  | "payment-expense"
  | "vaccination"
  | "preventive"
  | "medical"
  | "general"
  | "holiday"
  | "closure";

export default function AdminCalendar() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<CalendarEvent>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Advanced filters (from AdminHealthCalendar)
  const [selectedPet, setSelectedPet] = useState<number | null>(null);
  const [selectedTypes, setSelectedTypes] = useState<EventType[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"calendar" | "requests">("calendar");

  // Get date range for current month
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);

  // Fetch calendar events (basic)
  const { data: calendarEventsData, refetch: refetchCalendar } = trpc.calendar.getEvents.useQuery({
    startDate,
    endDate,
  });

  // Fetch health calendar events (advanced - includes vaccines, medications, bookings, transactions)
  const { data: healthEventsData = [], refetch: refetchHealth } = trpc.healthCalendar.getEvents.useQuery({
    startDate,
    endDate,
  });

  // Fetch occupancy stats
  const { data: occupancyData = [] } = trpc.healthCalendar.getOccupancyStats.useQuery({
    startDate,
    endDate,
  });

  // Fetch credit stats
  const { data: creditStats } = trpc.healthCalendar.getCreditStats.useQuery({
    startDate,
    endDate,
  });

  // Fetch all pets for filter
  const { data: petsData } = trpc.pets.list.useQuery();

  // Mutations
  const createEvent = trpc.calendar.add.useMutation({
    onSuccess: () => {
      toast.success("Evento criado com sucesso!");
      refetchCalendar();
      refetchHealth();
    },
    onError: (error) => {
      toast.error(`Erro ao criar evento: ${error.message}`);
    },
  });

  const deleteEvent = trpc.calendar.delete.useMutation({
    onSuccess: () => {
      toast.success("Evento excluído com sucesso!");
      setIsEventDialogOpen(false);
      setSelectedEvent(null);
      refetchCalendar();
    },
    onError: (error) => {
      toast.error(`Erro ao excluir evento: ${error.message}`);
    },
  });

  const updateEvent = trpc.calendar.update.useMutation({
    onSuccess: () => {
      toast.success("Evento atualizado com sucesso!");
      setIsEditMode(false);
      setIsEventDialogOpen(false);
      setSelectedEvent(null);
      refetchCalendar();
    },
    onError: (error) => {
      toast.error(`Erro ao atualizar evento: ${error.message}`);
    },
  });

  const exportMutation = trpc.calendar.exportToICal.useMutation({
    onSuccess: (data) => {
      const blob = new Blob([data.icalContent], { type: 'text/calendar' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'tucocare-calendar.ics';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("Calendário exportado com sucesso!");
    },
    onError: (error) => {
      toast.error(`Erro ao exportar: ${error.message}`);
    },
  });

  // Transform and merge all events
  const allEvents = useMemo(() => {
    if (!calendarEventsData && !healthEventsData) {
      return [];
    }

    const today = startOfDay(new Date());
    const upcomingThreshold = addDays(today, 7);

    // Transform calendar events with validation
    const calendarEvents: CalendarEvent[] = (calendarEventsData || [])
      .filter((event: any) => event && event.eventDate) // Filter out invalid events
      .map((event: any) => {
        try {
          return {
            id: event.id,
            title: event.title || "Sem título",
            description: event.description || null,
            eventDate: new Date(event.eventDate),
            endDate: event.endDate ? new Date(event.endDate) : null,
            eventType: (event.eventType || "general") as CalendarEvent["eventType"],
            petId: event.petId || null,
            petName: petsData?.find((p: any) => p.id === event.petId)?.name || null,
            location: event.location || null,
            isAllDay: event.isAllDay ?? true,
            checkInDate: event.checkInDate ? new Date(event.checkInDate) : null,
            checkOutDate: event.checkOutDate ? new Date(event.checkOutDate) : null,
            dailyCount: event.dailyCount || null,
            createdByRole: (event.createdByRole || null) as "admin" | "user" | null | undefined,
            createdByName: event.createdByName || null,
          };
        } catch (error) {
          console.error("Error transforming calendar event:", error, event);
          return null;
        }
      })
      .filter((e): e is CalendarEvent => e !== null);

    // Transform health calendar events (vaccines, medications, bookings, transactions)
    const healthEvents: CalendarEvent[] = (healthEventsData || [])
      .filter((event: any) => event && event.start) // Filter out invalid events
      .map((event: any) => {
        try {
          const eventDate = startOfDay(new Date(event.start));
          let status: "overdue" | "upcoming" | "future" = "future";

          const healthTypes: EventType[] = ["vaccine", "medication", "flea", "deworming"];
          if (healthTypes.includes(event.type)) {
            if (isBefore(eventDate, today)) {
              status = "overdue";
            } else if (isBefore(eventDate, upcomingThreshold)) {
              status = "upcoming";
            }
          }

          // Map health calendar types to calendar event types
          const typeMap: Record<string, string> = {
            vaccine: "vaccination",
            medication: "medication",
            flea: "preventive",
            deworming: "preventive",
            checkin: "checkin",
            checkout: "checkout",
            "payment-income": "general",
            "payment-expense": "general",
          };

          return {
            id: `health-${event.id}`,
            title: event.title || "Evento",
            description: event.notes || undefined,
            eventDate: new Date(event.start),
            endDate: event.end ? new Date(event.end) : null,
            eventType: (typeMap[event.type] || "general") as CalendarEvent["eventType"],
            petId: event.petId || null,
            petName: event.petName || null,
            location: undefined,
            isAllDay: false,
            status,
            bookingId: event.bookingId || null,
            amount: event.amount || null,
          };
        } catch (error) {
          console.error("Error transforming health event:", error, event);
          return null;
        }
      })
      .filter((e): e is CalendarEvent => e !== null);

    return [...calendarEvents, ...healthEvents];
  }, [calendarEventsData, healthEventsData, petsData]);

  // Apply filters
  const filteredEvents = useMemo(() => {
    return allEvents.filter((event) => {
      if (selectedPet && event.petId !== selectedPet) return false;
      
      if (selectedTypes.length > 0) {
        const eventTypeMap: Record<string, EventType[]> = {
          vaccination: ["vaccine", "vaccination"],
          medication: ["medication"],
          preventive: ["flea", "deworming", "preventive"],
          checkin: ["checkin"],
          checkout: ["checkout"],
          general: ["payment-income", "payment-expense", "general"],
        };
        
        const matches = selectedTypes.some(type => {
          const mapped = eventTypeMap[event.eventType] || [];
          return mapped.includes(type as any) || event.eventType === type;
        });
        if (!matches) return false;
      }
      
      if (selectedCategory) {
        const healthTypes: EventType[] = ["vaccine", "medication", "flea", "deworming", "vaccination", "preventive"];
        const operationalTypes: EventType[] = ["checkin", "checkout"];
        const financialTypes: EventType[] = ["payment-income", "payment-expense"];
        
        if (selectedCategory === "health" && !healthTypes.includes(event.eventType as EventType)) return false;
        if (selectedCategory === "operational" && !operationalTypes.includes(event.eventType as EventType)) return false;
        if (selectedCategory === "financial" && !financialTypes.includes(event.eventType as EventType)) return false;
      }
      
      if (searchQuery && !event.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [allEvents, selectedPet, selectedTypes, selectedCategory, searchQuery]);

  // Transform pets data
  const pets =
    petsData?.map((pet: any) => ({
      id: pet.id,
      name: pet.name,
    })) || [];

  // Calculate stats (from AdminHealthCalendar)
  const stats = useMemo(() => {
    const healthTypes: EventType[] = ["vaccine", "medication", "flea", "deworming", "vaccination", "preventive"];
    const operationalTypes: EventType[] = ["checkin", "checkout"];
    const financialTypes: EventType[] = ["payment-income", "payment-expense"];
    
    const health = filteredEvents.filter((e) => healthTypes.includes(e.eventType as EventType)).length;
    const operational = filteredEvents.filter((e) => operationalTypes.includes(e.eventType as EventType)).length;
    const financial = filteredEvents.filter((e) => financialTypes.includes(e.eventType as EventType)).length;
    
    const overdue = filteredEvents.filter((e: any) => e.status === "overdue").length;
    const upcoming = filteredEvents.filter((e: any) => e.status === "upcoming").length;
    
    const income = filteredEvents
      .filter((e: any) => e.amount && e.eventType === "general")
      .reduce((sum: number, e: any) => sum + (e.amount || 0), 0);
    const expense = filteredEvents
      .filter((e: any) => e.amount && e.eventType === "general")
      .reduce((sum: number, e: any) => sum + (e.amount || 0), 0);

    // Occupancy map
    const occupancyMap = new Map<string, number>();
    occupancyData.forEach((item: any) => {
      occupancyMap.set(item.date, item.occupancy);
    });
    const maxOccupancy = Math.max(...Array.from(occupancyMap.values()), 0);
    const avgOccupancy = occupancyMap.size > 0 
      ? Array.from(occupancyMap.values()).reduce((a, b) => a + b, 0) / occupancyMap.size 
      : 0;

    return { 
      health, 
      operational, 
      financial, 
      overdue, 
      upcoming, 
      total: filteredEvents.length,
      income,
      expense,
      balance: income - expense,
      maxOccupancy: Math.round(maxOccupancy),
      avgOccupancy: Math.round(avgOccupancy),
      creditsUsed: creditStats?.total || 0,
    };
  }, [filteredEvents, occupancyData, creditStats]);

  // Calculate basic stats for cards
  const now = new Date();
  const thisMonthEvents = filteredEvents.filter((e) => {
    const eventDate = new Date(e.eventDate);
    return (
      eventDate.getMonth() === now.getMonth() &&
      eventDate.getFullYear() === now.getFullYear()
    );
  });

  const upcomingVaccinations = filteredEvents.filter((e) => {
    const eventDate = new Date(e.eventDate);
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return (
      e.eventType === "vaccination" &&
      eventDate >= now &&
      eventDate <= thirtyDaysFromNow
    );
  });

  const todayEvents = filteredEvents.filter((e) => {
    const eventDate = new Date(e.eventDate);
    return (
      eventDate.getDate() === now.getDate() &&
      eventDate.getMonth() === now.getMonth() &&
      eventDate.getFullYear() === now.getFullYear()
    );
  });

  // Get events for selected date
  const selectedDateEvents = selectedDate
    ? filteredEvents.filter((e) => {
        const eventDate = new Date(e.eventDate);
        return (
          eventDate.getDate() === selectedDate.getDate() &&
          eventDate.getMonth() === selectedDate.getMonth() &&
          eventDate.getFullYear() === selectedDate.getFullYear()
        );
      }).sort((a, b) => a.eventDate.getTime() - b.eventDate.getTime())
    : [];

  const handleCreateEvent = (eventData: Partial<CalendarEvent>) => {
    createEvent.mutate({
      title: eventData.title!,
      description: eventData.description || undefined,
      eventDate: eventData.eventDate!,
      endDate: eventData.endDate || undefined,
      eventType: eventData.eventType!,
      petId: eventData.petId || undefined,
      location: eventData.location || undefined,
      isAllDay: eventData.isAllDay!,
    });
  };

  const handleEventClick = (event: CalendarEvent) => {
    setSelectedEvent(event);
    setIsEditMode(false);
    setIsEventDialogOpen(true);
  };

  const handleDeleteEvent = () => {
    if (!selectedEvent) return;
    deleteEvent.mutate({
      id: selectedEvent.id,
      petId: selectedEvent.petId || undefined,
      title: selectedEvent.title,
    });
  };

  const handleEditClick = () => {
    if (!selectedEvent) return;
    setEditForm({
      title: selectedEvent.title,
      description: selectedEvent.description || "",
      eventDate: selectedEvent.eventDate,
      endDate: selectedEvent.endDate || undefined,
      eventType: selectedEvent.eventType,
      petId: selectedEvent.petId || undefined,
      location: selectedEvent.location || "",
      isAllDay: selectedEvent.isAllDay,
    });
    setIsEditMode(true);
  };

  const handleSaveEdit = () => {
    if (!selectedEvent || !editForm.title) return;
    updateEvent.mutate({
      id: selectedEvent.id,
      title: editForm.title,
      description: editForm.description || undefined,
      eventDate: editForm.eventDate,
      endDate: editForm.endDate || undefined,
      eventType: editForm.eventType,
      petId: editForm.petId || undefined,
      location: editForm.location || undefined,
      isAllDay: editForm.isAllDay,
    });
  };

  const handleCancelEdit = () => {
    setIsEditMode(false);
    setEditForm({});
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
  };

  const handleExportToICal = () => {
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endDate = new Date(now.getFullYear(), now.getMonth() + 2, 0, 23, 59, 59);
    exportMutation.mutate({ startDate, endDate });
  };

  const handleExportMonthlyReport = () => {
    generateMonthlyReport(filteredEvents as any, stats as any, currentDate);
  };

  const toggleType = (type: EventType) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  };

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      vaccination: "Vacinação",
      vaccine: "Vacina",
      medication: "Medicamento",
      preventive: "Preventivo",
      medical: "Consulta Médica",
      general: "Geral",
      holiday: "Feriado",
      closure: "Fechamento",
      checkin: "Check-in",
      checkout: "Check-out",
      flea: "Antipulgas",
      deworming: "Vermífugo",
      "payment-income": "Receita",
      "payment-expense": "Despesa",
    };
    return labels[type] || type;
  };

  return (
    <AdminLayout>
      <div className="container py-8 space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
              <Sparkles className="h-8 w-8 text-primary" />
              Calendário Completo
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie todos os eventos, vacinas, medicamentos, check-ins e transações financeiras
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleExportMonthlyReport}
            >
              <FileDown className="mr-2 h-4 w-4" />
              Exportar Relatório
            </Button>
            <Button
              variant="outline"
              onClick={handleExportToICal}
              disabled={exportMutation.isPending}
            >
              {exportMutation.isPending ? (
                "Exportando..."
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Exportar iCal
                </>
              )}
            </Button>
          </div>
        </div>

        {/* Tabs: Calendar and Booking Requests */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "calendar" | "requests")}>
          <TabsList>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
            <TabsTrigger value="requests">Solicitações de Agendamento</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-6">
            {/* Advanced Statistics Cards (from AdminHealthCalendar) */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
              <Card className="shadow-card hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Total</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.total}</div>
                  <p className="text-xs text-muted-foreground mt-1">Eventos</p>
                </CardContent>
              </Card>

              <Card 
                className={`shadow-card hover:shadow-lg transition-shadow cursor-pointer ${
                  selectedCategory === "health" ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedCategory(selectedCategory === "health" ? null : "health")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Saúde</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">{stats.health}</div>
                  <p className="text-xs text-muted-foreground mt-1">Vacinas, meds, preventivos</p>
                </CardContent>
              </Card>

              <Card 
                className={`shadow-card hover:shadow-lg transition-shadow cursor-pointer ${
                  selectedCategory === "operational" ? "ring-2 ring-primary" : ""
                }`}
                onClick={() => setSelectedCategory(selectedCategory === "operational" ? null : "operational")}
              >
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Operacional</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-cyan-600">{stats.operational}</div>
                  <p className="text-xs text-muted-foreground mt-1">Check-ins/outs</p>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-lg transition-shadow border-l-4 border-l-orange-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Ocupação Máx</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-orange-600">{stats.maxOccupancy}</div>
                  <p className="text-xs text-muted-foreground mt-1">pets</p>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-lg transition-shadow border-l-4 border-l-purple-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Créditos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">{stats.creditsUsed}</div>
                  <p className="text-xs text-muted-foreground mt-1">usados no mês</p>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-lg transition-shadow border-l-4 border-l-emerald-500">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium">Saldo</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${stats.balance >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                    R$ {(stats.balance / 100).toFixed(2)}
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">financeiro</p>
                </CardContent>
              </Card>
            </div>

            {/* Basic Stats Cards (from TutorCalendar) */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="shadow-card hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Eventos este Mês</CardTitle>
                    <TrendingUp className="h-5 w-5 text-blue-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-600">{thisMonthEvents.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">
                    Agendados para {now.toLocaleDateString("pt-BR", { month: "long" })}
                  </p>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Vacinas Próximas</CardTitle>
                    <AlertCircle className="h-5 w-5 text-orange-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-orange-600">{upcomingVaccinations.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Próximos 30 dias</p>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-lg transition-shadow">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Eventos Hoje</CardTitle>
                    <CheckCircle2 className="h-5 w-5 text-green-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-600">{todayEvents.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Agendados para hoje</p>
                </CardContent>
              </Card>
            </div>

            {/* Advanced Filters (from AdminHealthCalendar) */}
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filtros Avançados
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-4">
                  {/* Search */}
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar eventos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 rounded-xl"
                    />
                  </div>

                  {/* Pet Filter */}
                  <Select
                    value={selectedPet?.toString() || "all"}
                    onValueChange={(value) => setSelectedPet(value === "all" ? null : parseInt(value))}
                  >
                    <SelectTrigger className="rounded-xl">
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

                  {/* Category Filter */}
                  <Select
                    value={selectedCategory || "all"}
                    onValueChange={(value) => setSelectedCategory(value === "all" ? null : value)}
                  >
                    <SelectTrigger className="rounded-xl">
                      <SelectValue placeholder="Categoria" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas categorias</SelectItem>
                      <SelectItem value="health">Saúde</SelectItem>
                      <SelectItem value="operational">Operacional</SelectItem>
                      <SelectItem value="financial">Financeiro</SelectItem>
                    </SelectContent>
                  </Select>

                  {/* Type Filter - Multi-select badges */}
                  <div className="flex flex-wrap gap-2">
                    {(["vaccine", "medication", "flea", "deworming", "checkin", "checkout"] as EventType[]).map((type) => {
                      const isSelected = selectedTypes.includes(type);
                      const icons: Record<string, any> = {
                        vaccine: Syringe,
                        medication: Pill,
                        flea: Bug,
                        deworming: Shield,
                        checkin: Clock,
                        checkout: Clock,
                      };
                      const Icon = icons[type] || Calendar;
                      return (
                        <Badge
                          key={type}
                          variant={isSelected ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleType(type)}
                        >
                          <Icon className="h-3 w-3 mr-1" />
                          {getEventTypeLabel(type)}
                        </Badge>
                      );
                    })}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Premium Calendar - Simple grid layout (from TutorCalendar) */}
            <PremiumCalendar
              events={filteredEvents}
              onEventClick={handleEventClick}
              onCreateEvent={handleCreateEvent}
              onDayClick={handleDayClick}
              pets={pets}
              showCreateButton={true}
              role="admin"
            />

            {/* Day Agenda - Shows when a date is selected */}
            {selectedDate && (
              <Card className="shadow-card border-2">
                <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-950/20 dark:to-purple-950/20">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-6 w-6 text-primary" />
                      <div>
                        <CardTitle className="text-2xl">Agenda do Dia</CardTitle>
                        <p className="text-sm text-muted-foreground mt-1">
                          {selectedDate.toLocaleDateString("pt-BR", {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedDate(null)}
                      className="rounded-full"
                    >
                      <X className="h-5 w-5" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-6">
                  {selectedDateEvents.length === 0 ? (
                    <div className="text-center py-12">
                      <Calendar className="h-16 w-16 text-muted-foreground/30 mx-auto mb-4" />
                      <p className="text-lg font-medium text-muted-foreground">
                        Nenhum evento agendado para este dia
                      </p>
                      <p className="text-sm text-muted-foreground mt-2">
                        Clique em "Novo Evento" para adicionar um compromisso
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedDateEvents.map((event) => {
                        const typeColors: Record<string, string> = {
                          vaccination: "border-blue-500 bg-blue-50 dark:bg-blue-950/20",
                          vaccine: "border-blue-500 bg-blue-50 dark:bg-blue-950/20",
                          medication: "border-purple-500 bg-purple-50 dark:bg-purple-950/20",
                          preventive: "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/20",
                          medical: "border-red-500 bg-red-50 dark:bg-red-950/20",
                          general: "border-gray-500 bg-gray-50 dark:bg-gray-950/20",
                          holiday: "border-green-500 bg-green-50 dark:bg-green-950/20",
                          closure: "border-orange-500 bg-orange-50 dark:bg-orange-950/20",
                          checkin: "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20",
                          checkout: "border-amber-500 bg-amber-50 dark:bg-amber-950/20",
                        };

                        return (
                          <div
                            key={event.id}
                            className={`p-4 rounded-xl border-l-4 ${typeColors[event.eventType] || "border-gray-500 bg-gray-50"} hover:shadow-md transition-all cursor-pointer`}
                            onClick={() => handleEventClick(event)}
                          >
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1 space-y-2">
                                <div className="flex items-center gap-3">
                                  {!event.isAllDay && (
                                    <div className="flex items-center gap-2 text-sm font-semibold">
                                      <Clock className="h-4 w-4" />
                                      {event.eventDate.toLocaleTimeString("pt-BR", {
                                        hour: "2-digit",
                                        minute: "2-digit",
                                      })}
                                    </div>
                                  )}
                                  <Badge variant="secondary" className="text-xs">
                                    {getEventTypeLabel(event.eventType)}
                                  </Badge>
                                  {(event as any).status === "overdue" && (
                                    <Badge variant="destructive" className="text-xs">
                                      Atrasado
                                    </Badge>
                                  )}
                                  {(event as any).status === "upcoming" && (
                                    <Badge variant="outline" className="text-xs border-orange-500 text-orange-600">
                                      Próximo
                                    </Badge>
                                  )}
                                </div>
                                <h3 className="font-semibold text-lg">{event.title}</h3>
                                {event.description && (
                                  <p className="text-sm text-muted-foreground line-clamp-2">
                                    {event.description}
                                  </p>
                                )}
                                <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                                  {event.location && (
                                    <div className="flex items-center gap-1">
                                      <MapPin className="h-3.5 w-3.5" />
                                      {event.location}
                                    </div>
                                  )}
                                  {event.petId && (
                                    <div className="flex items-center gap-1">
                                      <Dog className="h-3.5 w-3.5" />
                                      {event.petName || `Pet ID: ${event.petId}`}
                                    </div>
                                  )}
                                  {(event as any).amount && (
                                    <div className="flex items-center gap-1">
                                      <DollarSign className="h-3.5 w-3.5" />
                                      R$ {((event as any).amount / 100).toFixed(2)}
                                    </div>
                                  )}
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-8 w-8 rounded-full"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedEvent(event);
                                    handleEditClick();
                                    setIsEventDialogOpen(true);
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="requests">
            <BookingRequestsManager />
          </TabsContent>
        </Tabs>

        {/* Event Details/Edit Dialog */}
        <Dialog open={isEventDialogOpen} onOpenChange={(open) => {
          setIsEventDialogOpen(open);
          if (!open) {
            setIsEditMode(false);
            setEditForm({});
          }
        }}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="text-2xl flex items-center gap-3">
                <Calendar className="h-6 w-6 text-primary" />
                {isEditMode ? "Editar Evento" : selectedEvent?.title}
              </DialogTitle>
              <DialogDescription>
                {isEditMode ? "Modifique as informações do evento" : "Detalhes do evento"}
              </DialogDescription>
            </DialogHeader>

            {selectedEvent && !isEditMode && (
              <div className="space-y-6">
                {/* View Mode */}
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {getEventTypeLabel(selectedEvent.eventType)}
                  </Badge>
                  {(selectedEvent as any).status === "overdue" && (
                    <Badge variant="destructive">Atrasado</Badge>
                  )}
                  {(selectedEvent as any).status === "upcoming" && (
                    <Badge variant="outline" className="border-orange-500 text-orange-600">
                      Próximo
                    </Badge>
                  )}
                </div>

                {selectedEvent.description && (
                  <div className="bg-muted/50 p-4 rounded-xl">
                    <h3 className="font-semibold mb-2">Descrição</h3>
                    <p className="text-muted-foreground whitespace-pre-wrap">{selectedEvent.description}</p>
                  </div>
                )}

                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-950/20 rounded-xl border-2 border-blue-200 dark:border-blue-800">
                  <Clock className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900 dark:text-blue-100">
                      {selectedEvent.eventDate.toLocaleDateString("pt-BR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                    {!selectedEvent.isAllDay ? (
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                        Horário: {selectedEvent.eventDate.toLocaleTimeString("pt-BR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    ) : (
                      <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">Dia inteiro</p>
                    )}
                  </div>
                </div>

                {selectedEvent.location && (
                  <div className="flex items-center gap-3 p-4 bg-purple-50 dark:bg-purple-950/20 rounded-xl border-2 border-purple-200 dark:border-purple-800">
                    <MapPin className="h-5 w-5 text-purple-600" />
                    <span className="font-medium text-purple-900 dark:text-purple-100">
                      {selectedEvent.location}
                    </span>
                  </div>
                )}

                {selectedEvent.petId && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                    <Dog className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900 dark:text-green-100">
                      {selectedEvent.petName || `Pet ID: ${selectedEvent.petId}`}
                    </span>
                  </div>
                )}

                {(selectedEvent as any).amount && (
                  <div className="flex items-center gap-3 p-4 bg-emerald-50 dark:bg-emerald-950/20 rounded-xl border-2 border-emerald-200 dark:border-emerald-800">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                    <span className="font-medium text-emerald-900 dark:text-emerald-100">
                      R$ {((selectedEvent as any).amount / 100).toFixed(2)}
                    </span>
                  </div>
                )}

                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button
                    variant="outline"
                    onClick={() => setIsEventDialogOpen(false)}
                    className="rounded-xl"
                  >
                    Fechar
                  </Button>
                  <Button
                    variant="default"
                    onClick={handleEditClick}
                    className="rounded-xl"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Editar
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={handleDeleteEvent}
                    disabled={deleteEvent.isPending}
                    className="rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    {deleteEvent.isPending ? "Excluindo..." : "Excluir"}
                  </Button>
                </div>
              </div>
            )}

            {/* Edit Form */}
            {isEditMode && selectedEvent && (
              <div className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="edit-title">Título *</Label>
                    <Input
                      id="edit-title"
                      value={editForm.title || ""}
                      onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                      className="rounded-xl mt-1.5"
                      placeholder="Ex: Vacinação Antirrábica"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-description">Descrição</Label>
                    <Textarea
                      id="edit-description"
                      value={editForm.description || ""}
                      onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                      className="rounded-xl mt-1.5"
                      rows={3}
                      placeholder="Detalhes adicionais sobre o evento..."
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-type">Tipo de Evento *</Label>
                    <Select
                      value={editForm.eventType}
                      onValueChange={(value) =>
                        setEditForm({ ...editForm, eventType: value as CalendarEvent["eventType"] })
                      }
                    >
                      <SelectTrigger className="rounded-xl mt-1.5">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">Geral</SelectItem>
                        <SelectItem value="vaccination">Vacinação</SelectItem>
                        <SelectItem value="medication">Medicamento</SelectItem>
                        <SelectItem value="preventive">Preventivo</SelectItem>
                        <SelectItem value="medical">Consulta Médica</SelectItem>
                        <SelectItem value="checkin">Check-in</SelectItem>
                        <SelectItem value="checkout">Check-out</SelectItem>
                        <SelectItem value="holiday">Feriado</SelectItem>
                        <SelectItem value="closure">Fechamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="edit-pet">Pet (opcional)</Label>
                    <Select
                      value={editForm.petId?.toString() || "none"}
                      onValueChange={(value) =>
                        setEditForm({
                          ...editForm,
                          petId: value === "none" ? undefined : Number(value),
                        })
                      }
                    >
                      <SelectTrigger className="rounded-xl mt-1.5">
                        <SelectValue />
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

                  <div>
                    <Label htmlFor="edit-date">Data e Hora de Início *</Label>
                    <Input
                      id="edit-date"
                      type="datetime-local"
                      value={
                        editForm.eventDate
                          ? new Date(
                              editForm.eventDate.getTime() -
                                editForm.eventDate.getTimezoneOffset() * 60000
                            )
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        setEditForm({ ...editForm, eventDate: new Date(e.target.value) })
                      }
                      className="rounded-xl mt-1.5"
                    />
                  </div>

                  <div>
                    <Label htmlFor="edit-end-date">Data e Hora de Término (Opcional)</Label>
                    <Input
                      id="edit-end-date"
                      type="datetime-local"
                      value={
                        editForm.endDate
                          ? new Date(
                              editForm.endDate.getTime() -
                                editForm.endDate.getTimezoneOffset() * 60000
                            )
                              .toISOString()
                              .slice(0, 16)
                          : ""
                      }
                      onChange={(e) =>
                        setEditForm({ ...editForm, endDate: e.target.value ? new Date(e.target.value) : undefined })
                      }
                      className="rounded-xl mt-1.5"
                    />
                    <p className="text-sm text-muted-foreground mt-1.5">
                      Para eventos que duram vários dias (ex: hospedagem, viagem)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="edit-location">Local</Label>
                    <Input
                      id="edit-location"
                      value={editForm.location || ""}
                      onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                      placeholder="Ex: Clínica Veterinária"
                      className="rounded-xl mt-1.5"
                    />
                  </div>

                  <div className="flex items-center gap-2">
                    <Checkbox
                      id="edit-allday"
                      checked={editForm.isAllDay || false}
                      onCheckedChange={(checked) =>
                        setEditForm({ ...editForm, isAllDay: checked as boolean })
                      }
                    />
                    <Label htmlFor="edit-allday" className="cursor-pointer">
                      Evento de dia inteiro
                    </Label>
                  </div>
                </div>

                {/* Edit Actions */}
                <div className="flex justify-end gap-3 pt-4 border-t">
                  <Button variant="outline" onClick={handleCancelEdit} className="rounded-xl">
                    <X className="h-4 w-4 mr-2" />
                    Cancelar
                  </Button>
                  <Button
                    onClick={handleSaveEdit}
                    disabled={updateEvent.isPending || !editForm.title}
                    className="rounded-xl shadow-lg hover:shadow-xl transition-all"
                  >
                    <Save className="h-4 w-4 mr-2" />
                    {updateEvent.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AdminLayout>
  );
}
