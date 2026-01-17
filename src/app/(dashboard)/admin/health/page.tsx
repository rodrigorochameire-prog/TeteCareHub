"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import {
  Syringe,
  Pill,
  ShieldCheck,
  Shield,
  Plus,
  Search,
  Calendar,
  Heart,
  AlertTriangle,
  Clock,
  Dog,
  CheckCircle,
  CheckCircle2,
  Sparkles,
  Leaf,
  Activity,
  Package,
  Bug,
  Droplets,
  BarChart3,
  TrendingUp,
  Bell,
  CalendarClock,
  ArrowUpRight,
  ChevronRight,
  MoreHorizontal,
  type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPie,
  Pie,
  Cell,
  Legend,
  RadialBarChart,
  RadialBar,
} from "recharts";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import Link from "next/link";

// Tipos de preventivos
const PREVENTIVE_TYPES: Array<{ value: string; label: string; icon: LucideIcon; color: string }> = [
  { value: "flea", label: "Antipulgas", icon: Bug, color: "orange" },
  { value: "deworming", label: "Vermífugo", icon: Droplets, color: "blue" },
  { value: "heartworm", label: "Cardioprotetor", icon: Heart, color: "rose" },
  { value: "tick", label: "Carrapaticida", icon: ShieldCheck, color: "emerald" },
];

// Tipos de medicamentos
const MEDICATION_TYPES: Array<{ value: string; label: string; icon: LucideIcon }> = [
  { value: "antibiotic", label: "Antibiótico", icon: Pill },
  { value: "antiinflammatory", label: "Anti-inflamatório", icon: Activity },
  { value: "analgesic", label: "Analgésico", icon: Syringe },
  { value: "supplement", label: "Suplemento", icon: Leaf },
  { value: "other", label: "Outro", icon: Package },
];

// Função para formatar data
function formatCurrentDate() {
  return format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR });
}

