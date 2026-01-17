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
  GraduationCap,
  Target,
  Trophy,
  BookOpen,
  Dog,
  Calendar,
  Timer,
  TrendingUp,
  Sparkles,
  Star,
  Users,
  Brain,
  Zap,
  RefreshCw,
  BarChart3,
  PieChart,
  ListFilter,
  Filter,
  Upload,
  Image,
  FileText,
  Video,
  Paperclip,
  X,
  Loader2,
  Play,
  ExternalLink,
  type LucideIcon
} from "lucide-react";
import { BreedIcon } from "@/components/breed-icons";
import { PetAvatar } from "@/components/pet-avatar";
import { toast } from "sonner";
import { TableSkeleton } from "@/components/shared/skeletons";
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
  LineChart,
  Line,
  AreaChart,
  Area,
} from "recharts";

import {
  TRAINING_COMMANDS,
  COMMAND_CATEGORIES,
  COMMAND_PROFICIENCY,
} from "@/lib/constants/pet-options";

const NEUTRAL_COLORS = ["#475569", "#64748b", "#94a3b8", "#cbd5e1", "#e2e8f0"];

const categoryOptions: { value: string; label: string; icon: LucideIcon }[] = [
  { value: "obedience", label: "Obediência", icon: Target },
  { value: "socialization", label: "Socialização", icon: Users },
  { value: "behavior", label: "Comportamento", icon: Brain },
  { value: "agility", label: "Agilidade", icon: Zap },
  { value: "tricks", label: "Truques", icon: Sparkles },
  { value: "basic", label: "Básico", icon: BookOpen },
  { value: "intermediate", label: "Intermediário", icon: Target },
  { value: "advanced", label: "Avançado", icon: Trophy },
];

// Opções de status harmonizadas com COMMAND_PROFICIENCY em pet-options.ts
const statusOptions: { value: string; label: string; icon: LucideIcon; color: string; percent: number }[] = [
  { value: "not_started", label: "Não Iniciado", icon: BookOpen, color: "text-gray-500", percent: 0 },
  { value: "learning", label: "Entendendo o Sinal", icon: BookOpen, color: "text-blue-600", percent: 25 },
  { value: "with_treat", label: "Faz com Petisco", icon: RefreshCw, color: "text-yellow-600", percent: 50 },
  { value: "reliable", label: "Dominado", icon: Star, color: "text-green-600", percent: 75 },
  { value: "proofed", label: "Dominado com Distração", icon: Trophy, color: "text-emerald-600", percent: 100 },
];

// Lista completa de comandos para seleção
const commandOptions = TRAINING_COMMANDS.map(cmd => ({
  value: cmd.value,
  label: cmd.label,
  icon: cmd.icon,
  category: cmd.category,
}));

const methodOptions = [
  { value: "positive_reinforcement", label: "Reforço Positivo" },
  { value: "clicker", label: "Clicker" },
  { value: "lure", label: "Isca/Lure" },
  { value: "capture", label: "Captura" },
  { value: "shaping", label: "Modelagem (Shaping)" },
];

const periodOptions = [
  { value: "all", label: "Todos" },
  { value: "week", label: "Esta Semana" },
  { value: "month", label: "Este Mês" },
  { value: "custom", label: "Personalizado" },
];

