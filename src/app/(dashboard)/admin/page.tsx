"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dog, 
  Users, 
  CalendarCheck, 
  AlertCircle, 
  TrendingUp,
  ArrowUpRight,
  Clock,
  LayoutDashboard,
  Activity,
  PawPrint,
  Calendar,
  CreditCard,
  Syringe,
  Pill,
  Shield,
  Heart
} from "lucide-react";
import Link from "next/link";
import { LoadingPage } from "@/components/shared/loading";
import { PageIcon } from "@/components/shared/page-icon";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminDashboard() {
  const { data: petsData, isLoading: loadingPets } = trpc.pets.list.useQuery();
  const { data: pendingPets } = trpc.pets.pending.useQuery();
  const { data: tutors } = trpc.users.tutors.useQuery({});
  const { data: stats } = trpc.users.stats.useQuery();
  
  // Calendar events for today
  const now = new Date();
  const startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
  const { data: eventsData } = trpc.calendar.list.useQuery({
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  });

  const isLoading = loadingPets;

  if (isLoading) {
    return <LoadingPage />;
  }

  // Calculate stats
  const totalPets = petsData?.length || 0;
  const totalTutors = stats?.tutors || 0;
  const pendingCount = pendingPets?.length || 0;
  
  const todayEvents = eventsData?.filter((e) => {
    const eventDate = new Date(e.eventDate);
    return (
      eventDate.getDate() === now.getDate() &&
      eventDate.getMonth() === now.getMonth() &&
      eventDate.getFullYear() === now.getFullYear()
    );
  }) || [];

  const upcomingEvents = eventsData?.filter((e) => {
    const eventDate = new Date(e.eventDate);
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
    return eventDate >= now && eventDate <= sevenDaysFromNow;
  }).slice(0, 5) || [];

  // Get recent pets
  const recentPets = petsData?.slice(0, 5) || [];

  // Event type config
  const eventTypeConfig: Record<string, { icon: React.ElementType; color: string; label: string }> = {
    vaccination: { icon: Syringe, color: "text-blue-500", label: "Vacinação" },
    medication: { icon: Pill, color: "text-purple-500", label: "Medicamento" },
    preventive: { icon: Shield, color: "text-green-500", label: "Preventivo" },
    appointment: { icon: Calendar, color: "text-orange-500", label: "Consulta" },
    grooming: { icon: Sparkles, color: "text-pink-500", label: "Banho/Tosa" },
    other: { icon: Activity, color: "text-gray-500", label: "Outro" },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header - Clean e Minimalista */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <PageIcon icon={LayoutDashboard} size="lg" />
          <div className="space-y-1">
            <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
            <p className="text-sm text-muted-foreground flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              {format(now, "EEEE, d 'de' MMMM", { locale: ptBR })}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm" className="rounded-xl">
            <Link href="/admin/calendar" className="flex items-center gap-2">
              <Calendar className="h-4 w-4" />
              <span className="hidden sm:inline">Calendário</span>
            </Link>
          </Button>
          <Button asChild size="sm" className="rounded-xl">
            <Link href="/admin/pets" className="flex items-center gap-2">
              <PawPrint className="h-4 w-4" />
              <span className="hidden sm:inline">Ver Pets</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid - Minimalista */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Pets */}
        <Card className="group hover:shadow-md transition-all duration-200 border-border/50">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                <Dog className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
            <div className="text-2xl font-semibold tracking-tight">{totalPets}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Pets cadastrados</p>
          </CardContent>
        </Card>

        {/* Tutores */}
        <Card className="group hover:shadow-md transition-all duration-200 border-border/50">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                <Users className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
            <div className="text-2xl font-semibold tracking-tight">{totalTutors}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Tutores ativos</p>
          </CardContent>
        </Card>

        {/* Pendentes */}
        <Card className={`group hover:shadow-md transition-all duration-200 ${pendingCount > 0 ? 'border-amber-300/50 dark:border-amber-700/50' : 'border-border/50'}`}>
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className={`p-2 rounded-xl ${pendingCount > 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-slate-100 dark:bg-slate-800'}`}>
                <AlertCircle className={`h-4 w-4 ${pendingCount > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'}`} />
              </div>
            </div>
            <div className={`text-2xl font-semibold tracking-tight ${pendingCount > 0 ? 'text-amber-600 dark:text-amber-400' : ''}`}>{pendingCount}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Aguardando aprovação</p>
          </CardContent>
        </Card>

        {/* Eventos Hoje */}
        <Card className="group hover:shadow-md transition-all duration-200 border-border/50">
          <CardContent className="pt-5 pb-4">
            <div className="flex items-center justify-between mb-3">
              <div className="p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
                <CalendarCheck className="h-4 w-4 text-slate-600 dark:text-slate-400" />
              </div>
            </div>
            <div className="text-2xl font-semibold tracking-tight">{todayEvents.length}</div>
            <p className="text-xs text-muted-foreground mt-0.5">Eventos hoje</p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Próximos Eventos */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Próximos Eventos
              </CardTitle>
              <CardDescription>Eventos dos próximos 7 dias</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/calendar" className="flex items-center gap-1 text-primary">
                Ver todos
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {upcomingEvents.length === 0 ? (
              <div className="text-center py-8">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Nenhum evento programado</p>
                <Button asChild variant="outline" size="sm" className="mt-3">
                  <Link href="/admin/calendar">Criar evento</Link>
                </Button>
              </div>
            ) : (
              <div className="space-y-3">
                {upcomingEvents.map((event) => {
                  const config = eventTypeConfig[event.eventType] || eventTypeConfig.other;
                  const Icon = config.icon;
                  return (
                    <Link
                      key={event.id}
                      href="/admin/calendar"
                      className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent/50 hover:border-primary/30 transition-all group"
                    >
                      <div className={`p-2 rounded-lg bg-muted group-hover:scale-110 transition-transform ${config.color}`}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {event.pet?.name && `${event.pet.name} • `}
                          {format(new Date(event.eventDate), "EEE, d MMM", { locale: ptBR })}
                        </p>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {config.label}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pets Recentes */}
        <Card className="lg:col-span-1">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <PawPrint className="h-5 w-5 text-primary" />
                Pets Recentes
              </CardTitle>
              <CardDescription>Últimos pets cadastrados</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link href="/admin/pets" className="flex items-center gap-1 text-primary">
                Ver todos
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            {recentPets.length === 0 ? (
              <div className="text-center py-8">
                <Dog className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
                <p className="text-muted-foreground">Nenhum pet cadastrado</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentPets.map((pet) => (
                  <div
                    key={pet.id}
                    className="flex items-center gap-3 p-3 rounded-xl border bg-card hover:bg-accent/50 transition-all"
                  >
                    <div className="h-10 w-10 rounded-full bg-gradient-to-br from-primary/10 to-violet-500/10 flex items-center justify-center">
                      <Dog className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{pet.name}</p>
                      <p className="text-sm text-muted-foreground truncate">
                        {pet.breed || "Sem raça definida"}
                      </p>
                    </div>
                    <Badge
                      variant={pet.approvalStatus === "approved" ? "default" : "secondary"}
                      className={
                        pet.approvalStatus === "approved"
                          ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30"
                          : pet.approvalStatus === "pending"
                          ? "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30"
                          : "bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/30"
                      }
                    >
                      {pet.approvalStatus === "approved"
                        ? "Aprovado"
                        : pet.approvalStatus === "pending"
                        ? "Pendente"
                        : "Rejeitado"}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pendentes - Se houver */}
      {pendingCount > 0 && (
        <Card className="border-orange-500/30 bg-gradient-to-br from-orange-500/5 to-amber-500/5">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-orange-500/20">
                <AlertCircle className="h-5 w-5 text-orange-500" />
              </div>
              <div>
                <CardTitle>Aprovações Pendentes</CardTitle>
                <CardDescription>{pendingCount} pets aguardando sua aprovação</CardDescription>
              </div>
            </div>
            <Button asChild className="bg-orange-500 hover:bg-orange-600">
              <Link href="/admin/pets?status=pending" className="flex items-center gap-2">
                Revisar Agora
                <ArrowUpRight className="h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
        </Card>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Ações Rápidas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2 group hover:border-primary hover:bg-primary/5">
              <Link href="/admin/pets">
                <Dog className="h-5 w-5 group-hover:text-primary transition-colors" />
                <span>Gerenciar Pets</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2 group hover:border-primary hover:bg-primary/5">
              <Link href="/admin/tutors">
                <Users className="h-5 w-5 group-hover:text-primary transition-colors" />
                <span>Gerenciar Tutores</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2 group hover:border-primary hover:bg-primary/5">
              <Link href="/admin/finances">
                <CreditCard className="h-5 w-5 group-hover:text-primary transition-colors" />
                <span>Finanças</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 flex-col gap-2 group hover:border-primary hover:bg-primary/5">
              <Link href="/admin/calendar">
                <Calendar className="h-5 w-5 group-hover:text-primary transition-colors" />
                <span>Calendário</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