export default function AdminHealthPage() {
  const [mainTab, setMainTab] = useState("overview");
  const [searchTerm, setSearchTerm] = useState("");
  
  // Dialogs
  const [isAddVaccineOpen, setIsAddVaccineOpen] = useState(false);
  const [isAddMedicationOpen, setIsAddMedicationOpen] = useState(false);
  const [isAddPreventiveOpen, setIsAddPreventiveOpen] = useState(false);

  // Queries
  const { data: pets } = trpc.pets.list.useQuery();
  const { data: vaccineLibrary, refetch: refetchVaccines } = trpc.vaccines.library.useQuery();
  const { data: medicationLibrary, refetch: refetchMedications } = trpc.medications.library.useQuery();
  const { data: vaccineStats } = trpc.vaccines.stats.useQuery();
  const { data: preventiveStats } = trpc.preventives.stats.useQuery();
  const { data: upcomingVaccines } = trpc.vaccines.upcoming.useQuery({ daysAhead: 30 });
  const { data: upcomingPreventives } = trpc.preventives.upcoming.useQuery({ daysAhead: 30 });
  const { data: overduePreventives } = trpc.preventives.overdue.useQuery();
  const { data: dailyStatus } = trpc.petManagement.getDailyStatusCards.useQuery();

  // Mutations
  const addVaccineToLibrary = trpc.vaccines.addToLibrary.useMutation({
    onSuccess: () => {
      toast.success("Vacina cadastrada com sucesso!");
      setIsAddVaccineOpen(false);
      refetchVaccines();
    },
    onError: (error) => toast.error(error.message),
  });

  const addMedicationToLibrary = trpc.medications.addToLibrary.useMutation({
    onSuccess: () => {
      toast.success("Medicamento cadastrado com sucesso!");
      setIsAddMedicationOpen(false);
      refetchMedications();
    },
    onError: (error) => toast.error(error.message),
  });

  const addVaccination = trpc.vaccines.addVaccination.useMutation({
    onSuccess: () => {
      toast.success("Vacinação registrada!");
      setIsAddVaccineOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const addPreventive = trpc.preventives.add.useMutation({
    onSuccess: () => {
      toast.success("Preventivo registrado!");
      setIsAddPreventiveOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  const addMedication = trpc.medications.add.useMutation({
    onSuccess: () => {
      toast.success("Medicamento registrado!");
      setIsAddMedicationOpen(false);
    },
    onError: (error) => toast.error(error.message),
  });

  // Handlers
  const handleAddVaccine = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const isNewVaccine = formData.get("vaccineType") === "new";
    
    if (isNewVaccine) {
      addVaccineToLibrary.mutate({
        name: formData.get("customName") as string,
        description: formData.get("description") as string || undefined,
        intervalDays: formData.get("intervalDays") ? parseInt(formData.get("intervalDays") as string) : undefined,
        dosesRequired: 1,
      });
    } else {
      addVaccination.mutate({
        petId: parseInt(formData.get("petId") as string),
        vaccineId: parseInt(formData.get("vaccineId") as string),
        applicationDate: formData.get("applicationDate") as string,
        nextDueDate: formData.get("nextDueDate") as string || undefined,
        veterinarian: formData.get("veterinarian") as string || undefined,
        clinic: formData.get("clinic") as string || undefined,
        notes: formData.get("notes") as string || undefined,
      });
    }
  };

  const handleAddPreventive = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    addPreventive.mutate({
      petId: parseInt(formData.get("petId") as string),
      type: formData.get("type") as "flea" | "deworming" | "heartworm",
      productName: formData.get("productName") as string,
      applicationDate: formData.get("applicationDate") as string,
      nextDueDate: formData.get("nextDueDate") as string || undefined,
      dosage: formData.get("dosage") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    });
  };

  const handleAddMedication = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const isCustom = formData.get("medicationType") === "custom";
    
    addMedication.mutate({
      petId: parseInt(formData.get("petId") as string),
      medicationId: !isCustom ? parseInt(formData.get("medicationId") as string) : undefined,
      customMedName: isCustom ? formData.get("customName") as string : undefined,
      customMedType: isCustom ? formData.get("customType") as string : undefined,
      startDate: formData.get("startDate") as string,
      endDate: formData.get("endDate") as string || undefined,
      dosage: formData.get("dosage") as string,
      frequency: formData.get("frequency") as string || undefined,
      notes: formData.get("notes") as string || undefined,
    });
  };

  // Dados calculados
  const healthData = useMemo(() => {
    const totalVaccines = vaccineStats?.total || 0;
    const overdueVaccines = vaccineStats?.overdue || 0;
    const upcomingVaccinesCount = vaccineStats?.upcoming || 0;
    const inDayVaccines = Math.max(0, totalVaccines - overdueVaccines - upcomingVaccinesCount);

    // Taxa de cobertura
    const coverageRate = totalVaccines > 0 
      ? Math.round(((totalVaccines - overdueVaccines) / totalVaccines) * 100) 
      : 100;

    // Dados para gráfico radial de cobertura
    const coverageData = [
      { name: 'Cobertura', value: coverageRate, fill: '#f97316' },
    ];

    // Total de alertas
    const totalAlerts = overdueVaccines + (overduePreventives?.length || 0);

    // Preventivos totais
    const totalPreventives = (preventiveStats?.flea || 0) + 
                            (preventiveStats?.deworming || 0) + 
                            (preventiveStats?.tick || 0);

    return {
      totalVaccines,
      overdueVaccines,
      upcomingVaccinesCount,
      inDayVaccines,
      coverageRate,
      coverageData,
      totalAlerts,
      totalPreventives,
      medicationsToday: dailyStatus?.medicationsToApply || 0,
    };
  }, [vaccineStats, overduePreventives, preventiveStats, dailyStatus]);

  // Filtrar medicamentos (excluindo preventivos)
  const medicationsOnly = (medicationLibrary || []).filter(
    (m: any) => !["flea", "deworming", "heartworm", "tick"].includes(m.type)
  );

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 p-4 md:p-8 text-slate-800 dark:text-slate-200 space-y-6 font-sans -m-6">
      
      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center">
              <Heart className="h-5 w-5 text-rose-600 dark:text-rose-500" />
            </div>
            Central de Saúde
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
            Vacinas, medicamentos e preventivos • {formatCurrentDate()}
          </p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={() => setIsAddPreventiveOpen(true)}
            className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            <Shield className="mr-2 h-4 w-4" /> Preventivo
          </Button>
          <Button 
            onClick={() => setIsAddVaccineOpen(true)}
            className="bg-rose-600 hover:bg-rose-700 text-white border-none shadow-lg shadow-rose-500/20 dark:shadow-rose-900/20"
          >
            <Syringe className="mr-2 h-4 w-4" /> Nova Vacina
          </Button>
        </div>
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase">Vacinas</span>
            <Syringe className="h-4 w-4 text-blue-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{healthData.totalVaccines}</div>
          <div className="text-xs text-slate-500">registradas</div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase">Preventivos</span>
            <Shield className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{healthData.totalPreventives}</div>
          <div className="text-xs text-slate-500">aplicados</div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase">Próximas</span>
            <Calendar className="h-4 w-4 text-orange-500" />
          </div>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-2">{healthData.upcomingVaccinesCount}</div>
          <div className="text-xs text-slate-500">em 30 dias</div>
        </div>

        <div className={`bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm border rounded-xl p-4 ${healthData.totalAlerts > 0 ? 'border-rose-400 dark:border-rose-500/50' : 'border-slate-200 dark:border-slate-800'}`}>
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase">Alertas</span>
            <AlertTriangle className={`h-4 w-4 ${healthData.totalAlerts > 0 ? 'text-rose-500' : 'text-slate-400'}`} />
          </div>
          <div className={`text-2xl font-bold mt-2 ${healthData.totalAlerts > 0 ? 'text-rose-600 dark:text-rose-400' : 'text-slate-900 dark:text-white'}`}>
            {healthData.totalAlerts}
          </div>
          <div className="text-xs text-slate-500">atrasados</div>
        </div>

        <div className="bg-white/80 dark:bg-slate-900/60 backdrop-blur-sm border border-slate-200 dark:border-slate-800 rounded-xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-slate-500 dark:text-slate-400 text-xs font-medium uppercase">Cobertura</span>
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">{healthData.coverageRate}%</div>
          <div className="text-xs text-slate-500">em dia</div>
        </div>
      </div>

      {/* PAINEL DE CONTROLE */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Cobertura Vacinal (Radial) */}
        <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <CardTitle className="text-slate-900 dark:text-white text-base flex items-center gap-2">
              <Activity className="h-4 w-4 text-rose-500" />
              Cobertura Vacinal
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="relative h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadialBarChart 
                  innerRadius="70%" 
                  outerRadius="100%" 
                  barSize={20} 
                  data={[
                    { name: 'bg', value: 100, fill: '#e2e8f0' },
                    { name: 'Cobertura', value: healthData.coverageRate, fill: '#f97316' },
                  ]} 
                  startAngle={90} 
                  endAngle={-270}
                >
                  <RadialBar background dataKey="value" cornerRadius={10} />
                </RadialBarChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-4xl font-bold text-slate-900 dark:text-white">{healthData.coverageRate}%</span>
                <span className="text-sm text-slate-500">em dia</span>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-4">
              <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <p className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{healthData.inDayVaccines}</p>
                <p className="text-xs text-slate-500">Em dia</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <p className="text-lg font-bold text-orange-600 dark:text-orange-400">{healthData.upcomingVaccinesCount}</p>
                <p className="text-xs text-slate-500">Próximas</p>
              </div>
              <div className="text-center p-2 rounded-lg bg-slate-50 dark:bg-slate-800/50">
                <p className="text-lg font-bold text-rose-600 dark:text-rose-400">{healthData.overdueVaccines}</p>
                <p className="text-xs text-slate-500">Atrasadas</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Timeline de Próximos Tratamentos */}
        <Card className="lg:col-span-2 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex justify-between items-center">
              <CardTitle className="text-slate-900 dark:text-white text-base flex items-center gap-2">
                <CalendarClock className="h-4 w-4 text-blue-500" />
                Próximos Tratamentos
              </CardTitle>
              <Badge className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-0">
                30 dias
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-4 max-h-[300px] overflow-y-auto">
              {/* Vacinas próximas */}
              {upcomingVaccines && upcomingVaccines.slice(0, 4).map((item: any, index: number) => (
                <div key={`v-${item.vaccination.id}`} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-blue-500 ring-4 ring-blue-500/20"></div>
                    {index < 3 && <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-800 mt-2 min-h-[30px]"></div>}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{item.pet?.name}</span>
                        <Badge variant="outline" className="text-xs border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400">
                          Vacina
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-500">
                        {format(new Date(item.vaccination.nextDueDate), "dd/MM", { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{item.vaccine?.name}</p>
                  </div>
                </div>
              ))}
              
              {/* Preventivos próximos */}
              {upcomingPreventives && upcomingPreventives.slice(0, 4).map((item: any, index: number) => (
                <div key={`p-${item.treatment.id}`} className="flex gap-4 group">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20"></div>
                    {index < 3 && <div className="w-0.5 h-full bg-slate-200 dark:bg-slate-800 mt-2 min-h-[30px]"></div>}
                  </div>
                  <div className="flex-1 pb-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900 dark:text-white">{item.pet?.name}</span>
                        <Badge variant="outline" className="text-xs border-emerald-200 dark:border-emerald-800 text-emerald-600 dark:text-emerald-400">
                          Preventivo
                        </Badge>
                      </div>
                      <span className="text-xs text-slate-500">
                        {format(new Date(item.treatment.nextDueDate), "dd/MM", { locale: ptBR })}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">{item.treatment.productName}</p>
                  </div>
                </div>
              ))}

              {(!upcomingVaccines || upcomingVaccines.length === 0) && (!upcomingPreventives || upcomingPreventives.length === 0) && (
                <div className="text-center py-8">
                  <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <Calendar className="h-6 w-6 text-slate-400" />
                  </div>
                  <p className="text-slate-500 text-sm">Nenhum tratamento programado</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* ALERTAS */}
      {(healthData.totalAlerts > 0 || healthData.medicationsToday > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Vacinas atrasadas */}
          {healthData.overdueVaccines > 0 && (
            <div className="bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center flex-shrink-0">
                  <Syringe className="h-5 w-5 text-rose-600 dark:text-rose-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-rose-900 dark:text-rose-200">Vacinas Atrasadas</h4>
                  <p className="text-sm text-rose-700 dark:text-rose-300">{healthData.overdueVaccines} pet(s) com vacinas vencidas</p>
                  <Link href="/admin/vaccines">
                    <Button variant="link" className="text-rose-600 dark:text-rose-400 p-0 h-auto mt-1 text-sm">
                      Ver detalhes <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Preventivos atrasados */}
          {overduePreventives && overduePreventives.length > 0 && (
            <div className="bg-amber-50 dark:bg-amber-500/10 border border-amber-200 dark:border-amber-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center flex-shrink-0">
                  <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-amber-900 dark:text-amber-200">Preventivos Atrasados</h4>
                  <p className="text-sm text-amber-700 dark:text-amber-300">{overduePreventives.length} tratamento(s) vencido(s)</p>
                  <Button 
                    variant="link" 
                    className="text-amber-600 dark:text-amber-400 p-0 h-auto mt-1 text-sm"
                    onClick={() => setMainTab("preventives")}
                  >
                    Ver detalhes <ArrowUpRight className="h-3 w-3 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Medicações do dia */}
          {healthData.medicationsToday > 0 && (
            <div className="bg-blue-50 dark:bg-blue-500/10 border border-blue-200 dark:border-blue-500/30 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                  <Pill className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex-1">
                  <h4 className="font-medium text-blue-900 dark:text-blue-200">Medicações Hoje</h4>
                  <p className="text-sm text-blue-700 dark:text-blue-300">{healthData.medicationsToday} medicação(ões) para aplicar</p>
                  <Link href="/admin/medications">
                    <Button variant="link" className="text-blue-600 dark:text-blue-400 p-0 h-auto mt-1 text-sm">
                      Ver detalhes <ArrowUpRight className="h-3 w-3 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TABS PRINCIPAIS */}
      <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-4">
        <TabsList className="h-10 p-1 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700">
          <TabsTrigger value="overview" className="text-sm gap-1.5 px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="vaccines" className="text-sm gap-1.5 px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
            <Syringe className="h-4 w-4" />
            Vacinas
          </TabsTrigger>
          <TabsTrigger value="preventives" className="text-sm gap-1.5 px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
            <Shield className="h-4 w-4" />
            Preventivos
          </TabsTrigger>
          <TabsTrigger value="medications" className="text-sm gap-1.5 px-4 data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900">
            <Pill className="h-4 w-4" />
            Medicamentos
          </TabsTrigger>
        </TabsList>

        {/* ========== VISÃO GERAL ========== */}
        <TabsContent value="overview" className="space-y-6">
          {/* Gráficos */}
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Distribuição de Preventivos */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Shield className="h-4 w-4 text-emerald-500" />
                  Preventivos por Tipo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={[
                        { name: "Antipulgas", value: preventiveStats?.flea || 0 },
                        { name: "Vermífugo", value: preventiveStats?.deworming || 0 },
                        { name: "Carrapaticida", value: preventiveStats?.tick || 0 },
                      ]}
                      layout="vertical"
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" className="dark:stroke-slate-800" />
                      <XAxis type="number" stroke="#94a3b8" fontSize={12} />
                      <YAxis type="category" dataKey="name" width={100} stroke="#94a3b8" fontSize={12} />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'white', 
                          border: '1px solid #e2e8f0',
                          borderRadius: '8px'
                        }} 
                      />
                      <Bar dataKey="value" fill="#f97316" radius={[0, 4, 4, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Status de Vacinas */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader>
                <CardTitle className="text-base flex items-center gap-2">
                  <Syringe className="h-4 w-4 text-blue-500" />
                  Status de Vacinação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[250px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPie>
                      <Pie
                        data={[
                          { name: "Em dia", value: healthData.inDayVaccines, fill: "#10b981" },
                          { name: "Próximas", value: healthData.upcomingVaccinesCount, fill: "#f97316" },
                          { name: "Atrasadas", value: healthData.overdueVaccines, fill: "#ef4444" },
                        ].filter(d => d.value > 0)}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={80}
                        paddingAngle={2}
                        dataKey="value"
                        label={({ name, value }) => `${name}: ${value}`}
                        labelLine={false}
                      >
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </RechartsPie>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Cards de Tipos de Preventivos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {PREVENTIVE_TYPES.map((type) => {
              const count = preventiveStats?.[type.value as keyof typeof preventiveStats] || 0;
              return (
                <div
                  key={type.value}
                  onClick={() => setIsAddPreventiveOpen(true)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-4 cursor-pointer hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-500/30 transition-all group"
                >
                  <div className={`w-10 h-10 rounded-lg bg-${type.color}-100 dark:bg-${type.color}-500/20 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                    <type.icon className={`h-5 w-5 text-${type.color}-600 dark:text-${type.color}-400`} />
                  </div>
                  <p className="font-medium text-slate-900 dark:text-white">{type.label}</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{count}</p>
                  <p className="text-xs text-slate-500">registros</p>
                </div>
              );
            })}
          </div>
        </TabsContent>

        {/* ========== VACINAS ========== */}
        <TabsContent value="vaccines" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">Vacinas</h3>
              <p className="text-sm text-slate-500">Carteira de vacinação dos pets</p>
            </div>
            <Button 
              onClick={() => setIsAddVaccineOpen(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Nova Vacina
            </Button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Próximas */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  Próximas 30 dias
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingVaccines && upcomingVaccines.length > 0 ? (
                  <div className="space-y-2">
                    {upcomingVaccines.slice(0, 6).map((item: any) => (
                      <div key={item.vaccination.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
                            <Dog className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{item.pet?.name}</p>
                            <p className="text-xs text-slate-500">{item.vaccine?.name}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(item.vaccination.nextDueDate), "dd/MM/yy", { locale: ptBR })}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm text-slate-500">Nenhuma vacina programada</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Biblioteca de Vacinas */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">Vacinas Cadastradas</CardTitle>
                  <div className="relative w-40">
                    <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <Input
                      placeholder="Buscar..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8 h-8 text-sm bg-slate-50 dark:bg-slate-800 border-slate-200 dark:border-slate-700"
                    />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 max-h-[300px] overflow-y-auto">
                  {(vaccineLibrary || [])
                    .filter((v: any) => v.name.toLowerCase().includes(searchTerm.toLowerCase()))
                    .map((vaccine: any) => (
                      <div key={vaccine.id} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                        <p className="text-sm font-medium text-slate-900 dark:text-white">{vaccine.name}</p>
                        {vaccine.intervalDays && (
                          <p className="text-xs text-slate-500 mt-1">Reforço a cada {vaccine.intervalDays} dias</p>
                        )}
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ========== PREVENTIVOS ========== */}
        <TabsContent value="preventives" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">Preventivos</h3>
              <p className="text-sm text-slate-500">Antipulgas, vermífugos, carrapaticidas</p>
            </div>
            <Button 
              onClick={() => setIsAddPreventiveOpen(true)}
              className="bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Novo Preventivo
            </Button>
          </div>

          {/* Tipos de Preventivos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {PREVENTIVE_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setIsAddPreventiveOpen(true)}
                className="flex flex-col items-center gap-3 p-5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-orange-300 dark:hover:border-orange-500/30 transition-all"
              >
                <div className="h-10 w-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <type.icon className="h-5 w-5 text-slate-600 dark:text-slate-400" />
                </div>
                <span className="text-sm font-medium text-slate-900 dark:text-white">{type.label}</span>
              </button>
            ))}
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Atrasados */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2 text-rose-600 dark:text-rose-400">
                  <AlertTriangle className="h-4 w-4" />
                  Atrasados
                </CardTitle>
              </CardHeader>
              <CardContent>
                {overduePreventives && overduePreventives.length > 0 ? (
                  <div className="space-y-2">
                    {overduePreventives.slice(0, 5).map((item: any) => (
                      <div key={item.treatment.id} className="flex items-center justify-between p-3 rounded-lg bg-rose-50 dark:bg-rose-500/10 border border-rose-200 dark:border-rose-500/30">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-rose-100 dark:bg-rose-500/20 flex items-center justify-center">
                            <Dog className="h-4 w-4 text-rose-600 dark:text-rose-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{item.pet?.name}</p>
                            <p className="text-xs text-slate-500">{item.treatment.productName}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mx-auto mb-3">
                      <CheckCircle className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-sm font-medium text-slate-900 dark:text-white">Tudo em dia!</p>
                    <p className="text-xs text-slate-500">Nenhum tratamento atrasado</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Próximos */}
            <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Clock className="h-4 w-4 text-orange-500" />
                  Próximos 30 dias
                </CardTitle>
              </CardHeader>
              <CardContent>
                {upcomingPreventives && upcomingPreventives.length > 0 ? (
                  <div className="space-y-2">
                    {upcomingPreventives.slice(0, 5).map((item: any) => (
                      <div key={item.treatment.id} className="flex items-center justify-between p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center">
                            <Shield className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                          </div>
                          <div>
                            <p className="text-sm font-medium text-slate-900 dark:text-white">{item.pet?.name}</p>
                            <p className="text-xs text-slate-500">{item.treatment.productName}</p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {format(new Date(item.treatment.nextDueDate), "dd/MM", { locale: ptBR })}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <Calendar className="h-8 w-8 mx-auto text-slate-300 dark:text-slate-600 mb-2" />
                    <p className="text-sm text-slate-500">Nenhum preventivo agendado</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ========== MEDICAMENTOS ========== */}
        <TabsContent value="medications" className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-medium text-slate-900 dark:text-white">Medicamentos</h3>
              <p className="text-sm text-slate-500">Antibióticos, anti-inflamatórios, suplementos</p>
            </div>
            <Button 
              onClick={() => setIsAddMedicationOpen(true)}
              className="bg-purple-600 hover:bg-purple-700"
            >
              <Plus className="h-4 w-4 mr-1.5" />
              Novo Medicamento
            </Button>
          </div>

          {/* Tipos de Medicamentos */}
          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {MEDICATION_TYPES.map((type) => (
              <button
                key={type.value}
                onClick={() => setIsAddMedicationOpen(true)}
                className="flex flex-col items-center gap-2 p-4 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 hover:shadow-lg hover:border-purple-300 dark:hover:border-purple-500/30 transition-all"
              >
                <div className="h-9 w-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                  <type.icon className="h-4 w-4 text-slate-600 dark:text-slate-400" />
                </div>
                <span className="text-xs font-medium text-slate-900 dark:text-white">{type.label}</span>
              </button>
            ))}
          </div>

          {/* Medicamentos cadastrados */}
          <Card className="bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Medicamentos Cadastrados</CardTitle>
            </CardHeader>
            <CardContent>
              {medicationsOnly.length === 0 ? (
                <div className="text-center py-10">
                  <div className="w-14 h-14 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-3">
                    <Pill className="h-7 w-7 text-slate-400" />
                  </div>
                  <p className="text-sm font-medium text-slate-600 dark:text-slate-400">Nenhum medicamento</p>
                  <Button 
                    variant="link" 
                    onClick={() => setIsAddMedicationOpen(true)} 
                    className="mt-1 text-purple-600 dark:text-purple-400"
                  >
                    Adicionar primeiro
                  </Button>
                </div>
              ) : (
                <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
                  {medicationsOnly.map((med: any) => {
                    const type = MEDICATION_TYPES.find(t => t.value === med.type);
                    const Icon = type?.icon || Pill;
                    return (
                      <div key={med.id} className="flex items-center gap-3 p-3 rounded-lg bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer">
                        <div className="h-8 w-8 rounded-lg bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center flex-shrink-0">
                          <Icon className="h-4 w-4 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 dark:text-white truncate">{med.name}</p>
                          {med.commonDosage && (
                            <p className="text-xs text-slate-500 truncate">{med.commonDosage}</p>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* ========== DIALOGS ========== */}
      
      {/* Dialog: Nova Vacina */}
      <Dialog open={isAddVaccineOpen} onOpenChange={setIsAddVaccineOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Syringe className="h-5 w-5 text-blue-500" />
              Registrar Vacinação
            </DialogTitle>
            <DialogDescription>
              Registre uma vacinação ou adicione uma nova vacina
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddVaccine} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="petId">Pet *</Label>
                <Select name="petId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {pets?.map((pet: any) => (
                      <SelectItem key={pet.id} value={pet.id.toString()}>
                        {pet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="vaccineType">Tipo</Label>
                <Select name="vaccineType" defaultValue="existing">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="existing">Vacina existente</SelectItem>
                    <SelectItem value="new">Nova vacina</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="vaccineId">Vacina *</Label>
              <Select name="vaccineId">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a vacina" />
                </SelectTrigger>
                <SelectContent>
                  {vaccineLibrary?.map((v: any) => (
                    <SelectItem key={v.id} value={v.id.toString()}>
                      {v.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="customName">Ou digite o nome (nova vacina)</Label>
              <Input id="customName" name="customName" placeholder="Nome da vacina personalizada" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="applicationDate">Data da Aplicação *</Label>
                <Input type="date" id="applicationDate" name="applicationDate" defaultValue={new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextDueDate">Próxima Dose</Label>
                <Input type="date" id="nextDueDate" name="nextDueDate" />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="veterinarian">Veterinário</Label>
                <Input id="veterinarian" name="veterinarian" placeholder="Nome" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic">Clínica</Label>
                <Input id="clinic" name="clinic" placeholder="Nome da clínica" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" name="notes" placeholder="Observações..." rows={2} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddVaccineOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={addVaccination.isPending || addVaccineToLibrary.isPending}>
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Novo Preventivo */}
      <Dialog open={isAddPreventiveOpen} onOpenChange={setIsAddPreventiveOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-emerald-500" />
              Registrar Preventivo
            </DialogTitle>
            <DialogDescription>
              Antipulgas, vermífugos, carrapaticidas ou cardioprotetores
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddPreventive} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="petId">Pet *</Label>
                <Select name="petId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {pets?.map((pet: any) => (
                      <SelectItem key={pet.id} value={pet.id.toString()}>
                        {pet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="type">Tipo *</Label>
                <Select name="type" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {PREVENTIVE_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="productName">Nome do Produto *</Label>
              <Input id="productName" name="productName" placeholder="Ex: NexGard, Bravecto, Drontal..." required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="applicationDate">Data da Aplicação *</Label>
                <Input type="date" id="applicationDate" name="applicationDate" defaultValue={new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nextDueDate">Próxima Aplicação</Label>
                <Input type="date" id="nextDueDate" name="nextDueDate" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dosage">Dosagem</Label>
              <Input id="dosage" name="dosage" placeholder="Ex: 1 comprimido, 1 pipeta..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" name="notes" placeholder="Observações..." rows={2} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddPreventiveOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={addPreventive.isPending} className="bg-emerald-600 hover:bg-emerald-700">
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Dialog: Novo Medicamento */}
      <Dialog open={isAddMedicationOpen} onOpenChange={setIsAddMedicationOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pill className="h-5 w-5 text-purple-500" />
              Registrar Medicamento
            </DialogTitle>
            <DialogDescription>
              Antibióticos, anti-inflamatórios, suplementos
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddMedication} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="petId">Pet *</Label>
                <Select name="petId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {pets?.map((pet: any) => (
                      <SelectItem key={pet.id} value={pet.id.toString()}>
                        {pet.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="medicationType">Origem</Label>
                <Select name="medicationType" defaultValue="custom">
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="existing">Medicamento existente</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="medicationId">Medicamento da Biblioteca</Label>
              <Select name="medicationId">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {medicationsOnly.map((m: any) => (
                    <SelectItem key={m.id} value={m.id.toString()}>
                      {m.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customName">Nome do Medicamento</Label>
                <Input id="customName" name="customName" placeholder="Nome" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customType">Tipo</Label>
                <Select name="customType">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {MEDICATION_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        <div className="flex items-center gap-2">
                          <type.icon className="h-4 w-4" />
                          {type.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="dosage">Dosagem *</Label>
              <Input id="dosage" name="dosage" placeholder="Ex: 1 comprimido de 500mg" required />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Data de Início *</Label>
                <Input type="date" id="startDate" name="startDate" defaultValue={new Date().toISOString().split('T')[0]} required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Data de Término</Label>
                <Input type="date" id="endDate" name="endDate" />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="frequency">Frequência</Label>
              <Input id="frequency" name="frequency" placeholder="Ex: 2x ao dia, a cada 8h..." />
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" name="notes" placeholder="Observações..." rows={2} />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddMedicationOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={addMedication.isPending} className="bg-purple-600 hover:bg-purple-700">
                Salvar
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
