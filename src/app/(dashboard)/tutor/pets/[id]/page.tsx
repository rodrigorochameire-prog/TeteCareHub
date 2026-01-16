"use client";

import { use, useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PetAvatar } from "@/components/pet-avatar";
import {
  Dog,
  Calendar,
  Weight,
  Utensils,
  FileText,
  Pencil,
  Coins,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  Syringe,
  Pill,
  GraduationCap,
  ClipboardList,
  FolderOpen,
  MessageSquare,
  Heart,
  Brain,
  Users,
  Zap,
  Frown,
  Activity,
  TrendingUp,
  TrendingDown,
  Minus,
  Sparkles,
  Shield,
} from "lucide-react";
import Link from "next/link";
import { formatDate, cn } from "@/lib/utils";
import { LoadingPage } from "@/components/shared/loading";
import { PageHeader } from "@/components/shared/page-header";
import { notFound } from "next/navigation";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

interface PetPageProps {
  params: Promise<{ id: string }>;
}

// ==========================================
// SISTEMA DE PONTUAÇÃO INTELIGENTE
// ==========================================

// Mapeamento de valores qualitativos para numéricos
const scoreMapping = {
  socialization: {
    excellent: { score: 95, label: "Excelente", color: "text-emerald-600" },
    good: { score: 75, label: "Bom", color: "text-green-600" },
    moderate: { score: 50, label: "Moderado", color: "text-amber-600" },
    poor: { score: 25, label: "Precisa Atenção", color: "text-red-600" },
  },
  energy: {
    high: { score: 85, label: "Alta", color: "text-orange-600" },
    normal: { score: 65, label: "Normal", color: "text-green-600" },
    low: { score: 35, label: "Baixa", color: "text-blue-600" },
  },
  obedience: {
    excellent: { score: 95, label: "Excelente", color: "text-emerald-600" },
    good: { score: 70, label: "Bom", color: "text-green-600" },
    needs_work: { score: 40, label: "Em Progresso", color: "text-amber-600" },
  },
  anxiety: {
    none: { score: 95, label: "Tranquilo", color: "text-emerald-600" },
    mild: { score: 70, label: "Leve", color: "text-amber-500" },
    moderate: { score: 40, label: "Moderada", color: "text-orange-600" },
    severe: { score: 15, label: "Severa", color: "text-red-600" },
  },
  aggression: {
    none: { score: 95, label: "Dócil", color: "text-emerald-600" },
    mild: { score: 65, label: "Ocasional", color: "text-amber-500" },
    moderate: { score: 35, label: "Moderada", color: "text-orange-600" },
    severe: { score: 10, label: "Alta", color: "text-red-600" },
  },
};

// Função para calcular score com tendência
function calculateMetricWithTrend(
  logs: any[],
  field: string,
  mapping: Record<string, { score: number; label: string; color: string }>
): {
  current: number;
  average: number;
  trend: "up" | "down" | "stable";
  trendValue: number;
  label: string;
  color: string;
} {
  if (!logs || logs.length === 0) {
    return { 
      current: 50, 
      average: 50, 
      trend: "stable", 
      trendValue: 0,
      label: "Sem dados",
      color: "text-muted-foreground"
    };
  }

  const validLogs = logs.filter((log: any) => log[field] && mapping[log[field]]);
  
  if (validLogs.length === 0) {
    return { 
      current: 50, 
      average: 50, 
      trend: "stable", 
      trendValue: 0,
      label: "Sem dados",
      color: "text-muted-foreground"
    };
  }

  const scores = validLogs.map((log: any) => mapping[log[field]].score);
  const average = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  const current = scores[0]; // Mais recente

  // Calcular tendência (últimos 5 vs anteriores)
  let trend: "up" | "down" | "stable" = "stable";
  let trendValue = 0;
  
  if (scores.length >= 3) {
    const recent = scores.slice(0, Math.min(3, Math.floor(scores.length / 2)));
    const older = scores.slice(Math.min(3, Math.floor(scores.length / 2)));
    
    const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
    const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
    
    trendValue = Math.round(recentAvg - olderAvg);
    
    if (trendValue > 5) trend = "up";
    else if (trendValue < -5) trend = "down";
  }

  const lastLog = validLogs[0];
  const lastValue = mapping[lastLog[field]];

  return {
    current,
    average,
    trend,
    trendValue: Math.abs(trendValue),
    label: lastValue.label,
    color: lastValue.color,
  };
}

