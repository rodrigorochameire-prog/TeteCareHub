"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { 
  ArrowLeft, Edit, CheckCircle2, XCircle, Calendar, Weight, Utensils, 
  Loader2, Syringe, Pill, FileText, Camera, Dog, AlertTriangle, 
  Heart, Users, Activity, Phone, Zap, Clock, Package,
  TrendingUp, TrendingDown, Minus, Plus, Star, Shield
} from "lucide-react";
import { toast } from "sonner";
import { format, formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend
} from "recharts";
import { Brain, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";
import { BreedIconLarge } from "@/components/premium-breed-icon";

export default function AdminPetDetailPage() {
  const params = useParams();
  const router = useRouter();
  const petId = parseInt(params.id as string);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [feedingModalOpen, setFeedingModalOpen] = useState(false);
  const [stockModalOpen, setStockModalOpen] = useState(false);
  const [newStock, setNewStock] = useState("");
  const [socialModalOpen, setSocialModalOpen] = useState(false);

  // Query principal - carrega primeiro
  const { data: pet, isLoading, refetch } = trpc.pets.byId.useQuery({ id: petId });

  // Queries secundárias - lazy loading (só carregam quando pet existe)
  const { data: timeline } = trpc.petManagement.getUnifiedTimeline.useQuery(
    { petId, limit: 30 },
    { enabled: !!pet, staleTime: 2 * 60 * 1000 } // 2 min cache
  );
  const { data: stockForecast } = trpc.petManagement.getFoodStockForecast.useQuery(
    { petId },
    { enabled: !!pet, staleTime: 5 * 60 * 1000 } // 5 min cache
  );
  const { data: socialCircle } = trpc.petManagement.getSocialCircle.useQuery(
    { petId },
    { enabled: !!pet, staleTime: 5 * 60 * 1000 }
  );
  const { data: weightHistory } = trpc.petManagement.getWeightHistory.useQuery(
    { petId, limit: 10 },
    { enabled: !!pet, staleTime: 10 * 60 * 1000 } // 10 min cache - muda raramente
  );
  const { data: skillsMatrix } = trpc.petManagement.getSkillsMatrix.useQuery(
    { petId },
    { enabled: !!pet, staleTime: 5 * 60 * 1000 }
  );
  const { data: activeAlerts } = trpc.petManagement.getActiveAlerts.useQuery(
    { petId },
    { enabled: !!pet, staleTime: 60 * 1000 } // 1 min - alertas são mais críticos
  );

  // Mutations
  const updateStock = trpc.petManagement.updateFoodStock.useMutation({
    onSuccess: () => {
      toast.success("Estoque atualizado!");
      refetch();
      setStockModalOpen(false);
    },
  });
  const logFeeding = trpc.petManagement.logFeeding.useMutation({
    onSuccess: () => {
      toast.success("Alimentação registrada!");
      refetch();
      setFeedingModalOpen(false);
    },
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!pet) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="py-8 text-center">
            <Dog className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-muted-foreground">Pet não encontrado</p>
            <Link href="/admin/pets">
              <Button variant="link" className="mt-4">
                Voltar para lista de pets
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const calculateAge = () => {
    if (!pet.birthDate) return "N/A";
    const birth = new Date(pet.birthDate);
    const today = new Date();
    const ageInMonths = (today.getFullYear() - birth.getFullYear()) * 12 + (today.getMonth() - birth.getMonth());
    const years = Math.floor(ageInMonths / 12);
    const months = ageInMonths % 12;
    
    if (years === 0) return `${months} ${months === 1 ? "mês" : "meses"}`;
    if (months === 0) return `${years} ${years === 1 ? "ano" : "anos"}`;
    return `${years} ${years === 1 ? "ano" : "anos"} e ${months} ${months === 1 ? "mês" : "meses"}`;
  };

  // Radar chart data for behavior profile - 7 dimensões premium
  const sociabilityScore = pet.sociabilityLevel === "very_social" ? 95 : pet.sociabilityLevel === "friendly" ? 75 : pet.sociabilityLevel === "selective" ? 50 : 30;
  const energyScore = pet.energyLevel === "very_high" ? 95 : pet.energyLevel === "high" ? 80 : pet.energyLevel === "medium" ? 60 : 35;
  const obedienceScore = skillsMatrix ? Math.round((skillsMatrix.filter(s => s.status === "mastered").length / Math.max(skillsMatrix.length, 1)) * 100) : 55;
  const calmnessScore = pet.anxietySeparation === "none" ? 95 : pet.anxietySeparation === "mild" ? 70 : pet.anxietySeparation === "moderate" ? 45 : 20;
  const aggressionHistory = (pet as any).aggressionHistory;
  const docilityScore = aggressionHistory === "none" ? 95 : aggressionHistory === "minor" ? 65 : 75;
  const adaptabilityScore = Math.round((sociabilityScore + calmnessScore) / 2);
  const focusScore = obedienceScore;
  
  const behaviorProfile = [
    { metric: "Sociabilidade", shortName: "Social", value: sociabilityScore, benchmark: 70, description: "Interação social" },
    { metric: "Obediência", shortName: "Obed.", value: obedienceScore, benchmark: 65, description: "Resposta a comandos" },
    { metric: "Energia", shortName: "Energia", value: energyScore, benchmark: 72, description: "Nível de atividade" },
    { metric: "Tranquilidade", shortName: "Calma", value: calmnessScore, benchmark: 62, description: "Calma e baixa ansiedade" },
    { metric: "Docilidade", shortName: "Dócil", value: docilityScore, benchmark: 72, description: "Gentileza" },
    { metric: "Adaptabilidade", shortName: "Adapt.", value: adaptabilityScore, benchmark: 65, description: "Flexibilidade" },
    { metric: "Foco", shortName: "Foco", value: focusScore, benchmark: 60, description: "Atenção" },
  ];
  
  const avgBehaviorScore = Math.round(behaviorProfile.reduce((sum, m) => sum + m.value, 0) / behaviorProfile.length);

  // Weight chart data
  const weightChartData = weightHistory?.history?.slice().reverse().map(w => ({
    date: format(new Date(w.measuredAt), "dd/MM"),
    peso: w.weightKg,
  })) || [];

  const getAlertColor = (level: string) => {
    if (level === "empty" || level === "critical") return "text-red-500";
    if (level === "warning") return "text-yellow-500";
    return "text-green-500";
  };

  const getStockProgress = () => {
    if (!stockForecast || !pet.foodAmount) return 0;
    const maxDays = 14; // 2 semanas como máximo visual
    return Math.min((stockForecast.daysRemaining || 0) / maxDays * 100, 100);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header com Alertas Ativos */}
      {activeAlerts && activeAlerts.length > 0 && (
        <div className="bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="font-semibold text-red-700 dark:text-red-300">
              {activeAlerts.length} Alerta(s) Ativo(s)
            </span>
          </div>
          <div className="space-y-2">
            {activeAlerts.map((alert) => (
              <div key={alert.id} className="flex items-center justify-between bg-white dark:bg-gray-900 rounded p-2">
                <div>
                  <Badge variant={alert.severity === "critical" ? "destructive" : "default"} className="mr-2">
                    {alert.alertType}
                  </Badge>
                  <span className="text-sm">{alert.title}</span>
                </div>
                <span className="text-xs text-muted-foreground">
                  {formatDistanceToNow(new Date(alert.createdAt), { locale: ptBR, addSuffix: true })}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Header - Layout limpo e integrado */}
      <div className="flex flex-col gap-3">
        {/* Linha Superior: Voltar + Ações */}
        <div className="flex items-center justify-between">
          <Link href="/admin/pets">
            <Button 
              variant="ghost" 
              size="sm" 
              className="active:scale-95 transition-all"
            >
              <ArrowLeft className="h-4 w-4 mr-1.5" />
              <span className="text-xs">Voltar</span>
            </Button>
          </Link>
          
          <div className="flex items-center gap-2">
            <Link href={`/admin/pets/${petId}/edit`}>
              <Button 
                variant="outline" 
                size="sm" 
                className="text-xs active:scale-95 transition-all"
              >
                <Edit className="h-3.5 w-3.5 mr-1.5" />
                <span className="hidden sm:inline">Perfil Avançado</span>
                <span className="sm:hidden">Perfil</span>
              </Button>
            </Link>
            <Button 
              onClick={() => setIsEditDialogOpen(true)} 
              size="sm" 
              className="text-xs active:scale-95 transition-all"
            >
              <Edit className="h-3.5 w-3.5 mr-1.5" />
              Edição
            </Button>
          </div>
        </div>
        
        {/* Card do Pet - Visual integrado */}
        <Card className="overflow-hidden border-0 shadow-sm">
          <CardContent className="p-4 sm:p-5">
            <div className="flex items-center gap-4 sm:gap-5">
              {/* Avatar com borda sutil */}
              <div className="relative">
                {pet.photoUrl ? (
                  <img
                    src={pet.photoUrl}
                    alt={pet.name}
                    className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl object-cover ring-2 ring-primary/20 shadow-md"
                  />
                ) : (
                  <BreedIconLarge breed={pet.breed} className="!w-16 !h-16 sm:!w-20 sm:!h-20" />
                )}
                {/* Indicador de status */}
                <div className={cn(
                  "absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-white dark:border-slate-900",
                  pet.status === "checked-in" ? "bg-emerald-500" : "bg-slate-400"
                )} />
              </div>
              
              {/* Info do Pet */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <h1 className="text-xl sm:text-2xl font-bold tracking-tight truncate">
                    {pet.name}
                  </h1>
                  <Badge 
                    variant={pet.status === "checked-in" ? "default" : "secondary"}
                    className="text-[10px] px-2 py-0.5"
                  >
                    {pet.status === "checked-in" ? "Na Creche" : "Fora"}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground truncate">
                  {pet.breed || "Raça não informada"} • {calculateAge()}
                </p>
              </div>
              
              {/* Score Badge - Desktop */}
              <div className="hidden md:flex flex-col items-center px-4 py-2 rounded-xl bg-muted/50">
                <div className="text-2xl font-bold text-primary">{avgBehaviorScore}</div>
                <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Score</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cards Rápidos - Premium */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 px-0.5">
        {/* Estoque de Ração */}
        <Card 
          className="cursor-pointer hover:shadow-lg transition-all duration-300 overflow-hidden border-0 shadow-sm hover:-translate-y-0.5" 
          onClick={() => setStockModalOpen(true)}
        >
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-3">
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center",
                stockForecast?.alertLevel === "ok" 
                  ? "bg-gradient-to-br from-emerald-500/15 to-emerald-600/10" 
                  : stockForecast?.alertLevel === "warning"
                  ? "bg-gradient-to-br from-amber-500/15 to-amber-600/10"
                  : "bg-gradient-to-br from-red-500/15 to-red-600/10"
              )}>
                <Package className={cn(
                  "h-5 w-5",
                  stockForecast?.alertLevel === "ok" ? "text-emerald-600" 
                    : stockForecast?.alertLevel === "warning" ? "text-amber-600" 
                    : "text-red-600"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-muted-foreground">Estoque Ração</p>
                <Badge 
                  variant="outline" 
                  className={cn(
                    "text-[10px] mt-0.5",
                    getAlertColor(stockForecast?.alertLevel || "unknown")
                  )}
                >
                  {stockForecast?.daysRemaining != null ? `${stockForecast.daysRemaining} dias` : "N/A"}
                </Badge>
              </div>
            </div>
            <div className="h-2.5 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden shadow-inner">
              <div 
                className={cn(
                  "h-full transition-all duration-500 rounded-full",
                  stockForecast?.alertLevel === "ok" 
                    ? "bg-gradient-to-r from-emerald-500 to-emerald-400" 
                    : stockForecast?.alertLevel === "warning"
                    ? "bg-gradient-to-r from-amber-500 to-amber-400"
                    : "bg-gradient-to-r from-red-500 to-red-400"
                )}
                style={{ width: `${getStockProgress()}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">
              {stockForecast?.currentStock 
                ? `${(stockForecast.currentStock / 1000).toFixed(1)} kg restante` 
                : "Clique para configurar"}
            </p>
          </CardContent>
        </Card>

        {/* Peso */}
        <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500/15 to-blue-600/10">
                <Weight className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground">Peso Atual</p>
                {weightHistory?.trend && (
                  <div className="flex items-center gap-1 mt-0.5">
                    {weightHistory.trend === "gaining" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 flex items-center gap-0.5">
                        <TrendingUp className="h-3 w-3" /> Ganhando
                      </span>
                    )}
                    {weightHistory.trend === "losing" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400 flex items-center gap-0.5">
                        <TrendingDown className="h-3 w-3" /> Perdendo
                      </span>
                    )}
                    {weightHistory.trend === "stable" && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 flex items-center gap-0.5">
                        <Minus className="h-3 w-3" /> Estável
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
              {pet.weight ? `${(pet.weight / 1000).toFixed(1)} kg` : "0.0 kg"}
            </p>
          </CardContent>
        </Card>

        {/* Créditos */}
        <Card className={cn(
          "overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5",
          pet.credits < 3 && "ring-1 ring-amber-200 dark:ring-amber-800/50"
        )}>
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center",
                pet.credits < 3 
                  ? "bg-gradient-to-br from-amber-500/15 to-amber-600/10"
                  : "bg-gradient-to-br from-blue-500/15 to-blue-600/10"
              )}>
                <Star className={cn(
                  "h-5 w-5",
                  pet.credits < 3 ? "text-amber-600" : "text-blue-600"
                )} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground">Créditos</p>
                {pet.credits < 3 && (
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
                    Baixo - avisar tutor
                  </span>
                )}
              </div>
            </div>
            <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">{pet.credits}</p>
          </CardContent>
        </Card>

        {/* Nível de Energia */}
        <Card className="overflow-hidden border-0 shadow-sm hover:shadow-lg transition-all duration-300 hover:-translate-y-0.5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3 mb-2">
              <div className={cn(
                "h-10 w-10 rounded-xl flex items-center justify-center",
                pet.energyLevel === "very_high" || pet.energyLevel === "high"
                  ? "bg-gradient-to-br from-orange-500/15 to-orange-600/10"
                  : pet.energyLevel === "medium"
                  ? "bg-gradient-to-br from-blue-500/15 to-blue-600/10"
                  : "bg-gradient-to-br from-slate-500/15 to-slate-600/10"
              )}>
                <Zap className={cn(
                  "h-5 w-5",
                  pet.energyLevel === "very_high" || pet.energyLevel === "high" ? "text-orange-600" 
                    : pet.energyLevel === "medium" ? "text-blue-600" 
                    : "text-slate-500"
                )} />
              </div>
              <div className="flex-1">
                <p className="text-xs font-medium text-muted-foreground">Energia</p>
                {pet.roomPreference && (
                  <span className="text-[10px] text-muted-foreground">
                    Sala: {pet.roomPreference}
                  </span>
                )}
              </div>
            </div>
            <p className="text-xl font-bold text-slate-800 dark:text-slate-200 capitalize">
              {pet.energyLevel === "very_high" ? "Muito Alta" :
               pet.energyLevel === "high" ? "Alta" :
               pet.energyLevel === "medium" ? "Média" :
               pet.energyLevel === "low" ? "Baixa" : "N/A"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="timeline" className="space-y-4">
        <TabsList className="flex w-full overflow-x-auto scrollbar-hide">
          <TabsTrigger value="timeline" className="flex items-center gap-1 px-3 text-xs sm:text-sm sm:gap-2 sm:px-4 whitespace-nowrap">
            <Clock className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Timeline</span>
            <span className="sm:hidden">Time</span>
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-1 px-3 text-xs sm:text-sm sm:gap-2 sm:px-4 whitespace-nowrap">
            <Users className="h-3 w-3 sm:h-4 sm:w-4" />
            Social
          </TabsTrigger>
          <TabsTrigger value="health" className="flex items-center gap-1 px-3 text-xs sm:text-sm sm:gap-2 sm:px-4 whitespace-nowrap">
            <Syringe className="h-3 w-3 sm:h-4 sm:w-4" />
            Saúde
          </TabsTrigger>
          <TabsTrigger value="training" className="flex items-center gap-1 px-3 text-xs sm:text-sm sm:gap-2 sm:px-4 whitespace-nowrap">
            <Star className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Adestramento</span>
            <span className="sm:hidden">Treino</span>
          </TabsTrigger>
          <TabsTrigger value="emergency" className="flex items-center gap-1 px-3 text-xs sm:text-sm sm:gap-2 sm:px-4 whitespace-nowrap">
            <Shield className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Emergência</span>
            <span className="sm:hidden">Emerg.</span>
          </TabsTrigger>
          <TabsTrigger value="feeding" className="flex items-center gap-1 px-3 text-xs sm:text-sm sm:gap-2 sm:px-4 whitespace-nowrap">
            <Utensils className="h-3 w-3 sm:h-4 sm:w-4" />
            <span className="hidden sm:inline">Alimentação</span>
            <span className="sm:hidden">Comida</span>
          </TabsTrigger>
        </TabsList>

        {/* TIMELINE UNIFICADA */}
        <TabsContent value="timeline" className="space-y-4">
          <Card className="overflow-hidden border-0 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-950/20">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500/15 to-blue-600/10">
                  <Clock className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <CardTitle className="text-base font-bold">Timeline Unificada</CardTitle>
                  <CardDescription className="text-xs">Toda a vida do pet em ordem cronológica</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="p-4">
              {!timeline || timeline.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                    <Clock className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Nenhum registro ainda</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Os eventos aparecerão aqui</p>
                </div>
              ) : (
                <div className="space-y-3 relative before:absolute before:left-5 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-blue-200 before:via-slate-200 before:to-slate-100 dark:before:from-blue-800 dark:before:via-slate-700 dark:before:to-slate-800">
                  {timeline.map((item, idx) => {
                    const iconConfig = {
                      log: { icon: FileText, bg: "bg-blue-100 dark:bg-blue-900/50", color: "text-blue-600 dark:text-blue-400", label: "Log Diário" },
                      event: { icon: Calendar, bg: "bg-emerald-100 dark:bg-emerald-900/50", color: "text-emerald-600 dark:text-emerald-400", label: "Evento" },
                      weight: { icon: Weight, bg: "bg-purple-100 dark:bg-purple-900/50", color: "text-purple-600 dark:text-purple-400", label: "Pesagem" },
                      feeding: { icon: Utensils, bg: "bg-orange-100 dark:bg-orange-900/50", color: "text-orange-600 dark:text-orange-400", label: "Alimentação" },
                      alert: { icon: AlertTriangle, bg: "bg-red-100 dark:bg-red-900/50", color: "text-red-600 dark:text-red-400", label: "Alerta" },
                    }[item.type] || { icon: Activity, bg: "bg-slate-100", color: "text-slate-600", label: "Registro" };
                    
                    const IconComponent = iconConfig.icon;
                    
                    return (
                      <div key={idx} className="relative pl-12 group">
                        {/* Ícone da Timeline */}
                        <div className={cn(
                          "absolute left-2 w-7 h-7 rounded-lg flex items-center justify-center shadow-sm transition-transform group-hover:scale-110",
                          iconConfig.bg
                        )}>
                          <IconComponent className={cn("h-3.5 w-3.5", iconConfig.color)} />
                        </div>
                        
                        {/* Card do Evento */}
                        <div className="bg-card rounded-xl p-4 shadow-sm border border-slate-100 dark:border-slate-800 hover:shadow-md transition-all">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md",
                                iconConfig.bg, iconConfig.color
                              )}>
                                {iconConfig.label}
                              </span>
                            </div>
                            <span className="text-[11px] text-muted-foreground">
                              {formatDistanceToNow(new Date(item.date), { locale: ptBR, addSuffix: true })}
                            </span>
                          </div>
                          
                          {item.type === "log" && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-3 flex-wrap">
                                <div className="flex items-center gap-1.5">
                                  <Heart className="h-3.5 w-3.5 text-pink-500" />
                                  <span className="text-xs text-muted-foreground">Humor:</span>
                                  <Badge variant="secondary" className="text-xs">{item.data.mood || "N/A"}</Badge>
                                </div>
                                <div className="flex items-center gap-1.5">
                                  <Utensils className="h-3.5 w-3.5 text-orange-500" />
                                  <span className="text-xs text-muted-foreground">Apetite:</span>
                                  <Badge variant="secondary" className="text-xs">{item.data.appetite || "N/A"}</Badge>
                                </div>
                              </div>
                              {item.data.notes && (
                                <p className="text-sm text-muted-foreground bg-muted/50 rounded-lg p-2 mt-2">{item.data.notes}</p>
                              )}
                            </div>
                          )}
                          
                          {item.type === "event" && (
                            <div className="flex items-center gap-2">
                              {item.data.eventType === "checkin" ? (
                                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                              ) : (
                                <ArrowLeft className="h-4 w-4 text-slate-500" />
                              )}
                              <span className="text-sm font-medium">
                                {item.data.eventType === "checkin" ? "Check-in realizado" : "Check-out realizado"}
                              </span>
                              {item.data.notes && <span className="text-sm text-muted-foreground">- {item.data.notes}</span>}
                            </div>
                          )}
                          
                          {item.type === "weight" && (
                            <div className="flex items-center gap-3">
                              <div className="h-10 w-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
                                <Weight className="h-5 w-5 text-purple-600" />
                              </div>
                              <div>
                                <p className="text-lg font-bold text-purple-700 dark:text-purple-400">{item.data.weightKg} kg</p>
                                <p className="text-xs text-muted-foreground">Peso registrado</p>
                              </div>
                            </div>
                          )}
                          
                          {item.type === "feeding" && (
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center">
                                  <Utensils className="h-5 w-5 text-orange-600" />
                                </div>
                                <div>
                                  <p className="text-sm font-medium capitalize">{item.data.mealType}</p>
                                  <p className="text-xs text-muted-foreground">{item.data.amountGrams}g oferecidos</p>
                                </div>
                              </div>
                              <Badge variant={item.data.consumption === "all" ? "default" : "secondary"} className="text-xs">
                                {item.data.consumption === "all" ? "Comeu tudo" :
                                 item.data.consumption === "most" ? "Quase tudo" :
                                 item.data.consumption === "half" ? "Metade" :
                                 item.data.consumption === "little" ? "Pouco" : "Não comeu"}
                              </Badge>
                            </div>
                          )}
                          
                          {item.type === "alert" && (
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <Badge variant={item.data.severity === "critical" ? "destructive" : "secondary"}>
                                  {item.data.alertType}
                                </Badge>
                                {item.data.severity === "critical" && (
                                  <AlertTriangle className="h-4 w-4 text-red-500 animate-pulse" />
                                )}
                              </div>
                              <p className="text-sm font-medium">{item.data.title}</p>
                              {item.data.description && (
                                <p className="text-xs text-muted-foreground bg-red-50 dark:bg-red-950/30 rounded-lg p-2">{item.data.description}</p>
                              )}
                            </div>
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

        {/* CÍRCULO SOCIAL */}
        <TabsContent value="social" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Amigos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-green-500" />
                  Amigos
                </CardTitle>
                <CardDescription>Pets que combinam bem</CardDescription>
              </CardHeader>
              <CardContent>
                {!socialCircle?.friends || socialCircle.friends.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Nenhum amigo registrado</p>
                ) : (
                  <div className="space-y-2">
                    {socialCircle.friends.map((item) => (
                      <div key={item.relation.id} className="flex items-center gap-3 p-2 rounded-lg bg-green-50 dark:bg-green-950">
                        <div className="w-10 h-10 rounded-full bg-green-200 dark:bg-green-800 flex items-center justify-center">
                          {item.relatedPet.photoUrl ? (
                            <img src={item.relatedPet.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <Dog className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium">{item.relatedPet.name}</p>
                          {item.relation.notes && <p className="text-xs text-muted-foreground">{item.relation.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Evitar */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                  Evitar Contato
                </CardTitle>
                <CardDescription>Pets incompatíveis</CardDescription>
              </CardHeader>
              <CardContent>
                {!socialCircle?.avoid || socialCircle.avoid.length === 0 ? (
                  <p className="text-muted-foreground text-center py-4">Nenhuma restrição</p>
                ) : (
                  <div className="space-y-2">
                    {socialCircle.avoid.map((item) => (
                      <div key={item.relation.id} className="flex items-center gap-3 p-2 rounded-lg bg-red-50 dark:bg-red-950">
                        <div className="w-10 h-10 rounded-full bg-red-200 dark:bg-red-800 flex items-center justify-center">
                          {item.relatedPet.photoUrl ? (
                            <img src={item.relatedPet.photoUrl} alt="" className="w-full h-full rounded-full object-cover" />
                          ) : (
                            <Dog className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <p className="font-medium">{item.relatedPet.name}</p>
                            <Badge variant="destructive" className="text-xs">
                              {item.relation.severity === "critical" ? "Crítico" : 
                               item.relation.severity === "high" ? "Alto" : "Médio"}
                            </Badge>
                          </div>
                          {item.relation.notes && <p className="text-xs text-muted-foreground">{item.relation.notes}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Perfil Comportamental - Premium */}
          <Card className="overflow-hidden border-0 shadow-xl bg-gradient-to-br from-slate-50 via-white to-blue-50/30 dark:from-slate-900 dark:via-slate-900 dark:to-blue-950/20">
            <CardHeader className="pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg shadow-blue-500/25">
                    <Brain className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <CardTitle className="text-lg font-semibold">Análise Comportamental</CardTitle>
                    <CardDescription className="text-xs">7 dimensões avaliadas</CardDescription>
                  </div>
                </div>
                
                {/* Score Geral */}
                <div className="flex items-center gap-4 px-4 py-3 rounded-2xl bg-gradient-to-r from-blue-600 to-blue-800 text-white shadow-xl shadow-blue-500/30">
                  <div className="text-center">
                    <div className="text-3xl font-bold tracking-tight">{avgBehaviorScore}</div>
                    <div className="text-[10px] uppercase tracking-wider opacity-80">Score</div>
                  </div>
                  <div className="h-10 w-px bg-white/20" />
                  <div className="text-xs space-y-0.5">
                    <div className="flex items-center gap-1.5">
                      <TrendingUp className="h-3 w-3" />
                      <span>{behaviorProfile.filter(m => m.value > m.benchmark).length} acima da média</span>
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0">
              <div className="grid grid-cols-1 lg:grid-cols-5 gap-0">
                {/* Gráfico de Radar Premium */}
                <div className="lg:col-span-3 p-4 sm:p-6">
                  {/* Container com margens seguras */}
                  <div className="relative mx-0.5 sm:mx-1">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-transparent blur-3xl" />
                    </div>
                    
                    <div className="h-[320px] sm:h-[400px] relative z-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart 
                          data={behaviorProfile} 
                          cx="50%" 
                          cy="50%" 
                          outerRadius="73%"
                          margin={{ top: 35, right: 35, bottom: 35, left: 35 }}
                        >
                          <defs>
                            <linearGradient id="petRadarGradient" x1="0" y1="0" x2="1" y2="1">
                              <stop offset="0%" stopColor="#1e3a5f" stopOpacity={0.95} />
                              <stop offset="50%" stopColor="#2563eb" stopOpacity={0.7} />
                              <stop offset="100%" stopColor="#3b82f6" stopOpacity={0.5} />
                            </linearGradient>
                            <linearGradient id="petBenchmarkGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#cbd5e1" stopOpacity={0.25} />
                              <stop offset="100%" stopColor="#e2e8f0" stopOpacity={0.1} />
                            </linearGradient>
                            <filter id="petGlow" x="-50%" y="-50%" width="200%" height="200%">
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
                              const item = behaviorProfile[index];
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
                            fill="url(#petBenchmarkGradient)"
                            fillOpacity={0.5}
                          />
                          
                          <Radar
                            name="Perfil"
                            dataKey="value"
                            stroke="#1e3a5f"
                            strokeWidth={3}
                            fill="url(#petRadarGradient)"
                            fillOpacity={0.65}
                            filter="url(#petGlow)"
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
                          />
                          
                          <Tooltip 
                            content={({ active, payload }) => {
                              if (active && payload && payload.length) {
                                const data = payload[0]?.payload;
                                if (!data) return null;
                                const diff = data.value - data.benchmark;
                                const isGood = diff >= 0;
                                return (
                                  <div className="bg-white/95 dark:bg-slate-800/95 backdrop-blur-lg p-4 rounded-2xl shadow-2xl border border-blue-100 dark:border-blue-900/50 min-w-[160px]">
                                    <div className="font-bold text-sm text-slate-800 dark:text-slate-200 mb-1">
                                      {data.metric}
                                    </div>
                                    <div className="text-[10px] text-slate-500 mb-2">{data.description}</div>
                                    <div className="flex items-center justify-between">
                                      <div className={`text-xl font-bold ${isGood ? "text-blue-700" : "text-amber-600"}`}>
                                        {data.value}%
                                      </div>
                                      <div className={`px-2 py-1 rounded-full text-xs font-bold ${
                                        isGood 
                                          ? "bg-emerald-100 text-emerald-700" 
                                          : "bg-amber-100 text-amber-700"
                                      }`}>
                                        {diff > 0 ? "+" : ""}{diff}%
                                      </div>
                                    </div>
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
                <div className="lg:col-span-2 bg-gradient-to-br from-slate-50/80 via-white to-blue-50/30 dark:from-slate-800/50 dark:via-slate-900 dark:to-blue-950/20 p-4 sm:p-5 border-t lg:border-t-0 lg:border-l border-slate-100/80 dark:border-slate-700/50">
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
                    {behaviorProfile.map((item, idx) => {
                      const diff = item.value - item.benchmark;
                      const isGood = diff >= 0;
                      const percentage = Math.min(100, item.value);
                      const isStrong = item.value >= 80;
                      
                      return (
                        <div 
                          key={idx} 
                          className={cn(
                            "group p-2 rounded-lg transition-all duration-300",
                            "hover:bg-white/80 dark:hover:bg-slate-800/60",
                            isStrong && "ring-1 ring-blue-200/50 dark:ring-blue-800/30 bg-blue-50/30 dark:bg-blue-950/20"
                          )}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <div className="flex items-center gap-1.5">
                              {isStrong && <Sparkles className="h-3 w-3 text-blue-500" />}
                              <span className={cn(
                                "text-[11px] font-medium",
                                isStrong ? "text-blue-700 dark:text-blue-400" : "text-slate-600 dark:text-slate-400"
                              )}>
                                {item.metric}
                              </span>
                            </div>
                            <div className="flex items-center gap-2">
                              <span className={cn(
                                "text-[10px] font-bold px-1.5 py-0.5 rounded",
                                isGood 
                                  ? "text-emerald-700 bg-emerald-100/80" 
                                  : "text-amber-700 bg-amber-100/80"
                              )}>
                                {diff > 0 ? "+" : ""}{diff}
                              </span>
                              <span className={cn(
                                "text-xs font-bold",
                                isStrong ? "text-blue-600" : "text-slate-800 dark:text-slate-200"
                              )}>
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
                              className={cn(
                                "h-full rounded-full transition-all duration-500",
                                isGood 
                                  ? "bg-gradient-to-r from-blue-500 to-blue-700" 
                                  : "bg-gradient-to-r from-amber-400 to-orange-500"
                              )}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* SAÚDE */}
        <TabsContent value="health" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {/* Gráfico de Peso - Premium */}
            <Card className="lg:col-span-3 overflow-hidden border-0 shadow-sm">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-purple-50/30 dark:from-slate-900 dark:to-purple-950/20">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-purple-500/15 to-purple-600/10">
                      <Weight className="h-5 w-5 text-purple-600" />
                    </div>
                    <div>
                      <CardTitle className="text-base font-bold">Evolução de Peso</CardTitle>
                      <CardDescription className="text-xs">Últimas 10 pesagens registradas</CardDescription>
                    </div>
                  </div>
                  {weightHistory?.trend && (
                    <div className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold",
                      weightHistory.trend === "gaining" ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
                      weightHistory.trend === "losing" ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
                      "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    )}>
                      {weightHistory.trend === "gaining" && <TrendingUp className="h-3.5 w-3.5" />}
                      {weightHistory.trend === "losing" && <TrendingDown className="h-3.5 w-3.5" />}
                      {weightHistory.trend === "stable" && <Minus className="h-3.5 w-3.5" />}
                      {weightHistory.trend === "gaining" ? "Ganhando" :
                       weightHistory.trend === "losing" ? "Perdendo" : "Estável"}
                    </div>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {weightChartData.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 text-center">
                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                      <Weight className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-sm font-medium text-muted-foreground">Nenhuma pesagem registrada</p>
                    <p className="text-xs text-muted-foreground/70 mt-1">Adicione pesagens para acompanhar</p>
                  </div>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weightChartData} margin={{ top: 10, right: 10, bottom: 10, left: 0 }}>
                        <defs>
                          <linearGradient id="weightGradient" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} vertical={false} />
                        <XAxis dataKey="date" stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis domain={["dataMin - 1", "dataMax + 1"]} stroke="#94a3b8" fontSize={11} tickLine={false} axisLine={false} />
                        <Tooltip 
                          contentStyle={{ 
                            backgroundColor: 'rgba(255, 255, 255, 0.95)', 
                            border: 'none',
                            borderRadius: '12px',
                            boxShadow: '0 10px 40px rgba(0, 0, 0, 0.15)'
                          }}
                          formatter={(value) => [`${value} kg`, 'Peso']}
                        />
                        <Line 
                          type="monotone" 
                          dataKey="peso" 
                          stroke="#8b5cf6" 
                          strokeWidth={3}
                          dot={{ r: 5, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                          activeDot={{ r: 7, fill: '#8b5cf6', stroke: '#fff', strokeWidth: 2 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Condições Médicas - Premium */}
            <Card className="lg:col-span-2 overflow-hidden border-0 shadow-sm">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Heart className="h-4 w-4 text-red-500" />
                  <CardTitle className="text-sm font-semibold">Condições de Saúde</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-4 space-y-3">
                {pet.severeAllergies && (
                  <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/50 border border-red-100 dark:border-red-900/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-7 w-7 rounded-lg bg-red-100 dark:bg-red-900/50 flex items-center justify-center">
                        <AlertTriangle className="h-4 w-4 text-red-600 dark:text-red-400" />
                      </div>
                      <p className="font-semibold text-sm text-red-700 dark:text-red-300">Alergias Graves</p>
                    </div>
                    <p className="text-sm text-red-800/80 dark:text-red-200/80">{pet.severeAllergies}</p>
                  </div>
                )}
                
                {pet.medicalConditions && (
                  <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-100 dark:border-amber-900/50">
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-7 w-7 rounded-lg bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center">
                        <Syringe className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                      </div>
                      <p className="font-semibold text-sm text-amber-700 dark:text-amber-300">Condições Médicas</p>
                    </div>
                    <p className="text-sm text-amber-800/80 dark:text-amber-200/80">{pet.medicalConditions}</p>
                  </div>
                )}
                
                {!pet.severeAllergies && !pet.medicalConditions && (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="h-12 w-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-3">
                      <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
                    </div>
                    <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">Tudo em ordem!</p>
                    <p className="text-xs text-muted-foreground mt-1">Nenhuma condição registrada</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ADESTRAMENTO */}
        <TabsContent value="training" className="space-y-4">
          <Card className="overflow-hidden border-0 shadow-sm">
            <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-900 dark:to-blue-950/20">
              <div className="flex items-center justify-between flex-wrap gap-3">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-blue-500/15 to-blue-600/10">
                    <Star className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">Matriz de Habilidades</CardTitle>
                    <CardDescription className="text-xs">Progresso nos comandos de obediência</CardDescription>
                  </div>
                </div>
                {skillsMatrix && skillsMatrix.length > 0 && (
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                      <CheckCircle2 className="h-3 w-3" />
                      {skillsMatrix.filter(s => s.status === "mastered").length} dominados
                    </div>
                    <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs font-semibold">
                      <Activity className="h-3 w-3" />
                      {skillsMatrix.filter(s => s.status === "learning").length} aprendendo
                    </div>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent className="p-5">
              {!skillsMatrix || skillsMatrix.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                    <Star className="h-6 w-6 text-muted-foreground/50" />
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">Nenhuma habilidade registrada</p>
                  <p className="text-xs text-muted-foreground/70 mt-1">Adicione comandos para acompanhar o progresso</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                  {skillsMatrix.map((skill, idx) => {
                    const statusConfig = {
                      mastered: { 
                        icon: CheckCircle2, 
                        bg: "bg-emerald-50 dark:bg-emerald-900/30", 
                        border: "border-emerald-200 dark:border-emerald-800/50",
                        iconBg: "bg-emerald-100 dark:bg-emerald-800/50",
                        iconColor: "text-emerald-600 dark:text-emerald-400",
                        label: "Dominado"
                      },
                      learning: { 
                        icon: Activity, 
                        bg: "bg-blue-50 dark:bg-blue-900/30", 
                        border: "border-blue-200 dark:border-blue-800/50",
                        iconBg: "bg-blue-100 dark:bg-blue-800/50",
                        iconColor: "text-blue-600 dark:text-blue-400",
                        label: "Aprendendo"
                      },
                      inconsistent: { 
                        icon: AlertTriangle, 
                        bg: "bg-amber-50 dark:bg-amber-900/30", 
                        border: "border-amber-200 dark:border-amber-800/50",
                        iconBg: "bg-amber-100 dark:bg-amber-800/50",
                        iconColor: "text-amber-600 dark:text-amber-400",
                        label: "Inconsistente"
                      },
                      not_started: { 
                        icon: Clock, 
                        bg: "bg-slate-50 dark:bg-slate-800/50", 
                        border: "border-slate-200 dark:border-slate-700/50",
                        iconBg: "bg-slate-100 dark:bg-slate-700/50",
                        iconColor: "text-slate-500 dark:text-slate-400",
                        label: "Não iniciado"
                      },
                    }[skill.status] || {
                      icon: Clock,
                      bg: "bg-slate-50 dark:bg-slate-800/50",
                      border: "border-slate-200 dark:border-slate-700/50",
                      iconBg: "bg-slate-100 dark:bg-slate-700/50",
                      iconColor: "text-slate-500 dark:text-slate-400",
                      label: "Não iniciado"
                    };
                    
                    const IconComponent = statusConfig.icon;
                    
                    return (
                      <div 
                        key={idx} 
                        className={cn(
                          "p-4 rounded-xl border text-center transition-all hover:shadow-md hover:-translate-y-0.5 cursor-default",
                          statusConfig.bg,
                          statusConfig.border
                        )}
                      >
                        <div className={cn(
                          "h-10 w-10 rounded-xl flex items-center justify-center mx-auto mb-2",
                          statusConfig.iconBg
                        )}>
                          <IconComponent className={cn("h-5 w-5", statusConfig.iconColor)} />
                        </div>
                        <p className="font-semibold text-sm">{skill.name}</p>
                        <p className={cn("text-[10px] font-medium mt-1 uppercase tracking-wider", statusConfig.iconColor)}>
                          {statusConfig.label}
                        </p>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* EMERGÊNCIA */}
        <TabsContent value="emergency" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="h-5 w-5 text-red-500" />
                Protocolo de Emergência
              </CardTitle>
              <CardDescription>Contatos e informações críticas para emergências</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Veterinário */}
              <div className="p-4 rounded-lg border-2 border-red-200 dark:border-red-800">
                <h3 className="font-semibold mb-2">Veterinário Preferencial</h3>
                {pet.emergencyVetName ? (
                  <div className="space-y-2">
                    <p className="text-lg font-medium">{pet.emergencyVetName}</p>
                    {pet.emergencyVetPhone && (
                      <a 
                        href={`tel:${pet.emergencyVetPhone}`}
                        className="flex items-center gap-2 text-primary hover:underline"
                      >
                        <Phone className="h-4 w-4" />
                        {pet.emergencyVetPhone}
                      </a>
                    )}
                    {pet.emergencyVetAddress && (
                      <p className="text-sm text-muted-foreground">{pet.emergencyVetAddress}</p>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground">Não configurado</p>
                )}
              </div>

              {/* Alergias Graves */}
              {pet.severeAllergies && (
                <div className="p-4 rounded-lg bg-red-100 dark:bg-red-950 border border-red-300">
                  <h3 className="font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
                    <AlertTriangle className="h-5 w-5" />
                    ALERGIAS GRAVES
                  </h3>
                  <p className="mt-2 text-lg">{pet.severeAllergies}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ALIMENTAÇÃO */}
        <TabsContent value="feeding" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            {/* Configuração - Premium */}
            <Card className="lg:col-span-2 overflow-hidden border-0 shadow-sm">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 bg-gradient-to-r from-slate-50 to-orange-50/30 dark:from-slate-900 dark:to-orange-950/20">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-xl flex items-center justify-center bg-gradient-to-br from-orange-500/15 to-orange-600/10">
                    <Utensils className="h-5 w-5 text-orange-600" />
                  </div>
                  <div>
                    <CardTitle className="text-base font-bold">Configuração de Alimentação</CardTitle>
                    <CardDescription className="text-xs">Preferências e rotina alimentar</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5 space-y-5">
                {/* Grid de Métricas */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-xl bg-muted/50 hover:bg-muted/80 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Marca</span>
                    </div>
                    <p className="font-semibold text-sm truncate">{pet.foodBrand || "N/A"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 hover:bg-muted/80 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Utensils className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Tipo</span>
                    </div>
                    <p className="font-semibold text-sm capitalize">
                      {pet.foodType === "dry" ? "Seca" :
                       pet.foodType === "wet" ? "Úmida" :
                       pet.foodType === "mixed" ? "Mista" :
                       pet.foodType === "natural" ? "Natural" :
                       pet.foodType === "barf" ? "BARF" : "N/A"}
                    </p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 hover:bg-muted/80 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Activity className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Diário</span>
                    </div>
                    <p className="font-semibold text-sm">{pet.foodAmount ? `${pet.foodAmount}g` : "N/A"}</p>
                  </div>
                  <div className="p-3 rounded-xl bg-muted/50 hover:bg-muted/80 transition-colors">
                    <div className="flex items-center gap-2 mb-1">
                      <Package className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Estoque</span>
                    </div>
                    <p className="font-semibold text-sm">
                      {pet.foodStockGrams ? `${(pet.foodStockGrams / 1000).toFixed(1)} kg` : "N/A"}
                    </p>
                  </div>
                </div>
                
                {pet.feedingInstructions && (
                  <div className="p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-blue-600" />
                      <p className="text-sm font-semibold text-blue-700 dark:text-blue-300">Instruções de Preparo</p>
                    </div>
                    <p className="text-sm text-blue-800/80 dark:text-blue-200/80">{pet.feedingInstructions}</p>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <Button onClick={() => setFeedingModalOpen(true)} className="flex-1 active:scale-95 transition-transform">
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Refeição
                  </Button>
                  <Button variant="outline" onClick={() => setStockModalOpen(true)} className="flex-1 active:scale-95 transition-transform">
                    <Package className="h-4 w-4 mr-2" />
                    Atualizar Estoque
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Previsão de Estoque - Visual Gauge */}
            <Card className="overflow-hidden border-0 shadow-sm">
              <CardHeader className="border-b border-slate-100 dark:border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-semibold">Previsão de Estoque</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                {stockForecast && stockForecast.dailyConsumption > 0 ? (
                  <div className="space-y-4">
                    {/* Indicador Visual Circular */}
                    <div className="relative flex items-center justify-center">
                      <div className={cn(
                        "w-32 h-32 rounded-full flex flex-col items-center justify-center",
                        stockForecast.alertLevel === "ok" 
                          ? "bg-gradient-to-br from-emerald-100 to-emerald-50 dark:from-emerald-900/40 dark:to-emerald-950/20" 
                          : stockForecast.alertLevel === "warning"
                          ? "bg-gradient-to-br from-amber-100 to-amber-50 dark:from-amber-900/40 dark:to-amber-950/20"
                          : "bg-gradient-to-br from-red-100 to-red-50 dark:from-red-900/40 dark:to-red-950/20"
                      )}>
                        <p className={cn(
                          "text-4xl font-bold",
                          stockForecast.alertLevel === "ok" ? "text-emerald-600 dark:text-emerald-400" 
                            : stockForecast.alertLevel === "warning" ? "text-amber-600 dark:text-amber-400"
                            : "text-red-600 dark:text-red-400"
                        )}>
                          {stockForecast.daysRemaining}
                        </p>
                        <p className="text-xs text-muted-foreground font-medium">dias</p>
                      </div>
                    </div>
                    
                    {/* Métricas */}
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 rounded-lg bg-muted/30">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Package className="h-3 w-3" /> Estoque
                        </span>
                        <span className="text-sm font-semibold">{(stockForecast.currentStock / 1000).toFixed(1)} kg</span>
                      </div>
                      <div className="flex justify-between items-center p-2 rounded-lg bg-muted/30">
                        <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                          <Activity className="h-3 w-3" /> Consumo/dia
                        </span>
                        <span className="text-sm font-semibold">{stockForecast.dailyConsumption}g</span>
                      </div>
                    </div>

                    {stockForecast.alertLevel !== "ok" && (
                      <div className={cn(
                        "p-3 rounded-xl flex items-start gap-2",
                        stockForecast.alertLevel === "empty" || stockForecast.alertLevel === "critical" 
                          ? "bg-red-100 dark:bg-red-950/50 text-red-700 dark:text-red-300"
                          : "bg-amber-100 dark:bg-amber-950/50 text-amber-700 dark:text-amber-300"
                      )}>
                        <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
                        <p className="text-xs font-medium">
                          {stockForecast.alertLevel === "empty" && "Estoque zerado! Avisar tutor."}
                          {stockForecast.alertLevel === "critical" && "Estoque crítico!"}
                          {stockForecast.alertLevel === "warning" && "Estoque baixo."}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <div className="h-12 w-12 rounded-xl bg-muted flex items-center justify-center mb-3">
                      <Utensils className="h-6 w-6 text-muted-foreground/50" />
                    </div>
                    <p className="text-xs text-muted-foreground">Configure a quantidade diária</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Modal: Atualizar Estoque */}
      <Dialog open={stockModalOpen} onOpenChange={setStockModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Atualizar Estoque de Ração</DialogTitle>
            <DialogDescription>
              Informe a quantidade total de ração disponível na creche
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div>
              <Label htmlFor="stock">Quantidade (gramas)</Label>
              <Input
                id="stock"
                type="number"
                placeholder="Ex: 2000 (2kg)"
                value={newStock}
                onChange={(e) => setNewStock(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {newStock && `= ${(parseInt(newStock) / 1000).toFixed(1)} kg`}
              </p>
            </div>
            <Button
              className="w-full"
              onClick={() => {
                updateStock.mutate({
                  petId,
                  stockGrams: parseInt(newStock),
                });
              }}
              disabled={!newStock || updateStock.isPending}
            >
              {updateStock.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : null}
              Salvar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal: Registrar Alimentação */}
      <FeedingModal
        open={feedingModalOpen}
        onOpenChange={setFeedingModalOpen}
        petId={petId}
        defaultAmount={pet.foodAmount || 0}
        onSuccess={refetch}
      />
    </div>
  );
}

// Componente separado para o modal de alimentação
function FeedingModal({ 
  open, 
  onOpenChange, 
  petId, 
  defaultAmount,
  onSuccess 
}: { 
  open: boolean; 
  onOpenChange: (open: boolean) => void;
  petId: number;
  defaultAmount: number;
  onSuccess: () => void;
}) {
  const [mealType, setMealType] = useState<"breakfast" | "lunch" | "dinner" | "snack">("lunch");
  const [amount, setAmount] = useState(defaultAmount.toString());
  const [consumption, setConsumption] = useState<"all" | "most" | "half" | "little" | "none">("all");
  const [notes, setNotes] = useState("");

  const logFeeding = trpc.petManagement.logFeeding.useMutation({
    onSuccess: () => {
      toast.success("Alimentação registrada!");
      onSuccess();
      onOpenChange(false);
    },
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Alimentação</DialogTitle>
          <DialogDescription>Registre a refeição e o quanto o pet comeu</DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div>
            <Label>Refeição</Label>
            <Select value={mealType} onValueChange={(v) => setMealType(v as typeof mealType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="breakfast">Café da Manhã</SelectItem>
                <SelectItem value="lunch">Almoço</SelectItem>
                <SelectItem value="dinner">Jantar</SelectItem>
                <SelectItem value="snack">Lanche</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Quantidade Oferecida (g)</Label>
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          <div>
            <Label>Consumo</Label>
            <Select value={consumption} onValueChange={(v) => setConsumption(v as typeof consumption)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Comeu tudo</SelectItem>
                <SelectItem value="most">Comeu quase tudo</SelectItem>
                <SelectItem value="half">Comeu metade</SelectItem>
                <SelectItem value="little">Comeu pouco</SelectItem>
                <SelectItem value="none">Não comeu</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Observações</Label>
            <Input
              placeholder="Opcional"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <Button
            className="w-full"
            onClick={() => {
              logFeeding.mutate({
                petId,
                mealType,
                amountGrams: parseInt(amount),
                consumption,
                notes: notes || undefined,
              });
            }}
            disabled={!amount || logFeeding.isPending}
          >
            {logFeeding.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Registrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
