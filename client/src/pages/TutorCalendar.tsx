import { useState, useMemo } from "react";
import TutorLayout from "@/components/TutorLayout";
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
  Syringe, Pill, Shield, Search, Filter, FileDown, CreditCard, DollarSign, Sparkles, LogIn, LogOut,
  FileText, Package, BarChart3, Heart, Zap, Users, Activity
} from "lucide-react";
import { format, startOfMonth, endOfMonth, startOfDay, isBefore, addDays, isSameDay } from "date-fns";

export default function TutorCalendar() {
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Partial<CalendarEvent>>({});
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState<"calendar" | "bookings" | "credits" | "logs">("calendar");
  
  // Filters
  const [selectedPet, setSelectedPet] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  // Get date range for current month
  const startDate = startOfMonth(currentDate);
  const endDate = endOfMonth(currentDate);

  // Fetch calendar events
  const { data: calendarEventsData, refetch: refetchCalendar } = trpc.calendar.getEvents.useQuery({
    startDate,
    endDate,
  });

  // Fetch my pets
  const { data: petsData } = trpc.pets.listMine.useQuery();

  // Fetch upcoming vaccines for my pets
  const { data: vaccinesData } = trpc.vaccines.upcoming.useQuery({ daysAhead: 90 });

  // Fetch active medications for my pets
  const { data: medicationsData } = trpc.medications.getActive.useQuery({});

  // Fetch booking requests for my pets
  const { data: bookingRequestsData, refetch: refetchBookings } = trpc.bookingRequests.myRequests.useQuery(undefined, {
    enabled: activeTab === "bookings",
  });

  // Cancel booking request mutation
  const cancelBookingRequest = trpc.bookingRequests.cancel.useMutation({
    onSuccess: () => {
      toast.success("Solicitação cancelada!");
      refetchBookings();
    },
    onError: (error) => {
      toast.error(`Erro: ${error.message}`);
    },
  });

  // Fetch logs for my pets
  const { data: logsData, refetch: refetchLogs } = trpc.logs.listMine.useQuery(undefined, {
    enabled: activeTab === "logs",
  });

  // Fetch recent changes for cogestão (co-management) - mostrar alterações do admin
  const { data: recentChangesData } = trpc.changeHistory.getPetHistory.useQuery(
    { petId: selectedPet || 0 },
    { enabled: false } // Desabilitado por padrão, pode ser habilitado quando necessário
  );

  // Transform and merge all events for tutor
  const allEvents = useMemo(() => {
    if (!calendarEventsData && !vaccinesData && !medicationsData) {
      return [];
    }

    const today = startOfDay(new Date());
    const upcomingThreshold = addDays(today, 7);

    // Transform calendar events
    const calendarEvents: CalendarEvent[] = (calendarEventsData || [])
      .filter((event: any) => {
        if (!event) return false;
        const eventDate = event.eventDate || event.event_date;
        if (!eventDate) return false;
        // Validate date
        const date = new Date(eventDate);
        return !isNaN(date.getTime());
      })
      .map((event: any) => {
        try {
          const eventDate = event.eventDate || event.event_date;
          if (!eventDate) return null;
          
          const parsedEventDate = new Date(eventDate);
          if (isNaN(parsedEventDate.getTime())) {
            console.warn("Invalid eventDate:", eventDate, event);
            return null;
          }
          
          let parsedEndDate: Date | null = null;
          if (event.endDate || event.end_date) {
            parsedEndDate = new Date(event.endDate || event.end_date);
            if (isNaN(parsedEndDate.getTime())) {
              parsedEndDate = null;
            }
          }
          
          let parsedCheckInDate: Date | null = null;
          if (event.checkInDate || event.check_in_date) {
            parsedCheckInDate = new Date(event.checkInDate || event.check_in_date);
            if (isNaN(parsedCheckInDate.getTime())) {
              parsedCheckInDate = null;
            }
          }
          
          let parsedCheckOutDate: Date | null = null;
          if (event.checkOutDate || event.check_out_date) {
            parsedCheckOutDate = new Date(event.checkOutDate || event.check_out_date);
            if (isNaN(parsedCheckOutDate.getTime())) {
              parsedCheckOutDate = null;
            }
          }
          
          return {
            id: event.id,
            title: event.title || "Sem título",
            description: event.description || null,
            eventDate: parsedEventDate,
            endDate: parsedEndDate,
            eventType: (event.eventType || event.event_type || "general") as CalendarEvent["eventType"],
            petId: event.petId || event.pet_id || null,
            petName: petsData?.find((p: any) => p.id === (event.petId || event.pet_id))?.name || null,
            location: event.location || null,
            isAllDay: event.isAllDay ?? event.is_all_day ?? true,
            checkInDate: parsedCheckInDate,
            checkOutDate: parsedCheckOutDate,
            dailyCount: event.dailyCount || event.daily_count || null,
            createdByRole: (event.createdByRole || event.created_by_role || null) as "admin" | "user" | null | undefined,
            createdByName: event.createdByName || event.created_by_name || null,
          };
        } catch (error) {
          console.error("Error transforming calendar event:", error, event);
          return null;
        }
      })
      .filter((e): e is CalendarEvent => e !== null);

    // Transform vaccines
    const vaccineEvents: CalendarEvent[] = (vaccinesData || [])
      .filter((v: any) => {
        if (!v || !v.nextDueDate) return false;
        // Only show vaccines for my pets
        if (!petsData || !Array.isArray(petsData)) return false;
        return petsData.some((p: any) => p && p.id === v.petId);
      })
      .map((vaccine: any) => {
        try {
          if (!vaccine.nextDueDate) return null;
          
          const parsedDate = new Date(vaccine.nextDueDate);
          if (isNaN(parsedDate.getTime())) {
            console.warn("Invalid vaccine nextDueDate:", vaccine.nextDueDate, vaccine);
            return null;
          }
          
          const eventDate = startOfDay(parsedDate);
          let status: "overdue" | "upcoming" | "future" = "future";
          
          if (isBefore(eventDate, today)) {
            status = "overdue";
          } else if (isBefore(eventDate, upcomingThreshold)) {
            status = "upcoming";
          }

          return {
            id: `vaccine-${vaccine.id}`,
            title: vaccine.vaccine?.name || vaccine.name || "Vacina",
            description: vaccine.notes || undefined,
            eventDate: parsedDate,
            endDate: null,
            eventType: "vaccination" as CalendarEvent["eventType"],
            petId: vaccine.petId,
            petName: (petsData || []).find((p: any) => p && p.id === vaccine.petId)?.name || null,
            location: undefined,
            isAllDay: true,
            status,
          };
        } catch (error) {
          console.error("Error transforming vaccine event:", error, vaccine);
          return null;
        }
      })
      .filter((e): e is CalendarEvent => e !== null);

    // Transform medications
    const medicationEvents: CalendarEvent[] = (medicationsData || [])
      .filter((m: any) => {
        if (!m) return false;
        if (!m.endDate && !m.end_date) return false;
        if (!m.startDate && !m.start_date) return false;
        // Only show medications for my pets
        if (!petsData || !Array.isArray(petsData)) return false;
        return petsData.some((p: any) => p && p.id === (m.petId || m.pet_id));
      })
      .map((med: any) => {
        try {
          const startDateValue = med.startDate || med.start_date;
          const endDateValue = med.endDate || med.end_date;
          
          if (!startDateValue || !endDateValue) return null;
          
          const parsedStartDate = new Date(startDateValue);
          const parsedEndDate = new Date(endDateValue);
          
          if (isNaN(parsedStartDate.getTime()) || isNaN(parsedEndDate.getTime())) {
            console.warn("Invalid medication dates:", { startDateValue, endDateValue }, med);
            return null;
          }
          
          const startDate = startOfDay(parsedStartDate);
          const endDate = startOfDay(parsedEndDate);
          let status: "overdue" | "upcoming" | "future" = "future";
          
          if (isBefore(endDate, today)) {
            status = "overdue";
          } else if (isBefore(endDate, upcomingThreshold)) {
            status = "upcoming";
          }

          return {
            id: `medication-${med.id}`,
            title: med.medication?.name || med.name || "Medicamento",
            description: med.notes || med.dosage || undefined,
            eventDate: parsedStartDate,
            endDate: parsedEndDate,
            eventType: "medication" as CalendarEvent["eventType"],
            petId: med.petId || med.pet_id || null,
            petName: (petsData || []).find((p: any) => p && p.id === (med.petId || med.pet_id))?.name || null,
            location: undefined,
            isAllDay: true,
            status,
          };
        } catch (error) {
          console.error("Error transforming medication event:", error, med);
          return null;
        }
      })
      .filter((e): e is CalendarEvent => e !== null);

    // Transform bookings (check-ins/check-outs) - removed as bookings are now in separate tab

    // Ensure all arrays are valid before concatenating
    const allValidEvents = [
      ...(Array.isArray(calendarEvents) ? calendarEvents : []),
      ...(Array.isArray(vaccineEvents) ? vaccineEvents : []),
      ...(Array.isArray(medicationEvents) ? medicationEvents : []),
    ];
    
    // Final validation: ensure all events have valid eventDate
    return allValidEvents.filter((e) => {
      if (!e || !e.eventDate) return false;
      if (e.eventDate instanceof Date) {
        return !isNaN(e.eventDate.getTime());
      }
      const date = new Date(e.eventDate);
      return !isNaN(date.getTime());
    });
  }, [calendarEventsData, vaccinesData, medicationsData, petsData]);

  // Apply filters
  const filteredEvents = useMemo(() => {
    if (!Array.isArray(allEvents)) return [];
    return allEvents.filter((event) => {
      if (!event) return false;
      // Ensure eventDate is valid
      if (!event.eventDate || !(event.eventDate instanceof Date)) {
        if (event.eventDate) {
          const date = new Date(event.eventDate);
          if (isNaN(date.getTime())) return false;
        } else {
          return false;
        }
      }
      if (selectedPet && event.petId !== selectedPet) return false;
      if (searchQuery && !(event.title || "").toLowerCase().includes(searchQuery.toLowerCase())) return false;
      return true;
    });
  }, [allEvents, selectedPet, searchQuery]);

  // Transform pets data
  const pets = (petsData || []).map((pet: any) => ({
    id: pet.id,
    name: pet.name,
  }));

  // Calculate stats
  const now = new Date();
  const thisMonthEvents = filteredEvents.filter((e) => {
    if (!e || !e.eventDate) return false;
    // eventDate should already be a Date object from allEvents useMemo
    const eventDate = e.eventDate instanceof Date ? e.eventDate : new Date(e.eventDate);
    if (isNaN(eventDate.getTime())) return false;
    return (
      eventDate.getMonth() === now.getMonth() &&
      eventDate.getFullYear() === now.getFullYear()
    );
  });

  const upcomingVaccinations = filteredEvents.filter((e) => {
    if (!e || !e.eventDate) return false;
    const eventDate = e.eventDate instanceof Date ? e.eventDate : new Date(e.eventDate);
    if (isNaN(eventDate.getTime())) return false;
    const thirtyDaysFromNow = new Date();
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30);
    return (
      e.eventType === "vaccination" &&
      eventDate >= now &&
      eventDate <= thirtyDaysFromNow
    );
  });

  const todayEvents = filteredEvents.filter((e) => {
    if (!e || !e.eventDate) return false;
    const eventDate = e.eventDate instanceof Date ? e.eventDate : new Date(e.eventDate);
    if (isNaN(eventDate.getTime())) return false;
    return (
      eventDate.getDate() === now.getDate() &&
      eventDate.getMonth() === now.getMonth() &&
      eventDate.getFullYear() === now.getFullYear()
    );
  });

  const overdueEvents = filteredEvents.filter((e: any) => e && e.status === "overdue");
  const upcomingEvents = filteredEvents.filter((e: any) => e && e.status === "upcoming");

  // Get events for selected date
  const selectedDateEvents = selectedDate
    ? filteredEvents
        .filter((e) => {
          if (!e || !e.eventDate) return false;
          const eventDate = e.eventDate instanceof Date ? e.eventDate : new Date(e.eventDate);
          if (isNaN(eventDate.getTime())) return false;
          return (
            eventDate.getDate() === selectedDate.getDate() &&
            eventDate.getMonth() === selectedDate.getMonth() &&
            eventDate.getFullYear() === selectedDate.getFullYear()
          );
        })
        .sort((a, b) => {
          const dateA = a.eventDate instanceof Date ? a.eventDate : new Date(a.eventDate);
          const dateB = b.eventDate instanceof Date ? b.eventDate : new Date(b.eventDate);
          if (isNaN(dateA.getTime()) || isNaN(dateB.getTime())) return 0;
          return dateA.getTime() - dateB.getTime();
        })
    : [];

  // Mutations
  const createEvent = trpc.calendar.add.useMutation({
    onSuccess: () => {
      toast.success("Evento criado com sucesso!");
      refetchCalendar();
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

  const getEventTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      vaccination: "Vacinação",
      medication: "Medicamento",
      preventive: "Preventivo",
      medical: "Consulta Médica",
      general: "Geral",
      holiday: "Feriado",
      closure: "Fechamento",
      checkin: "Check-in",
      checkout: "Check-out",
    };
    return labels[type] || type;
  };

  return (
    <TutorLayout>
      <div className="container max-w-7xl mx-auto py-6 space-y-6">
        {/* Header - Layout mais compacto e premium */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2 bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
              <Sparkles className="h-8 w-8 text-primary" />
              Calendário Completo
            </h1>
            <p className="text-muted-foreground mt-2">
              Gerencie eventos, vacinas, medicamentos, estadias e compromissos dos seus pets • Cogestão com a creche
            </p>
          </div>
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

        {/* Tabs: Calendar, Bookings, Credits, Logs */}
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as any)}>
          <TabsList>
            <TabsTrigger value="calendar">Calendário</TabsTrigger>
            <TabsTrigger value="bookings">Estadias</TabsTrigger>
            <TabsTrigger value="credits">Créditos</TabsTrigger>
            <TabsTrigger value="logs">Logs & Registros</TabsTrigger>
          </TabsList>

          <TabsContent value="calendar" className="space-y-4">
            {/* Stats Cards - Layout mais compacto */}
            <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
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

              <Card className="shadow-card hover:shadow-lg transition-shadow border-l-4 border-l-red-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Atrasados</CardTitle>
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-red-600">{overdueEvents.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Requerem atenção</p>
                </CardContent>
              </Card>

              <Card className="shadow-card hover:shadow-lg transition-shadow border-l-4 border-l-yellow-500">
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-sm font-medium">Próximos</CardTitle>
                    <Zap className="h-5 w-5 text-yellow-500" />
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-600">{upcomingEvents.length}</div>
                  <p className="text-xs text-muted-foreground mt-1">Próximos 7 dias</p>
                </CardContent>
              </Card>
            </div>

            {/* Filters - Layout mais compacto */}
            <Card className="shadow-card border-2 border-border/50">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Filter className="h-5 w-5" />
                  Filtros
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="grid gap-3 md:grid-cols-2">
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
                </div>
              </CardContent>
            </Card>

            {/* Premium Calendar */}
            {Array.isArray(filteredEvents) ? (
              <PremiumCalendar
                events={filteredEvents}
                onEventClick={handleEventClick}
                onCreateEvent={handleCreateEvent}
                onDayClick={handleDayClick}
                pets={pets}
                showCreateButton={true}
                role="tutor"
              />
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>Carregando eventos...</p>
              </div>
            )}

            {/* Day Agenda */}
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
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {selectedDateEvents.map((event) => {
                        const typeColors: Record<string, string> = {
                          vaccination: "border-blue-500 bg-blue-50 dark:bg-blue-950/20",
                          medication: "border-purple-500 bg-purple-50 dark:bg-purple-950/20",
                          preventive: "border-cyan-500 bg-cyan-50 dark:bg-cyan-950/20",
                          medical: "border-red-500 bg-red-50 dark:bg-red-950/20",
                          general: "border-gray-500 bg-gray-50 dark:bg-gray-950/20",
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
                                    <Badge variant="outline" className="text-xs border-yellow-500 text-yellow-600">
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
                                  {event.petName && (
                                    <div className="flex items-center gap-1">
                                      <Dog className="h-3.5 w-3.5" />
                                      {event.petName}
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

          <TabsContent value="bookings" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LogIn className="h-6 w-6 text-primary" />
                  Solicitações de Estadias
                </CardTitle>
                <CardDescription>
                  Visualize e gerencie as solicitações de estadias dos seus pets na creche
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!bookingRequestsData || bookingRequestsData.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <LogIn className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Nenhuma solicitação de estadia</p>
                    <p className="text-sm mt-2">
                      Faça uma solicitação na página de Agendamento
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {bookingRequestsData.map((request: any) => {
                      const dates = (request.requestedDates || []) as string[];
                      const statusColors: Record<string, string> = {
                        pending: "bg-yellow-50 border-yellow-200 text-yellow-800",
                        approved: "bg-green-50 border-green-200 text-green-800",
                        rejected: "bg-red-50 border-red-200 text-red-800",
                        cancelled: "bg-gray-50 border-gray-200 text-gray-800",
                      };
                      const statusLabels: Record<string, string> = {
                        pending: "Pendente",
                        approved: "Aprovada",
                        rejected: "Rejeitada",
                        cancelled: "Cancelada",
                      };

                      return (
                        <Card key={request.id} className="shadow-sm hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  {request.petPhoto && (
                                    <img
                                      src={request.petPhoto}
                                      alt={request.petName || "Pet"}
                                      className="w-12 h-12 rounded-full object-cover"
                                    />
                                  )}
                                  <div>
                                    <h3 className="font-semibold text-lg">{request.petName}</h3>
                                    <p className="text-sm text-muted-foreground">
                                      Solicitado em {format(new Date(request.createdAt), "dd/MM/yyyy 'às' HH:mm")}
                                    </p>
                                  </div>
                                </div>
                                
                                <div className="space-y-2">
                                  <div>
                                    <p className="text-sm font-medium mb-1">Datas solicitadas:</p>
                                    <div className="flex flex-wrap gap-2">
                                      {dates.map((dateStr: string, idx: number) => (
                                        <Badge key={idx} variant="outline" className="text-xs">
                                          {format(new Date(dateStr), "dd/MM/yyyy")}
                                        </Badge>
                                      ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-1">
                                      Total: {dates.length} {dates.length === 1 ? "dia" : "dias"}
                                    </p>
                                  </div>
                                  
                                  {request.notes && (
                                    <div>
                                      <p className="text-sm font-medium mb-1">Observações:</p>
                                      <p className="text-sm text-muted-foreground">{request.notes}</p>
                                    </div>
                                  )}
                                  
                                  {request.adminNotes && (
                                    <div>
                                      <p className="text-sm font-medium mb-1">Observações do Admin:</p>
                                      <p className="text-sm text-muted-foreground">{request.adminNotes}</p>
                                    </div>
                                  )}
                                </div>
                              </div>
                              
                              <div className="flex flex-col items-end gap-2">
                                <Badge className={statusColors[request.status] || "bg-gray-50 border-gray-200 text-gray-800"}>
                                  {statusLabels[request.status] || request.status}
                                </Badge>
                                {request.status === "pending" && (
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => {
                                      if (confirm("Deseja realmente cancelar esta solicitação?")) {
                                        cancelBookingRequest.mutate({ id: request.id });
                                      }
                                    }}
                                    disabled={cancelBookingRequest.isPending}
                                  >
                                    <X className="h-4 w-4 mr-2" />
                                    {cancelBookingRequest.isPending ? "Cancelando..." : "Cancelar"}
                                  </Button>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="credits" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-6 w-6 text-primary" />
                  Créditos dos Pets
                </CardTitle>
                <CardDescription>
                  Acompanhe o saldo de créditos e histórico de uso de cada pet
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {pets.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <CreditCard className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <p className="text-lg font-medium">Nenhum pet cadastrado</p>
                    </div>
                  ) : (
                    pets.map((pet) => {
                      const petData = petsData?.find((p: any) => p.id === pet.id);
                      const credits = petData?.credits || 0;
                      const isLow = credits < 5;
                      const isEmpty = credits === 0;

                      return (
                        <Card 
                          key={pet.id} 
                          className={`shadow-sm hover:shadow-md transition-shadow ${
                            isEmpty ? "border-red-300 bg-red-50/50" : isLow ? "border-yellow-300 bg-yellow-50/50" : ""
                          }`}
                        >
                          <CardContent className="p-4">
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <Dog className="h-8 w-8 text-primary" />
                                <div>
                                  <p className="font-semibold text-lg">{pet.name}</p>
                                  <p className="text-sm text-muted-foreground">
                                    {petData?.breed || "Sem raça definida"}
                                  </p>
                                </div>
                              </div>
                              <div className="text-right">
                                <p className={`text-3xl font-bold ${isEmpty ? "text-red-600" : isLow ? "text-yellow-600" : "text-primary"}`}>
                                  {credits}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {credits === 1 ? "crédito" : "créditos"}
                                </p>
                                {isEmpty && (
                                  <Badge variant="destructive" className="mt-1 text-xs">
                                    Sem créditos
                                  </Badge>
                                )}
                                {isLow && !isEmpty && (
                                  <Badge variant="outline" className="mt-1 text-xs border-yellow-500 text-yellow-600">
                                    Saldo baixo
                                  </Badge>
                                )}
                              </div>
                            </div>
                            
                            {/* Credit info */}
                            <div className="mt-4 pt-4 border-t">
                              <p className="text-xs text-muted-foreground">
                                Para ver histórico completo de créditos e usos, acesse a página de Créditos
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="space-y-6">
            <Card className="shadow-card">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-6 w-6 text-primary" />
                  Logs & Registros
                </CardTitle>
                <CardDescription>
                  Histórico completo de atividades e registros dos seus pets
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!logsData || logsData.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium">Nenhum registro encontrado</p>
                    <p className="text-sm mt-2">
                      Os registros aparecerão aqui quando houver atividades dos seus pets
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {logsData.map((log: any) => {
                      const sourceColors: Record<string, string> = {
                        home: "bg-blue-50 border-blue-200 text-blue-800",
                        daycare: "bg-purple-50 border-purple-200 text-purple-800",
                      };
                      const sourceLabels: Record<string, string> = {
                        home: "Casa",
                        daycare: "Creche",
                      };

                      return (
                        <Card key={log.id} className="shadow-sm hover:shadow-md transition-shadow">
                          <CardContent className="p-4">
                            <div className="flex items-start justify-between gap-4">
                              <div className="flex-1">
                                <div className="flex items-center gap-3 mb-3">
                                  <div className="flex items-center gap-2">
                                    <Badge className={sourceColors[log.source] || "bg-gray-50 border-gray-200 text-gray-800"}>
                                      {sourceLabels[log.source] || log.source}
                                    </Badge>
                                    <span className="text-sm font-semibold">
                                      {format(new Date(log.logDate || log.log_date), "dd/MM/yyyy")}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="grid gap-2 md:grid-cols-2">
                                  {log.mood && (
                                    <div>
                                      <p className="text-xs text-muted-foreground">Humor</p>
                                      <p className="text-sm font-medium capitalize">{log.mood}</p>
                                    </div>
                                  )}
                                  {log.appetite && (
                                    <div>
                                      <p className="text-xs text-muted-foreground">Apetite</p>
                                      <p className="text-sm font-medium capitalize">{log.appetite}</p>
                                    </div>
                                  )}
                                  {log.stool && (
                                    <div>
                                      <p className="text-xs text-muted-foreground">Evacuação</p>
                                      <p className="text-sm font-medium capitalize">{log.stool}</p>
                                    </div>
                                  )}
                                  {log.weight && (
                                    <div>
                                      <p className="text-xs text-muted-foreground">Peso</p>
                                      <p className="text-sm font-medium">{log.weight} kg</p>
                                    </div>
                                  )}
                                  {log.feedingAmount && (
                                    <div>
                                      <p className="text-xs text-muted-foreground">Quantidade de Ração</p>
                                      <p className="text-sm font-medium">{log.feedingAmount}</p>
                                    </div>
                                  )}
                                  {log.feedingAcceptance && (
                                    <div>
                                      <p className="text-xs text-muted-foreground">Aceitação da Ração</p>
                                      <p className="text-sm font-medium capitalize">{log.feedingAcceptance}</p>
                                    </div>
                                  )}
                                </div>
                                
                                {log.behavior && (
                                  <div className="mt-3">
                                    <p className="text-xs text-muted-foreground mb-1">Comportamento</p>
                                    <p className="text-sm">{log.behavior}</p>
                                  </div>
                                )}
                                
                                {log.notes && (
                                  <div className="mt-3">
                                    <p className="text-xs text-muted-foreground mb-1">Observações</p>
                                    <p className="text-sm text-muted-foreground">{log.notes}</p>
                                  </div>
                                )}
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
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
                <div className="flex gap-2 flex-wrap">
                  <Badge variant="secondary" className="text-sm px-3 py-1">
                    {getEventTypeLabel(selectedEvent.eventType)}
                  </Badge>
                  {(selectedEvent as any).status === "overdue" && (
                    <Badge variant="destructive">Atrasado</Badge>
                  )}
                  {(selectedEvent as any).status === "upcoming" && (
                    <Badge variant="outline" className="border-yellow-500 text-yellow-600">
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

                {selectedEvent.petName && (
                  <div className="flex items-center gap-3 p-4 bg-green-50 dark:bg-green-950/20 rounded-xl border-2 border-green-200 dark:border-green-800">
                    <Dog className="h-5 w-5 text-green-600" />
                    <span className="font-medium text-green-900 dark:text-green-100">
                      {selectedEvent.petName}
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
    </TutorLayout>
  );
}