// Função para calcular "Perfil Geral" (score composto)
function calculateOverallScore(metrics: { average: number }[]): {
  score: number;
  level: string;
  emoji: string;
  description: string;
} {
  const validMetrics = metrics.filter(m => m.average > 0);
  if (validMetrics.length === 0) {
    return { score: 0, level: "Sem dados", emoji: "📊", description: "Registre observações para ver o perfil" };
  }

  const score = Math.round(validMetrics.reduce((a, m) => a + m.average, 0) / validMetrics.length);

  if (score >= 85) return { score, level: "Excepcional", emoji: "🌟", description: "Comportamento exemplar!" };
  if (score >= 70) return { score, level: "Muito Bom", emoji: "😊", description: "Ótima adaptação na creche" };
  if (score >= 55) return { score, level: "Bom", emoji: "👍", description: "Desenvolvimento positivo" };
  if (score >= 40) return { score, level: "Em Progresso", emoji: "📈", description: "Evoluindo gradualmente" };
  return { score, level: "Atenção", emoji: "💪", description: "Trabalhando para melhorar" };
}

// ==========================================
// COMPONENTE DE MÉTRICA
// ==========================================

interface MetricCardProps {
  icon: React.ElementType;
  iconColor: string;
  bgColor: string;
  label: string;
  value: number;
  trend: "up" | "down" | "stable";
  trendValue: number;
  statusLabel: string;
  statusColor: string;
}

function MetricCard({
  icon: Icon,
  iconColor,
  bgColor,
  label,
  value,
  trend,
  trendValue,
  statusLabel,
  statusColor,
}: MetricCardProps) {
  return (
    <div className={cn(
      "relative p-3 rounded-xl border transition-all duration-300",
      "hover:shadow-md hover:-translate-y-0.5",
      bgColor,
      "border-slate-200/50 dark:border-slate-700/50"
    )}>
      {/* Ícone */}
      <div className="flex items-center gap-2 mb-2">
        <Icon className={cn("h-4 w-4", iconColor)} />
        <span className="text-xs font-medium text-slate-600 dark:text-slate-400">
          {label}
        </span>
      </div>
      
      {/* Valor e Tendência */}
      <div className="flex items-end justify-between">
        <div>
          <div className="text-xl font-bold text-slate-800 dark:text-slate-200">
            {value > 0 ? `${value}%` : "—"}
          </div>
          <div className={cn("text-[10px] font-medium", statusColor)}>
            {statusLabel}
          </div>
        </div>
        
        {/* Indicador de Tendência */}
        {value > 0 && trendValue > 0 && (
          <div className={cn(
            "flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full",
            trend === "up" && "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
            trend === "down" && "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
            trend === "stable" && "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400"
          )}>
            {trend === "up" && <TrendingUp className="h-3 w-3" />}
            {trend === "down" && <TrendingDown className="h-3 w-3" />}
            {trend === "stable" && <Minus className="h-3 w-3" />}
            <span>{trendValue}%</span>
          </div>
        )}
      </div>
    </div>
  );
}