export default function AdminTraining() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedLog, setSelectedLog] = useState<any>(null);
  const [activeTab, setActiveTab] = useState("logs");
  
  // Filtros
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>();
  const [selectedStatus, setSelectedStatus] = useState<string | undefined>();
  const [petFilter, setPetFilter] = useState<string>("all");
  const [periodFilter, setPeriodFilter] = useState("all");
  
  // Anexos
  const [attachments, setAttachments] = useState<File[]>([]);
  const [videoUrl, setVideoUrl] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Query principal com cache
  const { data: logs, isLoading, refetch } = trpc.training.list.useQuery({
    category: selectedCategory as any,
    limit: 100,
  }, {
    staleTime: 60 * 1000, // 1 min cache
  });

  // Reusar mesma query (evita duplicação)
  const allLogs = logs;

  const { data: pets } = trpc.pets.list.useQuery(undefined, {
    staleTime: 5 * 60 * 1000, // 5 min cache
  });

  // Filtrar logs
  const filteredLogs = useMemo(() => {
    if (!logs) return [];
    return logs.filter(log => {
      const matchesPet = petFilter === "all" || log.pet?.id === Number(petFilter);
      const matchesStatus = !selectedStatus || log.status === selectedStatus;
      return matchesPet && matchesStatus;
    });
  }, [logs, petFilter, selectedStatus]);

  // Dados para infográficos
  const chartData = useMemo(() => {
    if (!allLogs) return { 
      byCategory: [], byStatus: [], byPet: [], timeline: [],
      successRateAvg: 0, totalCommands: 0, mastered: 0, practicing: 0, learning: 0,
      progressByPet: []
    };

    const categoryCount: Record<string, number> = {};
    const statusCount: Record<string, number> = {};
    const petCount: Record<string, number> = {};
    let totalSuccessRate = 0;
    let successRateCount = 0;
    const commandsSet = new Set<string>();

    allLogs.forEach(log => {
      // Por categoria
      categoryCount[log.category] = (categoryCount[log.category] || 0) + 1;
      
      // Por status
      statusCount[log.status] = (statusCount[log.status] || 0) + 1;
      
      // Por pet
      if (log.pet?.name) {
        petCount[log.pet.name] = (petCount[log.pet.name] || 0) + 1;
      }
      
      // Taxa de sucesso
      if (log.successRate !== null && log.successRate !== undefined) {
        totalSuccessRate += log.successRate;
        successRateCount++;
      }
      
      // Comandos únicos
      commandsSet.add(log.command.toLowerCase());
    });

    const byCategory = Object.entries(categoryCount).map(([key, value]) => ({
      name: categoryOptions.find(c => c.value === key)?.label || key,
      value
    }));

    const byStatus = Object.entries(statusCount).map(([key, value]) => ({
      name: statusOptions.find(s => s.value === key)?.label || key,
      value
    }));

    const byPet = Object.entries(petCount)
      .map(([name, value]) => ({ name: name.length > 10 ? name.slice(0, 10) + '...' : name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 8);

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
        sessoes: dayLogs.length,
        mastered: dayLogs.filter(l => l.status === "reliable" || l.status === "mastered").length,
      };
    });

    // Progresso por pet (comandos dominados vs total)
    const petProgress: Record<string, { total: number; mastered: number }> = {};
    allLogs.forEach(log => {
      const petName = log.pet?.name || "Unknown";
      if (!petProgress[petName]) {
        petProgress[petName] = { total: 0, mastered: 0 };
      }
      petProgress[petName].total++;
      if (log.status === "reliable" || log.status === "mastered") {
        petProgress[petName].mastered++;
      }
    });

    const progressByPet = Object.entries(petProgress)
      .map(([name, data]) => ({
        name: name.length > 10 ? name.slice(0, 10) + '...' : name,
        progresso: data.total > 0 ? Math.round((data.mastered / data.total) * 100) : 0,
      }))
      .sort((a, b) => b.progresso - a.progresso)
      .slice(0, 6);

    return {
      byCategory,
      byStatus,
      byPet,
      timeline,
      successRateAvg: successRateCount > 0 ? Math.round(totalSuccessRate / successRateCount) : 0,
      totalCommands: commandsSet.size,
      mastered: (statusCount["reliable"] || 0) + (statusCount["mastered"] || 0),
      practicing: (statusCount["with_treat"] || 0) + (statusCount["practicing"] || 0),
      learning: statusCount["learning"] || 0,
      progressByPet,
    };
  }, [allLogs]);

  const addLog = trpc.training.add.useMutation({
    onSuccess: () => {
      toast.success("Registro de treinamento salvo!");
      setIsAddDialogOpen(false);
      setAttachments([]);
      setVideoUrl("");
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
      if (file.size > 100 * 1024 * 1024) {
        toast.error(`Arquivo ${file.name} é muito grande (máx. 100MB)`);
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

  const handleAddLog = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    
    addLog.mutate({
      petId: Number(formData.get("petId")),
      logDate: formData.get("logDate") as string,
      command: formData.get("command") as string,
      category: formData.get("category") as any,
      status: formData.get("status") as any,
      successRate: formData.get("successRate") ? Number(formData.get("successRate")) : undefined,
      duration: formData.get("duration") ? Number(formData.get("duration")) : undefined,
      treats: formData.get("treats") ? Number(formData.get("treats")) : undefined,
      method: (formData.get("method") as any) || undefined,
      notes: (formData.get("notes") as string) || undefined,
      videoUrl: videoUrl || undefined,
    });
  };

  if (isLoading) {
    return <TableSkeleton />;
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-icon">
            <GraduationCap />
          </div>
          <div className="page-header-info">
            <h1>Treinamento</h1>
            <p>Acompanhe o progresso de adestramento</p>
          </div>
        </div>
        <div className="page-header-actions">
          <Button onClick={() => setIsAddDialogOpen(true)} size="sm" className="btn-sm btn-primary">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Novo Registro
          </Button>
        </div>
      </div>

      {/* Stats - Glass Premium */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Total de Sessões</span>
            <div className="stat-card-icon">
              <Target />
            </div>
          </div>
          <div className="stat-card-value">{allLogs?.length || 0}</div>
          <div className="stat-card-description">sessões registradas</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Dominados</span>
            <div className="stat-card-icon">
              <Trophy />
            </div>
          </div>
          <div className="stat-card-value">{chartData.mastered}</div>
          <div className="stat-card-description">comandos dominados</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Em Prática</span>
            <div className="stat-card-icon">
              <RefreshCw />
            </div>
          </div>
          <div className="stat-card-value">{chartData.practicing}</div>
          <div className="stat-card-description">em progresso</div>
        </div>

        <div className="stat-card">
          <div className="stat-card-header">
            <span className="stat-card-title">Taxa de Sucesso</span>
            <div className="stat-card-icon">
              <TrendingUp />
            </div>
          </div>
          <div className="stat-card-value">{chartData.successRateAvg}%</div>
          <div className="stat-card-description">média geral</div>
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
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-4">
                {/* Categoria */}
                <div className="space-y-2">
                  <Label className="text-xs">Categoria</Label>
                  <div className="flex flex-wrap gap-2">
                    <Button
                      variant={!selectedCategory ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedCategory(undefined)}
                    >
                      Todos
                    </Button>
                    {categoryOptions.map((cat) => {
                      const IconComponent = cat.icon;
                      return (
                        <Button
                          key={cat.value}
                          variant={selectedCategory === cat.value ? "default" : "outline"}
                          size="sm"
                          onClick={() => setSelectedCategory(cat.value)}
                          className="gap-1.5"
                        >
                          <IconComponent className="h-3.5 w-3.5" />
                          {cat.label}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Status */}
                <div className="space-y-2">
                  <Label className="text-xs">Status</Label>
                  <Select value={selectedStatus || "all"} onValueChange={(v) => setSelectedStatus(v === "all" ? undefined : v)}>
                    <SelectTrigger className="w-40">
                      <SelectValue placeholder="Todos" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      {statusOptions.map(opt => (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className={opt.color}>{opt.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Pet */}
                <div className="space-y-2">
                  <Label className="text-xs">Pet</Label>
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

          {/* Logs Grid */}
          {filteredLogs.length === 0 ? (
            <Card className="p-12 text-center">
              <GraduationCap className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Nenhum registro de treinamento</h3>
              <p className="text-muted-foreground mb-4">
                Comece a registrar o progresso de adestramento dos pets
              </p>
              <Button onClick={() => setIsAddDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Primeiro Registro
              </Button>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {filteredLogs.map((log) => {
                const category = categoryOptions.find(c => c.value === log.category);
                const status = statusOptions.find(s => s.value === log.status);
                const StatusIcon = status?.icon || Star;
                const CategoryIcon = category?.icon || Target;
                
                return (
                  <Card 
                    key={log.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => { setSelectedLog(log); setIsViewDialogOpen(true); }}
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <PetAvatar
                            photoUrl={log.pet?.photoUrl}
                            breed={log.pet?.breed}
                            name={log.pet?.name}
                            size="lg"
                          />
                          <div>
                            <CardTitle className="text-base">{log.pet?.name}</CardTitle>
                            <CardDescription className="text-xs">
                              {new Date(log.logDate).toLocaleDateString("pt-BR")}
                            </CardDescription>
                          </div>
                        </div>
                        <Badge 
                          variant={(log.status === "reliable" || log.status === "mastered") ? "default" : (log.status === "with_treat" || log.status === "practicing") ? "secondary" : "outline"}
                          className={`gap-1 ${status?.color}`}
                        >
                          <StatusIcon className="h-3 w-3" />
                          {status?.label}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-lg">{log.command}</span>
                        <Badge variant="outline" className="gap-1">
                          <CategoryIcon className="h-3 w-3" />
                          {category?.label}
                        </Badge>
                      </div>

                      {log.successRate !== null && (
                        <div className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Taxa de Sucesso</span>
                            <span className="font-medium">{log.successRate}%</span>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${log.successRate}%` }}
                            />
                          </div>
                        </div>
                      )}

                      <div className="flex gap-4 text-sm text-muted-foreground">
                        {log.duration && (
                          <div className="flex items-center gap-1">
                            <Timer className="h-4 w-4" />
                            {log.duration} min
                          </div>
                        )}
                        {log.treats !== null && log.treats > 0 && (
                          <div className="flex items-center gap-1">
                            <Sparkles className="h-4 w-4" />
                            {log.treats} petiscos
                          </div>
                        )}
                        {log.videoUrl && (
                          <div className="flex items-center gap-1 text-blue-500">
                            <Play className="h-4 w-4" />
                            Vídeo
                          </div>
                        )}
                      </div>

                      {log.notes && (
                        <p className="text-sm text-muted-foreground border-t pt-2 mt-2 line-clamp-2">
                          {log.notes}
                        </p>
                      )}

                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>Por {log.createdBy?.name}</span>
                        {(log as any).attachments && (
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
          {/* Métricas Resumidas */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Target className="h-8 w-8 mx-auto mb-2 text-slate-500" />
                  <p className="text-3xl font-bold">{chartData.totalCommands}</p>
                  <p className="text-xs text-muted-foreground">Comandos Únicos</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <Trophy className="h-8 w-8 mx-auto mb-2 text-green-500" />
                  <p className="text-3xl font-bold">{chartData.mastered}</p>
                  <p className="text-xs text-muted-foreground">Dominados</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <RefreshCw className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                  <p className="text-3xl font-bold">{chartData.practicing}</p>
                  <p className="text-xs text-muted-foreground">Em Prática</p>
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-sm">
              <CardContent className="pt-6">
                <div className="text-center">
                  <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                  <p className="text-3xl font-bold">{chartData.learning}</p>
                  <p className="text-xs text-muted-foreground">Aprendendo</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Timeline */}
          <Card className="shadow-sm overflow-hidden mx-0.5">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800/50 dark:to-blue-950/20 border-b border-slate-100/80 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500/15 to-blue-600/10">
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Sessões de Treinamento</CardTitle>
                  <CardDescription className="text-xs">Últimos 14 dias</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              <div className="h-[280px] mx-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={chartData.timeline} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                    <defs>
                      <linearGradient id="colorSessoes" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#1e3a5f" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#1e3a5f" stopOpacity={0.05}/>
                      </linearGradient>
                      <linearGradient id="colorMastered" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#22c55e" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#22c55e" stopOpacity={0.05}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
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
                    <Legend iconType="circle" iconSize={8} />
                    <Area type="monotone" dataKey="sessoes" name="Sessões" stroke="#1e3a5f" fill="url(#colorSessoes)" strokeWidth={2} />
                    <Area type="monotone" dataKey="mastered" name="Dominados" stroke="#22c55e" fill="url(#colorMastered)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Gráficos de Distribuição */}
          <div className="grid gap-4 lg:grid-cols-3 px-0.5">
            {/* Por Categoria */}
            <Card className="shadow-sm overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800/50 dark:to-blue-950/20 border-b border-slate-100/80 dark:border-slate-700/50">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500/15 to-blue-600/10">
                    <PieChart className="h-4 w-4 text-blue-600" />
                  </div>
                  <CardTitle className="text-sm font-bold">Por Categoria</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {chartData.byCategory.length > 0 ? (
                  <div className="h-[200px] mx-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={chartData.byCategory}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name }) => name}
                          labelLine={false}
                        >
                          {chartData.byCategory.map((_, index) => (
                            <Cell key={`cat-${index}`} fill={NEUTRAL_COLORS[index % NEUTRAL_COLORS.length]} />
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

            {/* Por Status */}
            <Card className="shadow-sm overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800/50 dark:to-blue-950/20 border-b border-slate-100/80 dark:border-slate-700/50">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500/15 to-blue-600/10">
                    <Star className="h-4 w-4 text-blue-600" />
                  </div>
                  <CardTitle className="text-sm font-bold">Por Status</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {chartData.byStatus.length > 0 ? (
                  <div className="h-[200px] mx-1">
                    <ResponsiveContainer width="100%" height="100%">
                      <RechartsPie>
                        <Pie
                          data={chartData.byStatus}
                          cx="50%"
                          cy="50%"
                          innerRadius={35}
                          outerRadius={65}
                          paddingAngle={3}
                          dataKey="value"
                          label={({ name }) => name}
                          labelLine={false}
                        >
                          {chartData.byStatus.map((_, index) => (
                            <Cell key={`status-${index}`} fill={NEUTRAL_COLORS[index % NEUTRAL_COLORS.length]} />
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

            {/* Progresso por Pet */}
            <Card className="shadow-sm overflow-hidden">
              <CardHeader className="pb-2 bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800/50 dark:to-blue-950/20 border-b border-slate-100/80 dark:border-slate-700/50">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg flex items-center justify-center bg-gradient-to-br from-blue-500/15 to-blue-600/10">
                    <Trophy className="h-4 w-4 text-blue-600" />
                  </div>
                  <CardTitle className="text-sm font-bold">Progresso por Pet</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4">
                {chartData.progressByPet.length > 0 ? (
                  <div className="space-y-3">
                    {chartData.progressByPet.map((pet, i) => (
                      <div key={i} className="group p-2 rounded-lg hover:bg-white/80 dark:hover:bg-slate-800/60 transition-all duration-300">
                        <div className="flex justify-between text-sm mb-1.5">
                          <span className="font-medium text-slate-700 dark:text-slate-300">{pet.name}</span>
                          <span className="font-bold text-blue-600">{pet.progresso}%</span>
                        </div>
                        <div className="h-2 bg-slate-200 dark:bg-slate-700 rounded-full overflow-hidden shadow-inner">
                          <div 
                            className="h-full bg-gradient-to-r from-blue-500 to-blue-600 rounded-full transition-all duration-500"
                            style={{ width: `${pet.progresso}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="h-[200px] flex items-center justify-center text-muted-foreground text-sm">
                    Sem dados
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Registros por Pet */}
          <Card className="shadow-sm overflow-hidden mx-0.5">
            <CardHeader className="bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800/50 dark:to-blue-950/20 border-b border-slate-100/80 dark:border-slate-700/50">
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500/15 to-blue-600/10">
                  <Dog className="h-4 w-4 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Sessões por Pet</CardTitle>
                  <CardDescription className="text-xs">Pets com mais sessões de treinamento</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4 sm:p-5">
              {chartData.byPet.length > 0 ? (
                <div className="h-[280px] mx-1">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData.byPet} layout="vertical" margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                      <defs>
                        <linearGradient id="trainingBarGradient" x1="0" y1="0" x2="1" y2="0">
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
                      <Bar dataKey="value" name="Sessões" fill="url(#trainingBarGradient)" radius={[0, 6, 6, 0]} />
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
        </TabsContent>
      </Tabs>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <GraduationCap className="h-5 w-5" />
              Novo Registro de Treinamento
            </DialogTitle>
            <DialogDescription>
              Registre uma sessão de treinamento para um pet
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleAddLog} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="petId">Pet *</Label>
                <Select name="petId" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o pet" />
                  </SelectTrigger>
                  <SelectContent>
                    {pets?.filter(p => p.approvalStatus === "approved").map((pet) => (
                      <SelectItem key={pet.id} value={pet.id.toString()}>
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

            <div className="space-y-2">
              <Label htmlFor="command">Comando *</Label>
              <Select name="command" required>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o comando" />
                </SelectTrigger>
                <SelectContent>
                  {/* Agrupar por categoria */}
                  {COMMAND_CATEGORIES.map((cat) => (
                    <div key={cat.value}>
                      <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground">
                        {cat.label}
                      </div>
                      {commandOptions
                        .filter(cmd => cmd.category === cat.value)
                        .map((cmd) => (
                          <SelectItem key={cmd.value} value={cmd.value}>
                            {cmd.icon} {cmd.label}
                          </SelectItem>
                        ))
                      }
                    </div>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="category">Categoria *</Label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((opt) => {
                      const IconComponent = opt.icon;
                      return (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className="flex items-center gap-2">
                            <IconComponent className="h-4 w-4 text-muted-foreground" />
                            {opt.label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">Status *</Label>
                <Select name="status" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => {
                      const IconComponent = opt.icon;
                      return (
                        <SelectItem key={opt.value} value={opt.value}>
                          <span className={`flex items-center gap-2 ${opt.color}`}>
                            <IconComponent className="h-4 w-4" />
                            {opt.label}
                          </span>
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="successRate">Taxa de Sucesso (%)</Label>
                <Input
                  id="successRate"
                  name="successRate"
                  type="number"
                  min="0"
                  max="100"
                  placeholder="0-100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="duration">Duração (min)</Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="1"
                  placeholder="Minutos"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="treats">Petiscos</Label>
                <Input
                  id="treats"
                  name="treats"
                  type="number"
                  min="0"
                  placeholder="Qtd"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="method">Método de Treinamento</Label>
              <Select name="method">
                <SelectTrigger>
                  <SelectValue placeholder="Selecione (opcional)" />
                </SelectTrigger>
                <SelectContent>
                  {methodOptions.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* URL do Vídeo */}
            <div className="space-y-2">
              <Label>URL do Vídeo (opcional)</Label>
              <div className="flex gap-2">
                <Input
                  type="url"
                  placeholder="https://youtube.com/... ou link direto"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                />
                {videoUrl && (
                  <Button
                    type="button"
                    variant="outline"
                    size="icon"
                    onClick={() => window.open(videoUrl, "_blank")}
                  >
                    <ExternalLink className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Anexos */}
            <div className="space-y-2">
              <Label>Fotos e Documentos</Label>
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
                <p className="text-xs text-muted-foreground">Fotos, vídeos ou PDFs (máx. 100MB)</p>
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

            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                name="notes"
                placeholder="Anotações sobre a sessão de treinamento..."
                rows={3}
              />
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
                  "Salvar Registro"
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
              <GraduationCap className="h-5 w-5" />
              Detalhes do Treinamento
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

              <div className="p-4 rounded-lg bg-muted/50 text-center">
                <p className="text-2xl font-bold">{selectedLog.command}</p>
                <div className="flex items-center justify-center gap-2 mt-2">
                  <Badge variant="outline">
                    {categoryOptions.find(c => c.value === selectedLog.category)?.label}
                  </Badge>
                  <Badge variant={(selectedLog.status === "reliable" || selectedLog.status === "mastered") ? "default" : "secondary"}>
                    {statusOptions.find(s => s.value === selectedLog.status)?.label || selectedLog.status}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Taxa de Sucesso</p>
                  <p className="text-xl font-bold">{selectedLog.successRate ?? "-"}%</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Duração</p>
                  <p className="text-xl font-bold">{selectedLog.duration ?? "-"} min</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50 text-center">
                  <p className="text-xs text-muted-foreground mb-1">Petiscos</p>
                  <p className="text-xl font-bold">{selectedLog.treats ?? "-"}</p>
                </div>
              </div>

              {selectedLog.method && (
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xs text-muted-foreground mb-1">Método</p>
                  <p className="font-medium">
                    {methodOptions.find(m => m.value === selectedLog.method)?.label}
                  </p>
                </div>
              )}

              {selectedLog.videoUrl && (
                <Button 
                  variant="outline" 
                  className="w-full gap-2"
                  onClick={() => window.open(selectedLog.videoUrl, "_blank")}
                >
                  <Play className="h-4 w-4" />
                  Ver Vídeo
                  <ExternalLink className="h-4 w-4" />
                </Button>
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
