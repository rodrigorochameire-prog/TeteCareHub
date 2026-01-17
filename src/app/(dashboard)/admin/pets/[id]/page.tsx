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
import { BreedIcon } from "@/components/breed-icons";

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
  // Sociabilidade: harmonizado com DOG_SOCIABILITY (social, selective, reactive, antisocial)
  // + suporte legacy (very_social, friendly, selective, shy)
  const sociabilityScoreMap: Record<string, number> = {
    // Valores atuais (DOG_SOCIABILITY)
    social: 95, selective: 60, reactive: 35, antisocial: 15,
    // Valores legacy
    very_social: 95, friendly: 75, shy: 40,
  };
  const sociabilityScore = sociabilityScoreMap[pet.sociabilityLevel || ""] || 50;
  
  // Energia: harmonizado com ENERGY_LEVELS (very_low, low, moderate, high, hyperactive)
  // + suporte legacy (very_high, high, medium, low)
  const energyScoreMap: Record<string, number> = {
    // Valores atuais (ENERGY_LEVELS)
    hyperactive: 95, high: 80, moderate: 60, low: 40, very_low: 20,
    // Valores legacy
    very_high: 95, medium: 60,
  };
  const energyScore = energyScoreMap[pet.energyLevel || ""] || 50;
  
  // Obediência: baseado em skillsMatrix com status harmonizado (reliable = mastered)
  const obedienceScore = skillsMatrix 
    ? Math.round((skillsMatrix.filter(s => s.status === "reliable" || s.status === "mastered").length / Math.max(skillsMatrix.length, 1)) * 100) 
    : 55;
    
  const calmnessScore = pet.anxietySeparation === "none" ? 95 : pet.anxietySeparation === "mild" ? 70 : pet.anxietySeparation === "moderate" ? 45 : 20;
  const aggressionHistory = (pet as any).aggressionHistory;
  const docilityScore = aggressionHistory === "none" ? 95 : aggressionHistory === "minor" ? 75 : aggressionHistory === "mild" ? 60 : 40;
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

      {/* Header - Clean com ícone de raça */}
      <Card className="shadow-sm">
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/admin/pets">
                <Button variant="ghost" size="icon" className="shrink-0">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              
              {/* Foto ou Ícone de Raça */}
              {pet.photoUrl ? (
                <img
                  src={pet.photoUrl}
                  alt={pet.name}
                  className="w-16 h-16 rounded-xl object-cover border-2 border-primary/20 shadow-sm"
                />
              ) : (
                <BreedIcon breed={pet.breed} size={64} />
              )}
              
              <div className="min-w-0">
                <h1 className="text-2xl font-bold truncate">{pet.name}</h1>
                <p className="text-muted-foreground text-sm">{pet.breed || "Raça não informada"} • {calculateAge()}</p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 shrink-0">
              <Badge 
                variant={pet.status === "checked-in" ? "default" : "secondary"} 
                className="text-xs whitespace-nowrap"
              >
                {pet.status === "checked-in" ? "Na Creche" : "Fora da Creche"}
              </Badge>
              <Link href={`/admin/pets/${petId}/edit`} className="hidden sm:block">
                <Button variant="outline" size="sm">
                  <Edit className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Cards Rápidos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Estoque de Ração */}
        <Card className="cursor-pointer hover:shadow-md transition-shadow" onClick={() => setStockModalOpen(true)}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Package className="h-4 w-4" />
                Estoque Ração
              </span>
              <Badge variant="outline" className={getAlertColor(stockForecast?.alertLevel || "unknown")}>
                {stockForecast?.daysRemaining != null ? `${stockForecast.daysRemaining} dias` : "N/A"}
              </Badge>
            </div>
            <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
              <div 
                className={`h-full transition-all ${
                  stockForecast?.alertLevel === "ok" ? "bg-green-500" :
                  stockForecast?.alertLevel === "warning" ? "bg-yellow-500" : "bg-red-500"
                }`}
                style={{ width: `${getStockProgress()}%` }}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {stockForecast?.currentStock ? `${(stockForecast.currentStock / 1000).toFixed(1)} kg restante` : "Não configurado"}
            </p>
          </CardContent>
        </Card>

        {/* Peso */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Weight className="h-4 w-4" />
                Peso Atual
              </span>
              {weightHistory?.trend && (
                <span className="flex items-center gap-1">
                  {weightHistory.trend === "gaining" && <TrendingUp className="h-4 w-4 text-yellow-500" />}
                  {weightHistory.trend === "losing" && <TrendingDown className="h-4 w-4 text-red-500" />}
                  {weightHistory.trend === "stable" && <Minus className="h-4 w-4 text-green-500" />}
                </span>
              )}
            </div>
            <p className="text-2xl font-bold">
              {pet.weight ? `${(pet.weight / 1000).toFixed(1)} kg` : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">
              {weightHistory?.trend === "gaining" && "Ganhando peso"}
              {weightHistory?.trend === "losing" && "Perdendo peso"}
              {weightHistory?.trend === "stable" && "Peso estável"}
            </p>
          </CardContent>
        </Card>

        {/* Créditos */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Star className="h-4 w-4" />
                Créditos
              </span>
            </div>
            <p className="text-2xl font-bold">{pet.credits}</p>
            <p className="text-xs text-muted-foreground">
              {pet.credits < 3 ? "Baixo - avisar tutor" : "Saldo adequado"}
            </p>
          </CardContent>
        </Card>

        {/* Nível de Energia */}
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Zap className="h-4 w-4" />
                Energia
              </span>
            </div>
            <p className="text-2xl font-bold capitalize">
              {/* Valores harmonizados (ENERGY_LEVELS) + legacy */}
              {pet.energyLevel === "hyperactive" ? "Hiperativo" :
               pet.energyLevel === "very_high" ? "Muito Alta" :
               pet.energyLevel === "high" ? "Alta" :
               pet.energyLevel === "moderate" || pet.energyLevel === "medium" ? "Moderada" :
               pet.energyLevel === "low" ? "Baixa" :
               pet.energyLevel === "very_low" ? "Muito Baixa" : "N/A"}
            </p>
            <p className="text-xs text-muted-foreground">
              {pet.roomPreference ? `Sala: ${pet.roomPreference}` : "Sem preferência de sala"}
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
          <Card>
            <CardHeader>
              <CardTitle>Timeline Unificada</CardTitle>
              <CardDescription>Toda a vida do pet em ordem cronológica</CardDescription>
            </CardHeader>
            <CardContent>
              {!timeline || timeline.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhum registro ainda</p>
              ) : (
                <div className="space-y-4 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-0.5 before:bg-gray-200 dark:before:bg-gray-700">
                  {timeline.map((item, idx) => (
                    <div key={idx} className="relative pl-10">
                      <div className={`absolute left-2 w-4 h-4 rounded-full border-2 border-white dark:border-gray-900 ${
                        item.type === "log" ? "bg-blue-500" :
                        item.type === "event" ? "bg-green-500" :
                        item.type === "weight" ? "bg-purple-500" :
                        item.type === "feeding" ? "bg-orange-500" :
                        item.type === "alert" ? "bg-red-500" : "bg-gray-500"
                      }`} />
                      
                      <div className="bg-muted/50 rounded-lg p-3">
                        <div className="flex items-center justify-between mb-1">
                          <Badge variant="outline" className="text-xs">
                            {item.type === "log" && "Log Diário"}
                            {item.type === "event" && "Evento"}
                            {item.type === "weight" && "Pesagem"}
                            {item.type === "feeding" && "Alimentação"}
                            {item.type === "alert" && "Alerta"}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {formatDistanceToNow(new Date(item.date), { locale: ptBR, addSuffix: true })}
                          </span>
                        </div>
                        
                        {item.type === "log" && (
                          <div>
                            <p className="text-sm">
                              Humor: <Badge variant="secondary">{item.data.mood || "N/A"}</Badge>
                              {" "}Apetite: <Badge variant="secondary">{item.data.appetite || "N/A"}</Badge>
                            </p>
                            {item.data.notes && <p className="text-sm text-muted-foreground mt-1">{item.data.notes}</p>}
                          </div>
                        )}
                        
                        {item.type === "event" && (
                          <p className="text-sm">
                            <strong>{item.data.eventType === "checkin" ? "Check-in" : "Check-out"}</strong>
                            {item.data.notes && ` - ${item.data.notes}`}
                          </p>
                        )}
                        
                        {item.type === "weight" && (
                          <p className="text-sm">
                            Peso registrado: <strong>{item.data.weightKg} kg</strong>
                            {item.data.notes && ` - ${item.data.notes}`}
                          </p>
                        )}
                        
                        {item.type === "feeding" && (
                          <p className="text-sm">
                            {item.data.mealType}: {item.data.amountGrams}g - 
                            Consumo: <Badge variant={item.data.consumption === "all" ? "default" : "secondary"}>
                              {item.data.consumption === "all" ? "Tudo" :
                               item.data.consumption === "most" ? "Quase tudo" :
                               item.data.consumption === "half" ? "Metade" :
                               item.data.consumption === "little" ? "Pouco" : "Nada"}
                            </Badge>
                          </p>
                        )}
                        
                        {item.type === "alert" && (
                          <div>
                            <Badge variant={item.data.severity === "critical" ? "destructive" : "default"}>
                              {item.data.alertType}
                            </Badge>
                            <p className="text-sm font-medium mt-1">{item.data.title}</p>
                            {item.data.description && <p className="text-xs text-muted-foreground">{item.data.description}</p>}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
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
                  <div className="relative mx-1 sm:mx-2">
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-48 h-48 rounded-full bg-gradient-to-br from-purple-500/10 via-violet-500/5 to-transparent blur-3xl" />
                    </div>
                    
                    <div className="h-[320px] sm:h-[400px] relative z-10">
                      <ResponsiveContainer width="100%" height="100%">
                        <RadarChart 
                          data={behaviorProfile} 
                          cx="50%" 
                          cy="50%" 
                          outerRadius="70%"
                          margin={{ top: 40, right: 40, bottom: 40, left: 40 }}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Gráfico de Peso */}
            <Card>
              <CardHeader>
                <CardTitle>Evolução de Peso</CardTitle>
                <CardDescription>Últimas 10 pesagens</CardDescription>
              </CardHeader>
              <CardContent>
                {weightChartData.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">Nenhuma pesagem registrada</p>
                ) : (
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={weightChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis domain={["dataMin - 1", "dataMax + 1"]} />
                        <Tooltip />
                        <Line 
                          type="monotone" 
                          dataKey="peso" 
                          stroke="#8884d8" 
                          strokeWidth={2}
                          dot={{ r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Condições Médicas */}
            <Card>
              <CardHeader>
                <CardTitle>Condições de Saúde</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {pet.severeAllergies && (
                  <div className="p-3 rounded-lg bg-red-50 dark:bg-red-950 border border-red-200 dark:border-red-800">
                    <p className="font-semibold text-red-700 dark:text-red-300 flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4" />
                      Alergias Graves
                    </p>
                    <p className="text-sm">{pet.severeAllergies}</p>
                  </div>
                )}
                
                {pet.medicalConditions && (
                  <div className="p-3 rounded-lg bg-yellow-50 dark:bg-yellow-950 border border-yellow-200 dark:border-yellow-800">
                    <p className="font-semibold text-yellow-700 dark:text-yellow-300">Condições Médicas</p>
                    <p className="text-sm">{pet.medicalConditions}</p>
                  </div>
                )}
                
                {!pet.severeAllergies && !pet.medicalConditions && (
                  <p className="text-muted-foreground text-center py-4">Nenhuma condição registrada</p>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* ADESTRAMENTO */}
        <TabsContent value="training" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Matriz de Habilidades</CardTitle>
              <CardDescription>Progresso nos comandos de obediência</CardDescription>
            </CardHeader>
            <CardContent>
              {!skillsMatrix || skillsMatrix.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">Nenhuma habilidade registrada</p>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
                  {skillsMatrix.map((skill, idx) => {
                    // Status harmonizado com COMMAND_PROFICIENCY + valores legacy
                    const isProofed = skill.status === "proofed";
                    const isReliable = skill.status === "reliable" || skill.status === "mastered";
                    const isWithTreat = skill.status === "with_treat" || skill.status === "practicing";
                    const isLearning = skill.status === "learning";
                    const isInconsistent = skill.status === "inconsistent";
                    
                    return (
                      <div 
                        key={idx} 
                        className={`p-3 rounded-lg border text-center ${
                          isProofed ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-200" :
                          isReliable ? "bg-green-50 dark:bg-green-950 border-green-200" :
                          isWithTreat ? "bg-yellow-50 dark:bg-yellow-950 border-yellow-200" :
                          isInconsistent ? "bg-amber-50 dark:bg-amber-950 border-amber-200" :
                          isLearning ? "bg-blue-50 dark:bg-blue-950 border-blue-200" :
                          "bg-gray-50 dark:bg-gray-900 border-gray-200"
                        }`}
                      >
                        <p className="font-medium text-sm">{skill.name}</p>
                        <Badge 
                          variant="outline" 
                          className={`mt-1 text-xs ${
                            isProofed ? "text-emerald-600" :
                            isReliable ? "text-green-600" :
                            isWithTreat ? "text-yellow-600" :
                            isInconsistent ? "text-amber-600" :
                            isLearning ? "text-blue-600" :
                            "text-gray-400"
                          }`}
                        >
                          {isProofed ? "Dominado c/ Distração" :
                           isReliable ? "Dominado" :
                           isWithTreat ? "Faz c/ Petisco" :
                           isInconsistent ? "Inconsistente" :
                           isLearning ? "Aprendendo" : "Não iniciado"}
                        </Badge>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Configuração */}
            <Card>
              <CardHeader>
                <CardTitle>Configuração de Alimentação</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Marca</p>
                    <p className="font-medium">{pet.foodBrand || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo</p>
                    <p className="font-medium capitalize">
                      {pet.foodType === "dry" ? "Seca" :
                       pet.foodType === "wet" ? "Úmida" :
                       pet.foodType === "mixed" ? "Mista" :
                       pet.foodType === "natural" ? "Natural" :
                       pet.foodType === "barf" ? "BARF" : "N/A"}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Quantidade Diária</p>
                    <p className="font-medium">{pet.foodAmount ? `${pet.foodAmount}g` : "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Estoque Atual</p>
                    <p className="font-medium">
                      {pet.foodStockGrams ? `${(pet.foodStockGrams / 1000).toFixed(1)} kg` : "N/A"}
                    </p>
                  </div>
                </div>
                
                {pet.feedingInstructions && (
                  <div className="mt-4 p-3 rounded-lg bg-blue-50 dark:bg-blue-950">
                    <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Instruções de Preparo:</p>
                    <p className="text-sm mt-1">{pet.feedingInstructions}</p>
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <Button onClick={() => setFeedingModalOpen(true)} className="flex-1">
                    <Plus className="h-4 w-4 mr-2" />
                    Registrar Refeição
                  </Button>
                  <Button variant="outline" onClick={() => setStockModalOpen(true)} className="flex-1">
                    <Package className="h-4 w-4 mr-2" />
                    Atualizar Estoque
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Previsão */}
            <Card>
              <CardHeader>
                <CardTitle>Previsão de Estoque</CardTitle>
              </CardHeader>
              <CardContent>
                {stockForecast && stockForecast.dailyConsumption > 0 ? (
                  <div className="space-y-4">
                    <div className="text-center p-6 rounded-lg bg-muted">
                      <p className={`text-5xl font-bold ${getAlertColor(stockForecast.alertLevel)}`}>
                        {stockForecast.daysRemaining}
                      </p>
                      <p className="text-muted-foreground">dias restantes</p>
                    </div>
                    
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estoque atual:</span>
                        <span>{(stockForecast.currentStock / 1000).toFixed(1)} kg</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Consumo diário:</span>
                        <span>{stockForecast.dailyConsumption}g</span>
                      </div>
                      {stockForecast.lastUpdate && (
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Última atualização:</span>
                          <span>{formatDistanceToNow(new Date(stockForecast.lastUpdate), { locale: ptBR, addSuffix: true })}</span>
                        </div>
                      )}
                    </div>

                    {stockForecast.alertLevel !== "ok" && (
                      <div className={`p-3 rounded-lg ${
                        stockForecast.alertLevel === "empty" || stockForecast.alertLevel === "critical" 
                          ? "bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300"
                          : "bg-yellow-100 dark:bg-yellow-950 text-yellow-700 dark:text-yellow-300"
                      }`}>
                        <p className="text-sm font-medium flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          {stockForecast.alertLevel === "empty" && "Estoque zerado! Avisar tutor imediatamente."}
                          {stockForecast.alertLevel === "critical" && "Estoque crítico! Avisar tutor."}
                          {stockForecast.alertLevel === "warning" && "Estoque baixo. Considerar avisar tutor."}
                        </p>
                      </div>
                    )}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">
                    Configure a quantidade diária para ver a previsão
                  </p>
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
