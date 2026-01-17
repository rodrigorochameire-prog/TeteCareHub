"use client";

import { useState, useMemo, useRef } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Plus, 
  Brain,
  Smile,
  Frown,
  Zap,
  Heart,
  Dog,
  Calendar,
  BarChart3,
  TrendingUp,
  PieChart,
  ListFilter,
  Filter,
  Eye,
  Upload,
  Image,
  FileText,
  Video,
  Paperclip,
  X,
  Loader2,
  Users,
  AlertTriangle,
  Shield,
} from "lucide-react";
import { BreedIcon } from "@/components/breed-icons";
import { PetAvatar } from "@/components/pet-avatar";
import { toast } from "sonner";
import { BehaviorSkeleton } from "@/components/shared/skeletons";
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
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
import { generateAggregatedRadarDataPremium, type RadarMetric } from "@/lib/behavior-metrics";

const NEUTRAL_COLORS = ["#475569", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0"];

const socializationOptions = [
  { value: "excellent", label: "Excelente", color: "text-green-600", score: 4 },
  { value: "good", label: "Bom", color: "text-blue-600", score: 3 },
  { value: "moderate", label: "Moderado", color: "text-yellow-600", score: 2 },
  { value: "poor", label: "Ruim", color: "text-red-600", score: 1 },
];

const energyOptions = [
  { value: "high", label: "Alta", color: "text-orange-600", score: 3 },
  { value: "normal", label: "Normal", color: "text-blue-600", score: 2 },
  { value: "low", label: "Baixa", color: "text-gray-600", score: 1 },
];

const obedienceOptions = [
  { value: "excellent", label: "Excelente", color: "text-green-600", score: 3 },
  { value: "good", label: "Boa", color: "text-blue-600", score: 2 },
  { value: "needs_work", label: "Precisa Melhorar", color: "text-yellow-600", score: 1 },
];

const anxietyOptions = [
  { value: "none", label: "Nenhuma", color: "text-green-600", score: 4 },
  { value: "mild", label: "Leve", color: "text-yellow-600", score: 3 },
  { value: "moderate", label: "Moderada", color: "text-orange-600", score: 2 },
  { value: "severe", label: "Severa", color: "text-red-600", score: 1 },
];

const aggressionOptions = [
  { value: "none", label: "Nenhuma", color: "text-green-600", score: 4 },
  { value: "mild", label: "Leve", color: "text-yellow-600", score: 3 },
  { value: "moderate", label: "Moderada", color: "text-orange-600", score: 2 },
  { value: "severe", label: "Severa", color: "text-red-600", score: 1 },
];

const activityOptions = [
  "Brincou com outros cães",
  "Brincou sozinho",
  "Explorou ambiente",
  "Nadou na piscina",
  "Descansou bastante",
  "Participou de atividade em grupo",
  "Correu no gramado",
  "Brincou de buscar",
];

const periodOptions = [
  { value: "today", label: "Hoje" },
  { value: "week", label: "Esta Semana" },
  { value: "month", label: "Este Mês" },
  { value: "custom", label: "Personalizado" },
];

export default function AdminBehavior() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("logs");
  
  // Filtros
  const [periodFilter, setPeriodFilter] = useState("week");
  const [customDate, setCustomDate] = useState(new Date().toISOString().split("T")[0]);
  const [petFilter, setPetFilter] = useState<string>("all");
  
  // Anexos
  const [attachments, setAttachments] = useState<File[]>([]);
  const [selectedActivities, setSelectedActivities] = useState<string[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Calculate date filters based on period
  const dateFilters = useMemo(() => {
    const today = new Date();
    
    if (periodFilter === "custom") {
      return { date: customDate };
    }
    
    if (periodFilter === "today") {
      return { date: today.toISOString().split("T")[0] };
    }
    
    if (periodFilter === "week") {
      const startOfWeek = new Date(today);
      startOfWeek.setDate(today.getDate() - 7);
      return {
        startDate: startOfWeek.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      };
    }
    
    if (periodFilter === "month") {
      const startOfMonth = new Date(today);
      startOfMonth.setDate(today.getDate() - 30);
      return {
        startDate: startOfMonth.toISOString().split("T")[0],
        endDate: today.toISOString().split("T")[0],
      };
    }
    
    return {};
  }, [periodFilter, customDate]);

  // Query principal com cache
  const { data: logs, isLoading, refetch } = trpc.behavior.list.useQuery({
    ...dateFilters,
    limit: 100,
  }, {
    staleTime: 60 * 1000, // 1 min cache
  });

  // Reusar mesma query (evita duplicação de 500 registros)
  const allLogs = logs;

  const { data: pets } = trpc.pets.list.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  // Filtrar logs por pet
  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    if (petFilter === "all") return logs;
    return logs.filter(l => l.pet?.id === Number(petFilter));
  }, [logs, petFilter]);

  // Dados para infográficos
  const chartData = useMemo(() => {
    if (!allLogs) return { 
      socialization: [], energy: [], anxiety: [], byPet: [],
      radarData: [], timeline: [], alerts: 0
    };

    const socializationCount: Record<string, number> = {};
    const energyCount: Record<string, number> = {};
    const anxietyCount: Record<string, number> = {};
    const petCount: Record<string, number> = {};
    let alerts = 0;

    allLogs.forEach(log => {
      if (log.socialization) {
        socializationCount[log.socialization] = (socializationCount[log.socialization] || 0) + 1;
        if (log.socialization === "poor") alerts++;
      }
      if (log.energy) {
        energyCount[log.energy] = (energyCount[log.energy] || 0) + 1;
      }
      if (log.anxiety) {
        anxietyCount[log.anxiety] = (anxietyCount[log.anxiety] || 0) + 1;
        if (log.anxiety === "severe") alerts++;
      }
      if (log.aggression === "moderate" || log.aggression === "severe") alerts++;
      if (log.pet?.name) {
        petCount[log.pet.name] = (petCount[log.pet.name] || 0) + 1;
      }
    });

    const socialization = Object.entries(socializationCount).map(([key, value]) => ({
      name: socializationOptions.find(s => s.value === key)?.label || key,
      value
    }));

    const energy = Object.entries(energyCount).map(([key, value]) => ({
      name: energyOptions.find(e => e.value === key)?.label || key,
      value
    }));

    const anxiety = Object.entries(anxietyCount).map(([key, value]) => ({
      name: anxietyOptions.find(a => a.value === key)?.label || key,
      value
    }));

    const byPet = Object.entries(petCount)
      .map(([name, value]) => ({ name: name.length > 10 ? name.slice(0, 10) + '...' : name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

    // Radar data premium (média de comportamento) - usando módulo inteligente
    const formattedLogs = allLogs.map(log => ({
      id: log.id,
      petId: log.petId,
      logDate: log.logDate,
      socialization: log.socialization,
      energy: log.energy,
      obedience: log.obedience,
      anxiety: log.anxiety,
      aggression: log.aggression,
      notes: log.notes,
      activities: log.activities || [],
    }));
    
    const radarData = generateAggregatedRadarDataPremium(formattedLogs);

    // Timeline dos últimos 14 dias
    const timeline = Array.from({ length: 14 }, (_, i) => {
      const date = new Date();
      date.setDate(date.getDate() - (13 - i));
      const dateStr = date.toISOString().split("T")[0];
      const dayLogs = allLogs.filter(l => 
        new Date(l.logDate).toISOString().split("T")[0] === dateStr
      );
      return {
        date: date.toLocaleDateString("pt-BR", { weekday: "short", day: "numeric" }),
        registros: dayLogs.length,
      };
    });

    return { socialization, energy, anxiety, byPet, radarData, timeline, alerts };
  }, [allLogs]);

  const addLog = trpc.behavior.add.useMutation({
    onSuccess: () => {
      toast.success("Registro de comportamento salvo!");
      setIsAddDialogOpen(false);
      setAttachments([]);
      setSelectedActivities([]);
      refetch();
    },
    onError: (error) => {
      toast.error("Erro ao salvar registro: " + error.message);
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    
    const validFiles = Array.from(files).filter(file => {
      const isValid = file.type.startsWith("image/") || 
                      file.type === "application/pdf" ||
                      file.type.startsWith("video/");
      if (file.size > 50 * 1024 * 1024) {
        toast.error(`Arquivo ${file.name} é muito grande (máx. 50MB)`);
        return false;
      }
      return isValid;
    });
    
    setAttachments(prev => [...prev, ...validFiles]);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  const toggleActivity = (activity: string) => {
    setSelectedActivities(prev => 
      prev.includes(activity) 
        ? prev.filter(a => a !== activity)
        : [...prev, activity]
    );
  };

  const handleAddLog = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    addLog.mutate({
      petId: Number(formData.get("petId")),
      logDate: formData.get("logDate") as string,
      socialization: formData.get("socialization") as any || undefined,
      energy: formData.get("energy") as any || undefined,
      obedience: formData.get("obedience") as any || undefined,
      anxiety: formData.get("anxiety") as any || undefined,
      aggression: formData.get("aggression") as any || undefined,
      notes: formData.get("notes") as string || undefined,
      activities: selectedActivities.length > 0 ? selectedActivities : undefined,
    });
  };

  if (isLoading) {
    return <BehaviorSkeleton />;
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-icon">
            <Brain />
          </div>
          <div className="page-header-info">
            <h1>Comportamento</h1>
            <p>Registros de comportamento dos pets</p>
          </div>
        </div>
        <div className="page-header-actions">
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="btn-sm btn-primary">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Novo Registro
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total de Registros</span>
            <Brain className="stat-card-icon muted" />
          </div>
          <div className="stat-card-value">{allLogs?.length || 0}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Pets Avaliados</span>
            <Dog className="stat-card-icon blue" />
          </div>
          <div className="stat-card-value">{chartData.byPet.length}</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Esta Semana</span>
            <Calendar className="stat-card-icon green" />
          </div>
          <div className="stat-card-value">{filteredLogs.length}</div>
        </div>

        <div className={`stat-card ${chartData.alerts > 0 ? 'highlight' : ''}`}>
          <div className="stat-card-header">
            <span className="stat-card-title">Alertas</span>
            <AlertTriangle className={`stat-card-icon ${chartData.alerts > 0 ? 'amber' : 'muted'}`} />
          </div>
          <div className="stat-card-value">{chartData.alerts}</div>
        </div>
      </div>

      {/* Main Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="logs" className="gap-2">
            <ListFilter className="h-4 w-4" />
            Registros
          </TabsTrigger>
          <TabsTrigger value="analytics" className="gap-2">
            <BarChart3 className="h-4 w-4" />
            Análises
          </TabsTrigger>
        </TabsList>

        {/* Tab: Registros */}
        <TabsContent value="logs" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center gap-2">
                  <Label>Período:</Label>
                  <Select value={periodFilter} onValueChange={setPeriodFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {periodOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                {periodFilter === "custom" && (
                  <div className="flex items-center gap-2">
                    <Label>Data:</Label>
                    <Input
                      type="date"
                      value={customDate}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className="w-auto"
                    />
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Label>Pet:</Label>
                  <Select value={petFilter} onValueChange={setPetFilter}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os Pets</SelectItem>
                      {pets?.filter(p => p.approvalStatus === "approved").map(pet => (
                        <SelectItem key={pet.id} value={String(pet.id)}>{pet.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Logs */}
          {!filteredLogs || filteredLogs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Brain className="h-12 w-12 text-muted-foreground mb-4" />
                <p className="text-lg font-medium text-muted-foreground">
                  Nenhum registro encontrado
                </p>
                <Button 
                  variant="outline" 
                  className="mt-4"
                  onClick={() => setIsAddDialogOpen(true)}
                >
                  Registrar comportamento
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredLogs.map((item) => {
                const socialOpt = socializationOptions.find(s => s.value === item.socialization);
                const energyOpt = energyOptions.find(e => e.value === item.energy);
                const anxietyOpt = anxietyOptions.find(a => a.value === item.anxiety);

                return (
                  <Card 
                    key={item.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => { setSelectedLog(item); setIsViewDialogOpen(true); }}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <PetAvatar
                            photoUrl={item.pet?.photoUrl}
                            breed={item.pet?.breed}
                            name={item.pet?.name}
                            size="md"
                          />
                          <div>
                            <CardTitle className="text-base">{item.pet?.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {new Date(item.logDate).toLocaleDateString("pt-BR")}
                            </CardDescription>
                          </div>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-2 text-sm">
                        {item.socialization && (
                          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50">
                            <Users className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="outline" className={socialOpt?.color}>
                              {socialOpt?.label}
                            </Badge>
                          </div>
                        )}
                        {item.energy && (
                          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50">
                            <Zap className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="outline" className={energyOpt?.color}>
                              {energyOpt?.label}
                            </Badge>
                          </div>
                        )}
                        {item.anxiety && (
                          <div className="flex flex-col items-center gap-1 p-2 rounded-lg bg-muted/50">
                            <Frown className="h-4 w-4 text-muted-foreground" />
                            <Badge variant="outline" className={anxietyOpt?.color}>
                              {anxietyOpt?.label}
                            </Badge>
                          </div>
                        )}
                      </div>
                      {item.activities && item.activities.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1">
                          {item.activities.slice(0, 3).map((activity: string, i: number) => (
                            <Badge key={i} variant="secondary" className="text-xs">
                              {activity}
                            </Badge>
                          ))}
                          {item.activities.length > 3 && (
                            <Badge variant="secondary" className="text-xs">
                              +{item.activities.length - 3}
                            </Badge>
                          )}
                        </div>
                      )}
                      {item.notes && (
                        <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
                          {item.notes}
                        </p>
                      )}
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-muted-foreground">
                          Por: {item.createdBy?.name}
                        </p>
                        {(item as any).attachments && (
                          <Badge variant="outline" className="text-xs">
                            <Paperclip className="h-3 w-3 mr-1" />
                            Anexos
                          </Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>

        {/* Tab: Análises */}
        <TabsContent value="analytics" className="space-y-6">
          {/* Radar de Comportamento - Premium */}
          <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-500/25">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Perfil Comportamental Geral</CardTitle>
                    <CardDescription className="text-xs flex items-center gap-2 mt-0.5">
                      <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 text-[10px] font-medium">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                        {allLogs?.length || 0} registros
                      </span>
                      <span className="text-slate-400">|</span>
                      <span>Média de todos os pets</span>
                    </CardDescription>
                  </div>
                </div>
                
                {/* Score Geral */}
                {chartData.radarData.length > 0 && (
                  <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-xl shadow-blue-500/30">
                    <div className="text-center">
                      <div className="text-3xl font-bold tracking-tight">
                        {Math.round(chartData.radarData.reduce((sum: number, m: RadarMetric) => sum + m.value, 0) / chartData.radarData.length)}
                      </div>
                      <div className="text-[10px] uppercase tracking-wider opacity-80">Score Médio</div>
                    </div>
                    <div className="h-10 w-px bg-white/20" />
                    <div className="text-xs space-y-0.5">
                      <div className="flex items-center gap-1.5">
                        <TrendingUp className="h-3 w-3" />
                        <span>{chartData.radarData.filter((m: RadarMetric) => m.value > m.benchmark).length} acima da média</span>
                      </div>
                      <div className="flex items-center gap-1.5 opacity-75">
                        <BarChart3 className="h-3 w-3" />
                        <span>7 métricas</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                {/* Gráfico de Radar Premium */}
                <div className="lg:col-span-3 p-4 sm:p-6">
                  {/* Container com margens seguras */}
                  <div className="relative mx-0.5 sm:mx-1">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 rounded-full bg-gradient-to-br from-blue-500/10 via-blue-400/5 to-transparent blur-3xl" />
                    </div>
                    
                    <div className="h-[320px] sm:h-[400px] relative z-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart 
                          data={chartData.radarData} 
                          cx="50%" 
                          cy="50%" 
                          outerRadius="73%"
                          margin={{ top: 35, right: 35, bottom: 35, left: 35 }}
                        >
                          <defs>
                            <linearGradient id="adminRadarGradient" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#1e3a5f" stopOpacity={0.95} />
                              <stop offset="30%" stopColor="#2563eb" stopOpacity={0.8} />
                              <stop offset="60%" stopColor="#3b82f6" stopOpacity={0.6} />
                              <stop offset="100%" stopColor="#60a5fa" stopOpacity={0.4} />
                            </linearGradient>
                            <linearGradient id="adminBenchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#cbd5e1" stopOpacity={0.25} />
                              <stop offset="100%" stopColor="#e2e8f0" stopOpacity={0.1} />
                            </linearGradient>
                            <filter id="adminGlow" x="-50%" y="-50%" width="200%" height="200%">
                              <feGaussianBlur stdDeviation="3" result="coloredBlur"/>
                              <feMerge>
                                <feMergeNode in="coloredBlur"/>
                                <feMergeNode in="SourceGraphic"/>
                              </feMerge>
                            </filter>
                          </defs>
                          
                          <PolarGrid 
                            stroke="#e2e8f0" 
                            strokeWidth={1}
                            gridType="polygon"
                            strokeOpacity={0.6}
                          />
                          
                          <PolarAngleAxis 
                            dataKey="shortName" 
                            tick={(props: any) => {
                              const { x, y, payload, index } = props;
                              const item = chartData.radarData[index] as RadarMetric;
                              const isAbove = item && item.value > item.benchmark;
                              const xPos = typeof x === "number" ? x : 0;
                              const yPos = typeof y === "number" ? y : 0;
                              
                              return (
                                <g>
                                  <text 
                                    x={xPos} 
                                    y={yPos} 
                                    textAnchor="middle" 
                                    dominantBaseline="middle"
                                    fill={isAbove ? "#1e40af" : "#64748b"}
                                    fontSize={11}
                                    fontWeight={600}
                                  >
                                    {payload.value}
                                  </text>
                                  {item && (
                                    <text 
                                      x={xPos} 
                                      y={yPos + 12} 
                                      textAnchor="middle" 
                                      dominantBaseline="middle"
                                      fill={isAbove ? "#22c55e" : "#94a3b8"}
                                      fontSize={10}
                                      fontWeight={700}
                                    >
                                      {item.value}%
                                    </text>
                                  )}
                                </g>
                              );
                            }}
                            tickLine={false}
                          />
                          
                          <PolarRadiusAxis 
                            angle={90} 
                            domain={[0, 100]} 
                            tick={false}
                            axisLine={false}
                          />
                          
                          <Radar
                            name="Benchmark"
                            dataKey="benchmark"
                            stroke="#94a3b8"
                            strokeWidth={1.5}
                            strokeDasharray="6 4"
                            fill="url(#adminBenchmarkGradient)"
                            fillOpacity={0.5}
                          />
                          
                          <Radar
                            name="Média Geral"
                            dataKey="value"
                            stroke="url(#adminRadarGradient)"
                            strokeWidth={3}
                            fill="url(#adminRadarGradient)"
                            fillOpacity={0.65}
                            filter="url(#adminGlow)"
                            dot={{
                              r: 5,
                              fill: '#1e3a5f',
                              stroke: '#fff',
                              strokeWidth: 2,
                            }}
                          />
                          
                          <Legend 
                            wrapperStyle={{ paddingTop: 15 }}
                            iconType="circle"
                            iconSize={10}
                            formatter={(value) => (
                              <span className="text-xs font-medium text-slate-600 dark:text-slate-400 ml-1">
                                {value}
                              </span>
                            )}
                          />
                          
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0]?.payload as RadarMetric;
                                if (!data) return null;
                                const diff = data.value - data.benchmark;
                                const isGood = diff >= 0;
                                return (
                                  <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg p-4 rounded-2xl shadow-2xl border border-blue-100 dark:border-blue-900/50 min-w-[180px]">
                                    <div className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                                      {data.metric}
                                    </div>
                                    <div className="text-[10px] text-slate-500 dark:text-slate-400 mb-3">
                                      {data.description}
                                    </div>
                                    <div className="flex items-center justify-between">
                                      <div className="text-center">
                                        <div className={`text-xl font-bold ${isGood ? "text-blue-700" : "text-amber-600"}`}>
                                          {data.value}%
                                        </div>
                                        <div className="text-[9px] text-slate-400">Média</div>
                                      </div>
                                      <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        isGood 
                                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" 
                                          : "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
                                      }`}>
                                        {diff > 0 ? "+" : ""}{diff}%
                                      </div>
                                      <div className="text-center">
                                        <div className="text-lg font-semibold text-slate-400">
                                          {data.benchmark}%
                                        </div>
                                        <div className="text-[9px] text-slate-400">Esperado</div>
                                      </div>
                                    </div>
                                    {data.confidence !== undefined && (
                                      <div className="mt-2 pt-2 border-t border-slate-100 dark:border-slate-700">
                                        <div className="text-[10px] text-slate-400 flex items-center gap-1">
                                          Confiança: 
                                          <span className="font-medium text-slate-600 dark:text-slate-300">{data.confidence}%</span>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                );
                              }
                              return null;
                            }}
                          />
                        </RadarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
                
                {/* Barra Lateral de Métricas */}
                <div className="lg:col-span-2 bg-gradient-to-br from-slate-50/80 via-white to-blue-50/30 dark:from-slate-800/50 dark:via-slate-900 dark:to-blue-950/20 p-4 sm:p-5 border-t lg:border-t-0 lg:border-l border-slate-100/80 dark:border-slate-700/50 mx-0.5 sm:mx-0">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <div className="w-1 h-4 rounded-full bg-gradient-to-b from-blue-500 to-blue-700" />
                      <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">Métricas</h4>
                    </div>
                    <span className="text-[10px] px-2.5 py-1 rounded-full bg-gradient-to-r from-blue-500 to-blue-700 text-white font-semibold shadow-lg shadow-blue-500/20">
                      7 dimensões
                    </span>
                  </div>
                  
                  <div className="space-y-2.5">
                    {chartData.radarData.map((item: RadarMetric, idx: number) => {
                      const diff = item.value - item.benchmark;
                      const isGood = diff >= 0;
                      const percentage = Math.min(100, item.value);
                      
                      return (
                        <div 
                          key={idx} 
                          className="group p-2 rounded-lg transition-all duration-300 hover:bg-white/80 dark:hover:bg-slate-800/60"
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">
                              {item.metric}
                            </span>
                            <div className="flex items-center gap-2">
                              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                                isGood 
                                  ? "text-emerald-700 bg-emerald-100/80 dark:bg-emerald-900/40 dark:text-emerald-400" 
                                  : "text-amber-700 bg-amber-100/80 dark:bg-amber-900/40 dark:text-amber-400"
                              }`}>
                                {diff > 0 ? "+" : ""}{diff}
                              </span>
                              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                                {item.value}%
                              </span>
                            </div>
                          </div>
                          <div className="relative h-1.5 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden">
                            <div 
                              className="absolute top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-500 z-10"
                              style={{ left: `${item.benchmark}%` }}
                            />
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                isGood 
                                  ? "bg-gradient-to-r from-blue-500 to-blue-700" 
                                  : "bg-gradient-to-r from-amber-400 to-orange-500"
                              }`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  
                  {/* Qualidade dos Dados */}
                  {allLogs && allLogs.length > 0 && (
                    <div className="mt-4 p-3 rounded-xl bg-gradient-to-br from-blue-50 to-sky-50 dark:from-blue-950/40 dark:to-sky-950/40 border border-blue-100 dark:border-blue-900/50">
                      <div className="flex items-center gap-2 mb-2">
                        <Shield className="h-3.5 w-3.5 text-blue-500" />
                        <span className="text-[11px] font-semibold text-blue-700 dark:text-blue-300">
                          Qualidade dos Dados
                        </span>
                      </div>
                      <div className="text-[11px] text-blue-600/80 dark:text-blue-400/80">
                        {allLogs.length >= 50 ? (
                          <span>Excelente - {allLogs.length} registros analisados</span>
                        ) : allLogs.length >= 20 ? (
                          <span>Boa - {allLogs.length} registros analisados</span>
                        ) : (
                          <span>Limitada - apenas {allLogs.length} registros. Continue registrando!</span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Gráficos de Distribuição - Premium */}
          <div className="grid gap-4 lg:grid-cols-3 px-0.5">
            {/* Socialização */}
            <Card className="shadow-sm overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800/50 dark:to-blue-950/20 border-b border-slate-100/80 dark:border-slate-700/50">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500/15 to-blue-600/10">
                    <Users className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">Socialização</CardTitle>
                    <CardDescription className="text-[10px]">Interação com outros pets</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {chartData.socialization.length > 0 ? (
                  <div className="h-[200px] mx-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={chartData.socialization}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name }) => name}
                          labelLine={false}
                        >
                          {chartData.socialization.map((_, index) => (
                            <Cell key={`soc-${index}`} fill={NEUTRAL_COLORS[index % NEUTRAL_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
                          }} 
                        />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                    Sem dados
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Energia */}
            <Card className="shadow-sm overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800/50 dark:to-blue-950/20 border-b border-slate-100/80 dark:border-slate-700/50">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-orange-500/15 to-orange-600/10">
                    <Zap className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">Energia</CardTitle>
                    <CardDescription className="text-[10px]">Nível de atividade</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {chartData.energy.length > 0 ? (
                  <div className="h-[200px] mx-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={chartData.energy}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name }) => name}
                          labelLine={false}
                        >
                          {chartData.energy.map((_, index) => (
                            <Cell key={`energy-${index}`} fill={NEUTRAL_COLORS[index % NEUTRAL_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
                          }} 
                        />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                    Sem dados
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Ansiedade */}
            <Card className="shadow-sm overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800/50 dark:to-blue-950/20 border-b border-slate-100/80 dark:border-slate-700/50">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-amber-500/15 to-amber-600/10">
                    <Frown className="h-4 w-4 text-amber-600" />
                  </div>
                  <div>
                    <CardTitle className="text-sm font-bold">Ansiedade</CardTitle>
                    <CardDescription className="text-[10px]">Níveis de estresse</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {chartData.anxiety.length > 0 ? (
                  <div className="h-[200px] mx-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={chartData.anxiety}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name }) => name}
                          labelLine={false}
                        >
                          {chartData.anxiety.map((_, index) => (
                            <Cell key={`anx-${index}`} fill={NEUTRAL_COLORS[index % NEUTRAL_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
                          }} 
                        />
                      </RechartsPie>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                    Sem dados
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Timeline e Por Pet - Premium */}
          <div className="grid gap-4 lg:grid-cols-2 px-0.5">
            {/* Timeline */}
            <Card className="shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800/50 dark:to-blue-950/20 border-b border-slate-100/80 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500/15 to-blue-600/10">
                    <TrendingUp className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">Registros por Dia</CardTitle>
                    <CardDescription className="text-xs">Evolução dos últimos 14 dias</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-5">
                {chartData.timeline.length > 0 ? (
                  <div className="h-[280px] mx-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.timeline} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                        <defs>
                          <linearGradient id="behaviorBarGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0%" stopColor="#1e3a5f" stopOpacity={0.9}/>
                            <stop offset="100%" stopColor="#1e3a5f" stopOpacity={0.6}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} vertical={false} />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
                          }} 
                        />
                        <Bar dataKey="registros" name="Registros" fill="url(#behaviorBarGradient)" radius={[6, 6, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                    Sem dados disponíveis
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Por Pet */}
            <Card className="shadow-sm overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800/50 dark:to-blue-950/20 border-b border-slate-100/80 dark:border-slate-700/50">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500/15 to-blue-600/10">
                    <Dog className="h-4 w-4 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">Registros por Pet</CardTitle>
                    <CardDescription className="text-xs">Pets com mais avaliações</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-4 sm:p-5">
                {chartData.byPet.length > 0 ? (
                  <div className="h-[280px] mx-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={chartData.byPet} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                        <defs>
                          <linearGradient id="behaviorPetBarGradient" x1="0" y1="0" x2="1" y2="0">
                            <stop offset="0%" stopColor="#1e3a5f" stopOpacity={0.9}/>
                            <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.7}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} horizontal={false} />
                        <XAxis type="number" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis type="category" dataKey="name" width={80} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
                          }} 
                        />
                        <Bar dataKey="value" name="Registros" fill="url(#behaviorPetBarGradient)" radius={[0, 6, 6, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                ) : (
                  <div className="h-[280px] flex items-center justify-center text-muted-foreground text-sm">
                    Sem dados disponíveis
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <form onSubmit={handleAddLog}>
            <DialogHeader>
              <DialogTitle>Registro de Comportamento</DialogTitle>
              <DialogDescription>
                Registre o comportamento do pet na creche
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="petId">Pet *</Label>
                  <Select name="petId" required>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {pets?.filter(p => p.approvalStatus === "approved").map((pet) => (
                        <SelectItem key={pet.id} value={String(pet.id)}>
                          {pet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="logDate">Data *</Label>
                  <Input
                    id="logDate"
                    name="logDate"
                    type="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Socialização</Label>
                  <Select name="socialization">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {socializationOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className={opt.color}>{opt.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Energia</Label>
                  <Select name="energy">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {energyOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className={opt.color}>{opt.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Obediência</Label>
                  <Select name="obedience">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {obedienceOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className={opt.color}>{opt.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Ansiedade</Label>
                  <Select name="anxiety">
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      {anxietyOptions.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className={opt.color}>{opt.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Agressividade</Label>
                <Select name="aggression">
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {aggressionOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        <span className={opt.color}>{opt.label}</span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Atividades */}
              <div className="space-y-2">
                <Label>Atividades Realizadas</Label>
                <div className="flex flex-wrap gap-2">
                  {activityOptions.map((activity) => (
                    <Badge
                      key={activity}
                      variant={selectedActivities.includes(activity) ? "default" : "outline"}
                      className="cursor-pointer"
                      onClick={() => toggleActivity(activity)}
                    >
                      {activity}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Observações */}
              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  placeholder="Como foi o dia do pet? Algum comportamento específico?"
                  rows={3}
                />
              </div>

              {/* Anexos */}
              <div className="space-y-2">
                <Label>Fotos, Vídeos e Documentos</Label>
                <div 
                  className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-4 cursor-pointer transition-all hover:border-primary/50"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input 
                    ref={fileInputRef} 
                    type="file" 
                    onChange={handleFileChange} 
                    accept="image/*,application/pdf,video/*" 
                    multiple
                    className="hidden" 
                  />
                  <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">Clique para adicionar arquivos</p>
                  <p className="text-xs text-muted-foreground">Fotos, vídeos ou PDFs (máx. 50MB)</p>
                </div>

                {attachments.length > 0 && (
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {attachments.map((file, index) => (
                      <div key={index} className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                        {file.type.startsWith("image/") ? (
                          <Image className="h-4 w-4 text-blue-500" />
                        ) : file.type.startsWith("video/") ? (
                          <Video className="h-4 w-4 text-purple-500" />
                        ) : (
                          <FileText className="h-4 w-4 text-red-500" />
                        )}
                        <span className="text-sm truncate flex-1">{file.name}</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 w-6 p-0"
                          onClick={(e) => { e.stopPropagation(); removeAttachment(index); }}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={addLog.isPending}>
                {addLog.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* View Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              Detalhes do Comportamento
            </DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <PetAvatar
                  photoUrl={selectedLog.pet?.photoUrl}
                  breed={selectedLog.pet?.breed}
                  name={selectedLog.pet?.name}
                  size="xl"
                />
                <div>
                  <h3 className="font-semibold text-lg">{selectedLog.pet?.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {new Date(selectedLog.logDate).toLocaleDateString("pt-BR", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric"
                    })}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Socialização</p>
                  <p className={`font-medium ${socializationOptions.find(s => s.value === selectedLog.socialization)?.color}`}>
                    {socializationOptions.find(s => s.value === selectedLog.socialization)?.label || "N/A"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Energia</p>
                  <p className={`font-medium ${energyOptions.find(e => e.value === selectedLog.energy)?.color}`}>
                    {energyOptions.find(e => e.value === selectedLog.energy)?.label || "N/A"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Obediência</p>
                  <p className={`font-medium ${obedienceOptions.find(o => o.value === selectedLog.obedience)?.color}`}>
                    {obedienceOptions.find(o => o.value === selectedLog.obedience)?.label || "N/A"}
                  </p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Ansiedade</p>
                  <p className={`font-medium ${anxietyOptions.find(a => a.value === selectedLog.anxiety)?.color}`}>
                    {anxietyOptions.find(a => a.value === selectedLog.anxiety)?.label || "N/A"}
                  </p>
                </div>
              </div>

              {selectedLog.activities && selectedLog.activities.length > 0 && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-2">Atividades</p>
                  <div className="flex flex-wrap gap-1">
                    {selectedLog.activities.map((activity: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-xs">
                        {activity}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {selectedLog.notes && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Observações</p>
                  <p className="text-sm">{selectedLog.notes}</p>
                </div>
              )}

              <div className="text-xs text-muted-foreground pt-2 border-t">
                Registrado por {selectedLog.createdBy?.name}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
