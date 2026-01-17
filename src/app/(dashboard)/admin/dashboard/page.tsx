"use client";

import { useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Dog, 
  Activity, 
  Wallet, 
  CalendarClock, 
  Syringe, 
  ArrowUpRight, 
  MoreHorizontal,
  Users,
  Clock,
  CheckCircle2,
  Pill,
  AlertTriangle,
  PawPrint,
} from "lucide-react";
import { 
  ResponsiveContainer, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis, 
  Radar, 
  RadialBarChart, 
  RadialBar, 
  AreaChart, 
  Area 
} from "recharts";
import Link from "next/link";
import { DashboardSkeleton } from "@/components/shared/skeletons";

// Função para formatar data atual
function formatCurrentDate() {
  const now = new Date();
  const weekdays = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];
  const months = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
  return `${weekdays[now.getDay()]}, ${now.getDate()} ${months[now.getMonth()]}`;
}

export default function OperationsCenterDashboard() {
  // Queries essenciais - carregam primeiro com cache
  const { data: stats, isLoading: statsLoading } = trpc.dashboard.stats.useQuery(undefined, {
    staleTime: 60 * 1000, // 1 min cache
  });
  const { data: checkedInPets, isLoading: petsLoading } = trpc.dashboard.checkedInPets.useQuery(undefined, {
    staleTime: 30 * 1000, // 30s - dados críticos
  });

  // Queries secundárias - lazy loading (só carregam após stats)
  const { data: vaccineStats } = trpc.vaccines.stats.useQuery(undefined, {
    enabled: !!stats,
    staleTime: 5 * 60 * 1000,
  });
  const { data: allPets } = trpc.pets.list.useQuery(undefined, {
    enabled: !!stats,
    staleTime: 2 * 60 * 1000,
  });
  
  // Queries pesadas - lazy loading com cache longo
  const { data: petsAttention } = trpc.analytics.petsRequiringAttention.useQuery(undefined, {
    enabled: !!stats,
    staleTime: 5 * 60 * 1000,
  });
  const { data: dailyStatus } = trpc.petManagement.getDailyStatusCards.useQuery(undefined, {
    enabled: !!stats,
    staleTime: 2 * 60 * 1000,
  });

  // Calcular dados para os gráficos
  const dashboardData = useMemo(() => {
    const capacity = 40;
    const currentOccupancy = checkedInPets?.length || 0;
    const occupancyPercentage = Math.round((currentOccupancy / capacity) * 100);

    const occupancyData = [
      { name: 'Livre', uv: 100, fill: '#e2e8f0' },
      { name: 'Ocupado', uv: occupancyPercentage, fill: '#f97316' },
    ];

    const packVibeData = [
      { subject: 'Alta Energia', A: 70, fullMark: 100 },
      { subject: 'Calmos/Zen', A: 45, fullMark: 100 },
      { subject: 'Filhotes', A: 25, fullMark: 100 },
      { subject: 'Reativos', A: 15, fullMark: 100 },
      { subject: 'Brincalhões', A: 85, fullMark: 100 },
    ];

    const revenueData = [
      { name: 'Seg', value: 1200 },
      { name: 'Ter', value: 2100 },
      { name: 'Qua', value: 800 },
      { name: 'Qui', value: 1600 },
      { name: 'Sex', value: 2400 },
      { name: 'Sáb', value: 3000 },
      { name: 'Dom', value: 1200 },
    ];

    const estimatedRevenue = (checkedInPets?.length || 0) * 85;

    return {
      capacity,
      currentOccupancy,
      occupancyPercentage,
      occupancyData,
      packVibeData,
      revenueData,
      estimatedRevenue,
    };
  }, [checkedInPets]);

  // Timeline de eventos do dia
  const timelineEvents = useMemo(() => {
    const events = [];
    
    if (checkedInPets && checkedInPets.length > 0) {
      events.push({
        id: 'checkins',
        time: '08:00',
        title: `Check-in: ${checkedInPets.slice(0, 2).map(p => p.name).join(' & ')}${checkedInPets.length > 2 ? ` +${checkedInPets.length - 2}` : ''}`,
        description: `${checkedInPets.length} pets na creche hoje`,
        color: 'emerald',
      });
    }

    events.push({
      id: 'lunch',
      time: '12:30',
      title: 'Almoço Servido',
      description: `${checkedInPets?.length || 0} pets alimentados`,
      color: 'orange',
    });

    if (dailyStatus?.medicationsToApply && dailyStatus.medicationsToApply > 0) {
      events.push({
        id: 'medication',
        time: '14:00',
        title: 'Medicações Pendentes',
        description: `${dailyStatus.medicationsToApply} medicação(ões) para aplicar`,
        color: 'blue',
      });
    }

    return events;
  }, [checkedInPets, dailyStatus]);

  // Alertas de saúde
  const healthAlerts = useMemo(() => {
    const alerts = [];

    if (vaccineStats?.overdue && vaccineStats.overdue > 0) {
      alerts.push({
        id: 'vaccines',
        type: 'danger',
        icon: Syringe,
        title: 'Vacinas Vencidas',
        description: `${vaccineStats.overdue} pet(s) com vacinas atrasadas`,
        action: 'Notificar Tutores',
        actionLink: '/admin/vaccines',
      });
    }

    if (dailyStatus?.medicationsToApply && dailyStatus.medicationsToApply > 0) {
      alerts.push({
        id: 'medications',
        type: 'warning',
        icon: Pill,
        title: `Medicação Pendente`,
        description: `${dailyStatus.medicationsToApply} medicação(ões) para hoje`,
        action: 'Ver Detalhes',
        actionLink: '/admin/medications',
      });
    }

    if (petsAttention?.summary?.petsAffected && petsAttention.summary.petsAffected > 0) {
      alerts.push({
        id: 'attention',
        type: 'info',
        icon: AlertTriangle,
        title: 'Pets Requerem Atenção',
        description: `${petsAttention.summary.petsAffected} pet(s) com alertas`,
        action: 'Ver Lista',
        actionLink: '/admin/analytics',
      });
    }

    return alerts;
  }, [vaccineStats, dailyStatus, petsAttention]);

  if (statsLoading || petsLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 text-slate-800 dark:text-slate-200 space-y-8 font-sans -m-6">
      
      {/* HEADER: Boas Vindas & Ações Rápidas */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight">Operations Center</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Sistema Operacional • {formatCurrentDate()}
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/admin/calendar">
            <Button variant="outline" className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white">
              <CalendarClock className="mr-2 h-4 w-4" /> Ver Agenda
            </Button>
          </Link>
          <Link href="/admin/daycare">
            <Button className="bg-orange-600 hover:bg-orange-700 text-white border-none shadow-lg shadow-orange-500/20 dark:shadow-orange-900/20">
              <Dog className="mr-2 h-4 w-4" /> Check-in Rápido
            </Button>
          </Link>
        </div>
      </div>

      {/* BLOCO 1: Métricas Visuais (Ocupação, Vibe & Financeiro) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Card de Ocupação (Radial) - Colspan 4 */}
        <Card className="md:col-span-4 bg-white/80 dark:bg-slate-900/50 border-slate-200 dark:border-slate-800 backdrop-blur-sm relative overflow-hidden">
          <CardHeader>
            <CardTitle className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase tracking-wider flex justify-between">
              Capacidade Atual <Activity className="h-4 w-4 text-orange-500"/>
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center relative h-[250px] pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadialBarChart 
                innerRadius="70%" 
                outerRadius="100%" 
                barSize={20} 
                data={dashboardData.occupancyData} 
                startAngle={90} 
                endAngle={-270}
              >
                <RadialBar background dataKey="uv" cornerRadius={10} />
              </RadialBarChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-5xl font-bold text-slate-900 dark:text-white">{dashboardData.occupancyPercentage}%</span>
              <span className="text-sm text-slate-500">{dashboardData.currentOccupancy} / {dashboardData.capacity} Pets</span>
            </div>
          </CardContent>
          <div className="absolute bottom-4 left-0 right-0 text-center">
            <Badge 
              variant="outline" 
              className={`${
                dashboardData.occupancyPercentage >= 80 ? 'border-red-500/30 text-red-600 dark:text-red-400 bg-red-500/10' : 
                dashboardData.occupancyPercentage >= 50 ? 'border-orange-500/30 text-orange-600 dark:text-orange-400 bg-orange-500/10' :
                'border-emerald-500/30 text-emerald-600 dark:text-emerald-400 bg-emerald-500/10'
              }`}
            >
              {dashboardData.occupancyPercentage >= 80 ? 'Lotação Alta' : 
               dashboardData.occupancyPercentage >= 50 ? 'Lotação Média' : 'Lotação Normal'}
            </Badge>
          </div>
        </Card>

        {/* Card "Clima da Matilha" (Radar) - Colspan 5 */}
        <Card className="md:col-span-5 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-xl">
          <CardHeader>
             <CardTitle className="text-slate-700 dark:text-slate-200 text-sm font-medium flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-orange-500"></span>
              Perfil da Matilha (Hoje)
            </CardTitle>
          </CardHeader>
          <CardContent className="h-[280px] pt-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={dashboardData.packVibeData}>
                <PolarGrid stroke="#cbd5e1" className="dark:stroke-slate-700" />
                <PolarAngleAxis dataKey="subject" tick={{ fill: '#64748b', fontSize: 11 }} className="dark:fill-slate-400" />
                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                <Radar
                  name="Vibe"
                  dataKey="A"
                  stroke="#f97316"
                  strokeWidth={2}
                  fill="#f97316"
                  fillOpacity={0.3}
                />
              </RadarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Card Financeiro Rápido - Colspan 3 */}
        <Card className="md:col-span-3 bg-gradient-to-br from-white to-slate-50 dark:from-slate-900 dark:to-slate-950 border-slate-200 dark:border-slate-800 flex flex-col justify-between">
          <CardHeader>
            <CardTitle className="text-slate-500 dark:text-slate-400 text-sm font-medium uppercase">Receita Estimada</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-bold text-slate-900 dark:text-white">R$ {dashboardData.estimatedRevenue.toLocaleString('pt-BR')}</span>
              <span className="text-xs text-emerald-600 dark:text-emerald-500 flex items-center">+12% <ArrowUpRight className="h-3 w-3"/></span>
            </div>
            <p className="text-xs text-slate-500 mb-4">Referente a check-ins de hoje</p>
            
            <div className="h-[100px] w-full mt-auto">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dashboardData.revenueData}>
                  <defs>
                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <Area type="monotone" dataKey="value" stroke="#f97316" fillOpacity={1} fill="url(#colorRev)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* BLOCO 2: Stats Cards Rápidos */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase">Total Pets</span>
            <Dog className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{stats?.totalPets || 0}</div>
          <div className="text-xs text-slate-500">cadastrados</div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase">Na Creche</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{stats?.checkedIn || 0}</div>
          <div className="text-xs text-slate-500">check-ins ativos</div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase">Tutores</span>
            <Users className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{stats?.totalTutors || 0}</div>
          <div className="text-xs text-slate-500">clientes ativos</div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase">Pendentes</span>
            <Clock className="h-4 w-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{stats?.pendingApproval || 0}</div>
          <div className="text-xs text-slate-500">aguardando</div>
        </div>
      </div>

      {/* BLOCO 3: Operacional (Timeline & Saúde) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Timeline de Fluxo (Esquerda - Largo) */}
        <Card className="md:col-span-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-slate-900 dark:text-white text-base">Fluxo em Tempo Real</CardTitle>
              <Button variant="ghost" size="sm" className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800">
                <MoreHorizontal className="h-4 w-4"/>
              </Button>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-6">
              {timelineEvents.length > 0 ? timelineEvents.map((event, index) => (
                <div key={event.id} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className={`w-2 h-2 rounded-full ring-4 ${
                      event.color === 'emerald' ? 'bg-emerald-500 ring-emerald-500/20' :
                      event.color === 'orange' ? 'bg-orange-500 ring-orange-500/20' :
                      'bg-blue-500 ring-blue-500/20'
                    }`}></div>
                    {index < timelineEvents.length - 1 && (
                      <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-800 mt-2"></div>
                    )}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex justify-between">
                      <h4 className="text-slate-900 dark:text-white font-medium text-sm">{event.title}</h4>
                      <span className="text-xs text-slate-400 dark:text-slate-500">{event.time}</span>
                    </div>
                    <p className="text-slate-500 dark:text-slate-400 text-xs mt-1">{event.description}</p>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <CalendarClock className="h-6 w-6 text-slate-400 dark:text-slate-500" />
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-sm">Nenhum evento registrado hoje</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Alertas de Saúde (Direita - Estreito) */}
        <Card className="col-span-1 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
           <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <CardTitle className="text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Syringe className="h-4 w-4 text-rose-500"/> Saúde & Cuidados
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4 space-y-3">
            {healthAlerts.length > 0 ? healthAlerts.map((alert) => {
              const IconComponent = alert.icon;
              return (
                <div 
                  key={alert.id}
                  className={`bg-slate-50 dark:bg-slate-950/50 p-3 rounded-lg border-l-2 flex items-start gap-3 ${
                    alert.type === 'danger' ? 'border-rose-500' :
                    alert.type === 'warning' ? 'border-orange-500' :
                    'border-blue-500'
                  }`}
                >
                  <div className="mt-1">
                    <IconComponent className={`h-4 w-4 ${
                      alert.type === 'danger' ? 'text-rose-500' :
                      alert.type === 'warning' ? 'text-orange-500' :
                      'text-blue-500'
                    }`}/>
                  </div>
                  <div className="flex-1">
                    <h5 className="text-slate-700 dark:text-slate-200 text-sm font-medium">{alert.title}</h5>
                    <p className="text-xs text-slate-500">{alert.description}</p>
                    <Link href={alert.actionLink}>
                      <Button 
                        variant="link" 
                        className={`text-xs h-auto p-0 mt-1 ${
                          alert.type === 'danger' ? 'text-rose-600 dark:text-rose-400 hover:text-rose-700 dark:hover:text-rose-300' :
                          alert.type === 'warning' ? 'text-orange-600 dark:text-orange-400 hover:text-orange-700 dark:hover:text-orange-300' :
                          'text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300'
                        }`}
                      >
                        {alert.action}
                      </Button>
                    </Link>
                  </div>
                </div>
              );
            }) : (
              <div className="text-center py-6">
                <div className="w-10 h-10 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-2">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 dark:text-emerald-500" />
                </div>
                <p className="text-slate-600 dark:text-slate-400 text-sm">Tudo em ordem!</p>
                <p className="text-slate-400 dark:text-slate-500 text-xs">Nenhum alerta de saúde</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* BLOCO 4: Pets na Creche Hoje */}
      <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
          <div className="flex justify-between items-center">
            <CardTitle className="text-slate-900 dark:text-white text-base flex items-center gap-2">
              <PawPrint className="h-4 w-4 text-orange-500" />
              Pets na Creche Hoje
            </CardTitle>
            <Badge className="bg-orange-100 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 border-orange-200 dark:border-orange-500/30">
              {checkedInPets?.length || 0} pets
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="pt-4">
          {!checkedInPets || checkedInPets.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full mb-4">
                <Dog className="h-12 w-12 text-slate-400 dark:text-slate-500" />
              </div>
              <p className="text-lg font-medium text-slate-700 dark:text-slate-300 mb-2">Nenhum pet na creche</p>
              <p className="text-sm text-slate-500 max-w-sm">
                Faça o check-in dos pets quando chegarem
              </p>
              <Link href="/admin/daycare">
                <Button className="mt-4 bg-orange-600 hover:bg-orange-700 text-white">
                  <Dog className="mr-2 h-4 w-4" /> Fazer Check-in
                </Button>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {checkedInPets.slice(0, 12).map((pet) => (
                <Link key={pet.id} href={`/admin/pets/${pet.id}`}>
                  <div className="bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-3 hover:bg-slate-100 dark:hover:bg-slate-800 hover:border-orange-300 dark:hover:border-orange-500/30 transition-all cursor-pointer group">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-100 to-orange-200 dark:from-orange-500/20 dark:to-orange-600/20 flex items-center justify-center mx-auto mb-2 group-hover:from-orange-200 group-hover:to-orange-300 dark:group-hover:from-orange-500/30 dark:group-hover:to-orange-600/30 transition-all">
                      <span className="text-xl font-bold text-orange-600 dark:text-orange-400">{pet.name[0]}</span>
                    </div>
                    <p className="text-slate-900 dark:text-white font-medium text-sm text-center truncate">{pet.name}</p>
                    <p className="text-slate-500 text-xs text-center truncate">{pet.breed || "Sem raça"}</p>
                  </div>
                </Link>
              ))}
              {checkedInPets.length > 12 && (
                <Link href="/admin/pets">
                  <div className="bg-slate-50 dark:bg-slate-800/30 border border-dashed border-slate-300 dark:border-slate-700 rounded-xl p-3 hover:border-orange-300 dark:hover:border-orange-500/30 transition-all cursor-pointer flex flex-col items-center justify-center h-full min-h-[100px]">
                    <span className="text-2xl font-bold text-slate-400 dark:text-slate-500">+{checkedInPets.length - 12}</span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">Ver todos</span>
                  </div>
                </Link>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* BLOCO 5: Ações Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Link href="/admin/pets">
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-orange-300 dark:hover:border-orange-500/30 transition-all cursor-pointer group text-center">
            <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-orange-200 dark:group-hover:bg-orange-500/20 transition-all">
              <Dog className="h-6 w-6 text-orange-600 dark:text-orange-500" />
            </div>
            <span className="text-slate-900 dark:text-white font-medium text-sm">Gerenciar Pets</span>
          </div>
        </Link>

        <Link href="/admin/logs">
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-blue-300 dark:hover:border-blue-500/30 transition-all cursor-pointer group text-center">
            <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-200 dark:group-hover:bg-blue-500/20 transition-all">
              <Clock className="h-6 w-6 text-blue-600 dark:text-blue-500" />
            </div>
            <span className="text-slate-900 dark:text-white font-medium text-sm">Registrar Log</span>
          </div>
        </Link>

        <Link href="/admin/vaccines">
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-emerald-300 dark:hover:border-emerald-500/30 transition-all cursor-pointer group text-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-emerald-200 dark:group-hover:bg-emerald-500/20 transition-all">
              <Syringe className="h-6 w-6 text-emerald-600 dark:text-emerald-500" />
            </div>
            <span className="text-slate-900 dark:text-white font-medium text-sm">Vacinas</span>
          </div>
        </Link>

        <Link href="/admin/finances">
          <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl p-4 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-purple-300 dark:hover:border-purple-500/30 transition-all cursor-pointer group text-center">
            <div className="w-12 h-12 rounded-full bg-purple-100 dark:bg-purple-500/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-purple-200 dark:group-hover:bg-purple-500/20 transition-all">
              <Wallet className="h-6 w-6 text-purple-600 dark:text-purple-500" />
            </div>
            <span className="text-slate-900 dark:text-white font-medium text-sm">Finanças</span>
          </div>
        </Link>
      </div>
    </div>
  );
}