export default function TutorPetDetailPage(props: PetPageProps) {
  const params = use(props.params);
  const petId = parseInt(params.id);

  const { data: pet, isLoading, error } = trpc.pets.byId.useQuery({ id: petId });
  
  // Buscar registros de comportamento dos últimos 30 dias
  const { data: behaviorLogs } = trpc.behavior.byPet.useQuery(
    { petId, limit: 30 },
    { enabled: !!pet, staleTime: 5 * 60 * 1000 }
  );

  // Calcular métricas inteligentes com tendências
  const behaviorMetrics = useMemo(() => {
    const logs = behaviorLogs || [];
    
    return {
      socialization: calculateMetricWithTrend(logs, "socialization", scoreMapping.socialization),
      obedience: calculateMetricWithTrend(logs, "obedience", scoreMapping.obedience),
      energy: calculateMetricWithTrend(logs, "energy", scoreMapping.energy),
      calmness: calculateMetricWithTrend(logs, "anxiety", scoreMapping.anxiety),
      docility: calculateMetricWithTrend(logs, "aggression", scoreMapping.aggression),
    };
  }, [behaviorLogs]);

  // Score geral do pet
  const overallScore = useMemo(() => {
    return calculateOverallScore([
      behaviorMetrics.socialization,
      behaviorMetrics.obedience,
      behaviorMetrics.calmness,
      behaviorMetrics.docility,
    ]);
  }, [behaviorMetrics]);

  // Dados do gráfico de radar otimizado
  const radarData = useMemo(() => {
    return [
      { 
        metric: "Social", 
        value: behaviorMetrics.socialization.average,
        fullMark: 100,
      },
      { 
        metric: "Obediência", 
        value: behaviorMetrics.obedience.average,
        fullMark: 100,
      },
      { 
        metric: "Energia", 
        value: behaviorMetrics.energy.average,
        fullMark: 100,
      },
      { 
        metric: "Calma", 
        value: behaviorMetrics.calmness.average,
        fullMark: 100,
      },
      { 
        metric: "Docilidade", 
        value: behaviorMetrics.docility.average,
        fullMark: 100,
      },
    ];
  }, [behaviorMetrics]);

  // Últimos registros de comportamento formatados
  const recentBehavior = useMemo(() => {
    if (!behaviorLogs) return [];
    return behaviorLogs.slice(0, 5);
  }, [behaviorLogs]);

  // Verificar se há dados suficientes
  const hasEnoughData = behaviorLogs && behaviorLogs.length >= 3;

  if (isLoading) {
    return <LoadingPage />;
  }

  if (error || !pet) {
    notFound();
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return (
          <Badge variant="success" className="gap-1">
            <CheckCircle className="h-3 w-3" />
            Aprovado
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="warning" className="gap-1">
            <AlertCircle className="h-3 w-3" />
            Pendente
          </Badge>
        );
      case "rejected":
        return (
          <Badge variant="destructive" className="gap-1">
            <XCircle className="h-3 w-3" />
            Rejeitado
          </Badge>
        );
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const PetIcon = Dog;

  return (
    <div className="space-y-6">
      <PageHeader
        title={pet.name}
        description={pet.breed || "Cachorro"}
        backHref="/tutor/pets"
        actions={
          <Button asChild>
            <Link href={`/tutor/pets/${pet.id}/edit`}>
              <Pencil className="h-4 w-4 mr-2" />
              Editar
            </Link>
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Info Principal */}
        <div className="lg:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-4">
                <PetAvatar 
                  photoUrl={pet.photoUrl} 
                  breed={pet.breed} 
                  name={pet.name} 
                  size={64} 
                />
                <div className="flex-1">
                  <CardTitle className="text-2xl">{pet.name}</CardTitle>
                  <CardDescription>{pet.breed}</CardDescription>
                </div>
                {getStatusBadge(pet.approvalStatus)}
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {pet.birthDate && (
                  <div className="flex items-start gap-2">
                    <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Nascimento</p>
                      <p className="font-medium">{formatDate(pet.birthDate)}</p>
                    </div>
                  </div>
                )}

                {pet.weight && (
                  <div className="flex items-start gap-2">
                    <Weight className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">Peso</p>
                      <p className="font-medium">{(pet.weight / 1000).toFixed(1)} kg</p>
                    </div>
                  </div>
                )}

                <div className="flex items-start gap-2">
                  <Coins className="h-5 w-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="text-sm text-muted-foreground">Créditos</p>
                    <p className="font-medium">{pet.credits} dias</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Alimentação */}
          {(pet.foodBrand || pet.foodAmount) && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Utensils className="h-5 w-5" />
                  Alimentação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  {pet.foodBrand && (
                    <div>
                      <p className="text-sm text-muted-foreground">Marca da ração</p>
                      <p className="font-medium">{pet.foodBrand}</p>
                    </div>
                  )}
                  {pet.foodAmount && (
                    <div>
                      <p className="text-sm text-muted-foreground">Quantidade diária</p>
                      <p className="font-medium">{pet.foodAmount}g</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Perfil Comportamental - Versão Premium */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Brain className="h-5 w-5 text-purple-500" />
                    Perfil Comportamental
                  </CardTitle>
                  <CardDescription>
                    Análise inteligente baseada em {behaviorLogs?.length || 0} registros
                  </CardDescription>
                </div>
                {/* Score Geral */}
                <div className="text-center px-4 py-2 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border border-purple-100 dark:border-purple-900/50">
                  <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {overallScore.score > 0 ? `${overallScore.score}%` : "—"}
                  </div>
                  <div className="text-xs text-purple-600/70 dark:text-purple-400/70 flex items-center gap-1">
                    <span>{overallScore.emoji}</span>
                    <span>{overallScore.level}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              {/* Gráfico de Radar Melhorado */}
              <div className="h-[320px] mt-2">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart 
                    data={radarData} 
                    cx="50%" 
                    cy="50%" 
                    outerRadius="70%"
                    margin={{ top: 20, right: 30, bottom: 20, left: 30 }}
                  >
                    <defs>
                      <linearGradient id="behaviorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
                      </linearGradient>
                      <filter id="glow">
                        <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
                        <feMerge>
                          <feMergeNode in="coloredBlur"/>
                          <feMergeNode in="SourceGraphic"/>
                        </feMerge>
                      </filter>
                    </defs>
                    <PolarGrid 
                      stroke="#e2e8f0" 
                      strokeDasharray="3 3"
                      className="dark:stroke-slate-700"
                    />
                    <PolarAngleAxis 
                      dataKey="metric" 
                      tick={{ 
                        fill: '#64748b', 
                        fontSize: 12,
                        fontWeight: 500,
                      }}
                      tickLine={false}
                      className="dark:fill-slate-400"
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={{ fill: '#94a3b8', fontSize: 10 }}
                      tickCount={5}
                      axisLine={false}
                      className="dark:fill-slate-500"
                    />
                    <Radar
                      name="Perfil"
                      dataKey="value"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="url(#behaviorGradient)"
                      fillOpacity={0.6}
                      filter="url(#glow)"
                      dot={{
                        r: 4,
                        fill: '#8b5cf6',
                        stroke: '#fff',
                        strokeWidth: 2,
                      }}
                      activeDot={{
                        r: 6,
                        fill: '#7c3aed',
                        stroke: '#fff',
                        strokeWidth: 2,
                      }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255,255,255,0.95)', 
                        backdropFilter: 'blur(8px)',
                        border: '1px solid #e2e8f0',
                        borderRadius: '12px',
                        padding: '8px 12px',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                      }}
                      formatter={(value: number | undefined) => [
                        <span key="value" className="font-semibold text-purple-600">
                          {value ?? 0}%
                        </span>,
                        'Pontuação'
                      ]}
                      labelStyle={{ fontWeight: 600, color: '#1e293b' }}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Métricas Detalhadas com Tendências */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-5 gap-3">
                {/* Socialização */}
                <MetricCard
                  icon={Users}
                  iconColor="text-blue-500"
                  bgColor="bg-blue-50 dark:bg-blue-950/30"
                  label="Social"
                  value={behaviorMetrics.socialization.average}
                  trend={behaviorMetrics.socialization.trend}
                  trendValue={behaviorMetrics.socialization.trendValue}
                  statusLabel={behaviorMetrics.socialization.label}
                  statusColor={behaviorMetrics.socialization.color}
                />
                
                {/* Obediência */}
                <MetricCard
                  icon={GraduationCap}
                  iconColor="text-green-500"
                  bgColor="bg-green-50 dark:bg-green-950/30"
                  label="Obediência"
                  value={behaviorMetrics.obedience.average}
                  trend={behaviorMetrics.obedience.trend}
                  trendValue={behaviorMetrics.obedience.trendValue}
                  statusLabel={behaviorMetrics.obedience.label}
                  statusColor={behaviorMetrics.obedience.color}
                />
                
                {/* Energia */}
                <MetricCard
                  icon={Zap}
                  iconColor="text-orange-500"
                  bgColor="bg-orange-50 dark:bg-orange-950/30"
                  label="Energia"
                  value={behaviorMetrics.energy.average}
                  trend={behaviorMetrics.energy.trend}
                  trendValue={behaviorMetrics.energy.trendValue}
                  statusLabel={behaviorMetrics.energy.label}
                  statusColor={behaviorMetrics.energy.color}
                />
                
                {/* Calma */}
                <MetricCard
                  icon={Shield}
                  iconColor="text-cyan-500"
                  bgColor="bg-cyan-50 dark:bg-cyan-950/30"
                  label="Calma"
                  value={behaviorMetrics.calmness.average}
                  trend={behaviorMetrics.calmness.trend}
                  trendValue={behaviorMetrics.calmness.trendValue}
                  statusLabel={behaviorMetrics.calmness.label}
                  statusColor={behaviorMetrics.calmness.color}
                />
                
                {/* Docilidade */}
                <MetricCard
                  icon={Heart}
                  iconColor="text-pink-500"
                  bgColor="bg-pink-50 dark:bg-pink-950/30"
                  label="Docilidade"
                  value={behaviorMetrics.docility.average}
                  trend={behaviorMetrics.docility.trend}
                  trendValue={behaviorMetrics.docility.trendValue}
                  statusLabel={behaviorMetrics.docility.label}
                  statusColor={behaviorMetrics.docility.color}
                />
              </div>

              {/* Dica de Inteligência */}
              {hasEnoughData && (
                <div className="mt-4 p-3 rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border border-purple-100 dark:border-purple-900/30">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div className="text-sm text-purple-700 dark:text-purple-300">
                      <span className="font-medium">Insight: </span>
                      {overallScore.description}
                      {behaviorMetrics.socialization.trend === "up" && " A socialização está melhorando!"}
                      {behaviorMetrics.calmness.trend === "up" && " O pet está ficando mais tranquilo."}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Últimos Registros de Comportamento */}
          {recentBehavior.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <ClipboardList className="h-5 w-5 text-green-500" />
                  Últimos Registros
                </CardTitle>
                <CardDescription>
                  Registros de comportamento recentes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentBehavior.map((log: any, idx: number) => (
                    <div key={log.id || idx} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="text-xs text-muted-foreground">
                          {new Date(log.logDate).toLocaleDateString("pt-BR", {
                            day: "2-digit",
                            month: "short"
                          })}
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {log.socialization && (
                            <Badge variant="outline" className="text-xs">
                              <Users className="h-3 w-3 mr-1" />
                              {log.socialization === "excellent" ? "Excelente" :
                               log.socialization === "good" ? "Bom" :
                               log.socialization === "moderate" ? "Moderado" : "Ruim"}
                            </Badge>
                          )}
                          {log.energy && (
                            <Badge variant="outline" className="text-xs">
                              <Zap className="h-3 w-3 mr-1" />
                              {log.energy === "high" ? "Alta" :
                               log.energy === "normal" ? "Normal" : "Baixa"}
                            </Badge>
                          )}
                          {log.anxiety && log.anxiety !== "none" && (
                            <Badge variant="outline" className="text-xs text-amber-600">
                              <Frown className="h-3 w-3 mr-1" />
                              {log.anxiety === "mild" ? "Leve" :
                               log.anxiety === "moderate" ? "Moderada" : "Severa"}
                            </Badge>
                          )}
                        </div>
                      </div>
                      {log.notes && (
                        <p className="text-xs text-muted-foreground max-w-[200px] truncate">
                          {log.notes}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {pet.notes && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <FileText className="h-5 w-5" />
                  Observações
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm whitespace-pre-wrap">{pet.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Créditos */}
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Coins className="h-5 w-5 text-primary" />
                Créditos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-primary">{pet.credits}</div>
              <p className="text-sm text-muted-foreground">dias de creche</p>
              <Separator className="my-4" />
              <Button asChild className="w-full">
                <Link href="/tutor/credits">Comprar Créditos</Link>
              </Button>
            </CardContent>
          </Card>

          {/* Ações Rápidas */}
          <Card>
            <CardHeader>
              <CardTitle>Ações Rápidas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/tutor/bookings">
                  <Clock className="h-4 w-4 mr-2" />
                  Fazer Reserva
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/tutor/calendar">
                  <Calendar className="h-4 w-4 mr-2" />
                  Ver Calendário
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Gestão de Saúde */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Heart className="h-5 w-5 text-red-500" />
                Saúde & Cuidados
              </CardTitle>
              <CardDescription>Acompanhe todos os registros</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/tutor/vaccines">
                  <Syringe className="h-4 w-4 mr-2 text-blue-500" />
                  Vacinas
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/tutor/medications">
                  <Pill className="h-4 w-4 mr-2 text-purple-500" />
                  Medicamentos
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/tutor/training">
                  <GraduationCap className="h-4 w-4 mr-2 text-orange-500" />
                  Treinamento
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/tutor/logs">
                  <ClipboardList className="h-4 w-4 mr-2 text-green-500" />
                  Logs Diários
                </Link>
              </Button>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/tutor/documents">
                  <FolderOpen className="h-4 w-4 mr-2 text-amber-500" />
                  Documentos
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Comunicação */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-primary" />
                Comunicação
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button variant="outline" className="w-full justify-start" asChild>
                <Link href="/tutor/wall">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Ver Mural
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Info do Cadastro */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Informações</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground space-y-2">
              <div className="flex justify-between">
                <span>Cadastrado em</span>
                <span>{formatDate(pet.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span>Última atualização</span>
                <span>{formatDate(pet.updatedAt)}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
