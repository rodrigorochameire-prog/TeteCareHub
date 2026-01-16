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
  CalendarDays,
  Weight,
  Utensils,
  UtensilsCrossed,
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
  Info,
  Droplets,
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
// SISTEMA DE PONTUAÇÃO INTELIGENTE AVANÇADO
// Combina: Perfil do Pet + Behavior Logs + Daily Logs
// ==========================================

// Mapeamento do perfil do pet (cadastro) para scores base
const profileScoreMapping = {
  // Sociabilidade com cães (do cadastro)
  dogSociability: {
    social: { score: 90, label: "Muito Sociável" },
    selective: { score: 65, label: "Seletivo" },
    reactive: { score: 35, label: "Reativo" },
    antisocial: { score: 15, label: "Reservado" },
  },
  // Sociabilidade com humanos
  humanSociability: {
    friendly: { score: 90, label: "Amigável" },
    cautious: { score: 60, label: "Cauteloso" },
    fearful: { score: 35, label: "Medroso" },
    reactive: { score: 20, label: "Reativo" },
  },
  // Nível de energia do cadastro
  energyLevel: {
    very_low: { score: 20, label: "Muito Baixa" },
    low: { score: 40, label: "Baixa" },
    medium: { score: 60, label: "Média" },
    high: { score: 80, label: "Alta" },
    very_high: { score: 95, label: "Muito Alta" },
  },
  // Ansiedade de separação
  anxietySeparation: {
    none: { score: 95, label: "Tranquilo" },
    mild: { score: 70, label: "Leve" },
    moderate: { score: 45, label: "Moderada" },
    severe: { score: 20, label: "Severa" },
  },
  // Níveis de confiança/impulsividade (1-5 no cadastro)
  confidenceLevel: { 1: 20, 2: 40, 3: 60, 4: 80, 5: 95 },
  impulsivityLevel: { 1: 95, 2: 75, 3: 55, 4: 35, 5: 15 }, // Invertido (menos impulsivo = melhor para "calma")
  resilienceLevel: { 1: 20, 2: 40, 3: 60, 4: 80, 5: 95 },
};

// Mapeamento dos behavior logs (observações diárias)
const behaviorScoreMapping = {
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
    very_low: { score: 15, label: "Muito Baixa", color: "text-slate-600" },
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

// Mapeamento dos daily logs (humor, apetite, etc.)
const dailyLogScoreMapping = {
  mood: {
    happy: 95, playful: 90, calm: 85, 
    tired: 50, anxious: 35, agitated: 30,
    fearful: 25, aggressive: 15, apathetic: 20, sick: 10,
  },
  appetite: {
    excellent: 95, good: 80, moderate: 60, poor: 35, none: 10, stimulated: 70,
  },
  energy: {
    high: 85, normal: 65, low: 40, very_low: 20,
  },
};

// Tipo para resultado de métrica
interface MetricResult {
  value: number;
  label: string;
  color: string;
  trend: "up" | "down" | "stable";
  trendValue: number;
  source: "profile" | "observations" | "hybrid" | "none";
  confidence: "high" | "medium" | "low";
  dataPoints: number;
}

// Função principal: Calcula métrica híbrida (perfil + observações)
function calculateHybridMetric(
  pet: any,
  behaviorLogs: any[],
  dailyLogs: any[],
  metricType: "socialization" | "obedience" | "energy" | "calmness" | "docility"
): MetricResult {
  const emptyResult: MetricResult = {
    value: 0,
    label: "Sem dados",
    color: "text-muted-foreground",
    trend: "stable",
    trendValue: 0,
    source: "none",
    confidence: "low",
    dataPoints: 0,
  };

  // Coletar scores de diferentes fontes
  const scores: { value: number; weight: number; source: string }[] = [];
  
  // 1. DADOS DO PERFIL (cadastro) - peso base
  switch (metricType) {
    case "socialization":
      if (pet.dogSociability && profileScoreMapping.dogSociability[pet.dogSociability as keyof typeof profileScoreMapping.dogSociability]) {
        scores.push({ 
          value: profileScoreMapping.dogSociability[pet.dogSociability as keyof typeof profileScoreMapping.dogSociability].score, 
          weight: 0.3, 
          source: "profile" 
        });
      }
      if (pet.humanSociability && profileScoreMapping.humanSociability[pet.humanSociability as keyof typeof profileScoreMapping.humanSociability]) {
        scores.push({ 
          value: profileScoreMapping.humanSociability[pet.humanSociability as keyof typeof profileScoreMapping.humanSociability].score, 
          weight: 0.2, 
          source: "profile" 
        });
      }
      break;
      
    case "energy":
      if (pet.energyLevel && profileScoreMapping.energyLevel[pet.energyLevel as keyof typeof profileScoreMapping.energyLevel]) {
        scores.push({ 
          value: profileScoreMapping.energyLevel[pet.energyLevel as keyof typeof profileScoreMapping.energyLevel].score, 
          weight: 0.3, 
          source: "profile" 
        });
      }
      break;
      
    case "calmness":
      if (pet.anxietySeparation && profileScoreMapping.anxietySeparation[pet.anxietySeparation as keyof typeof profileScoreMapping.anxietySeparation]) {
        scores.push({ 
          value: profileScoreMapping.anxietySeparation[pet.anxietySeparation as keyof typeof profileScoreMapping.anxietySeparation].score, 
          weight: 0.3, 
          source: "profile" 
        });
      }
      if (pet.impulsivityLevel && profileScoreMapping.impulsivityLevel[pet.impulsivityLevel as keyof typeof profileScoreMapping.impulsivityLevel]) {
        scores.push({ 
          value: profileScoreMapping.impulsivityLevel[pet.impulsivityLevel as keyof typeof profileScoreMapping.impulsivityLevel], 
          weight: 0.2, 
          source: "profile" 
        });
      }
      break;
      
    case "docility":
      if (pet.confidenceLevel && profileScoreMapping.confidenceLevel[pet.confidenceLevel as keyof typeof profileScoreMapping.confidenceLevel]) {
        scores.push({ 
          value: profileScoreMapping.confidenceLevel[pet.confidenceLevel as keyof typeof profileScoreMapping.confidenceLevel], 
          weight: 0.2, 
          source: "profile" 
        });
      }
      if (pet.correctionSensitivity) {
        const sensitivityScore = pet.correctionSensitivity === "high" ? 85 : pet.correctionSensitivity === "medium" ? 65 : 45;
        scores.push({ value: sensitivityScore, weight: 0.2, source: "profile" });
      }
      break;
      
    case "obedience":
      // Obediência vem principalmente das observações, não do perfil
      break;
  }

  // 2. BEHAVIOR LOGS (observações de comportamento) - peso alto
  if (behaviorLogs && behaviorLogs.length > 0) {
    const fieldMap: Record<string, string> = {
      socialization: "socialization",
      obedience: "obedience",
      energy: "energy",
      calmness: "anxiety",
      docility: "aggression",
    };
    
    const field = fieldMap[metricType];
    const mapping = behaviorScoreMapping[field as keyof typeof behaviorScoreMapping];
    
    if (mapping) {
      const recentLogs = behaviorLogs.slice(0, 10); // Últimos 10
      const validScores = recentLogs
        .filter((log: any) => log[field] && mapping[log[field] as keyof typeof mapping])
        .map((log: any) => mapping[log[field] as keyof typeof mapping].score);
      
      if (validScores.length > 0) {
        const avg = validScores.reduce((a: number, b: number) => a + b, 0) / validScores.length;
        // Peso maior para observações recentes
        const weight = Math.min(0.5, 0.1 * validScores.length);
        scores.push({ value: avg, weight, source: "behavior" });
      }
    }
  }

  // 3. DAILY LOGS (logs diários) - peso médio
  if (dailyLogs && dailyLogs.length > 0) {
    const recentDailyLogs = dailyLogs.slice(0, 7); // Última semana
    
    if (metricType === "energy") {
      const energyScores = recentDailyLogs
        .filter((log: any) => log.energy && dailyLogScoreMapping.energy[log.energy as keyof typeof dailyLogScoreMapping.energy])
        .map((log: any) => dailyLogScoreMapping.energy[log.energy as keyof typeof dailyLogScoreMapping.energy]);
      
      if (energyScores.length > 0) {
        const avg = energyScores.reduce((a: number, b: number) => a + b, 0) / energyScores.length;
        scores.push({ value: avg, weight: 0.3, source: "daily" });
      }
    }
    
    if (metricType === "calmness" || metricType === "socialization") {
      const moodScores = recentDailyLogs
        .filter((log: any) => log.mood && dailyLogScoreMapping.mood[log.mood as keyof typeof dailyLogScoreMapping.mood])
        .map((log: any) => dailyLogScoreMapping.mood[log.mood as keyof typeof dailyLogScoreMapping.mood]);
      
      if (moodScores.length > 0) {
        const avg = moodScores.reduce((a: number, b: number) => a + b, 0) / moodScores.length;
        scores.push({ value: avg, weight: 0.2, source: "daily" });
      }
    }
  }

  // Se não há dados, retorna vazio
  if (scores.length === 0) {
    return emptyResult;
  }

  // Calcular média ponderada
  const totalWeight = scores.reduce((a, s) => a + s.weight, 0);
  const weightedAvg = Math.round(scores.reduce((a, s) => a + (s.value * s.weight), 0) / totalWeight);
  
  // Determinar fonte principal
  const hasBehaviorData = scores.some(s => s.source === "behavior");
  const hasProfileData = scores.some(s => s.source === "profile");
  const hasDailyData = scores.some(s => s.source === "daily");
  
  let source: MetricResult["source"] = "none";
  if (hasBehaviorData && hasProfileData) source = "hybrid";
  else if (hasBehaviorData || hasDailyData) source = "observations";
  else if (hasProfileData) source = "profile";

  // Determinar confiança baseada na quantidade de dados
  const dataPoints = (behaviorLogs?.length || 0) + (dailyLogs?.length || 0);
  let confidence: MetricResult["confidence"] = "low";
  if (dataPoints >= 10) confidence = "high";
  else if (dataPoints >= 3) confidence = "medium";

  // Calcular tendência (apenas se houver behavior logs suficientes)
  let trend: MetricResult["trend"] = "stable";
  let trendValue = 0;
  
  if (behaviorLogs && behaviorLogs.length >= 4) {
    const fieldMap: Record<string, string> = {
      socialization: "socialization",
      obedience: "obedience",
      energy: "energy",
      calmness: "anxiety",
      docility: "aggression",
    };
    const field = fieldMap[metricType];
    const mapping = behaviorScoreMapping[field as keyof typeof behaviorScoreMapping];
    
    if (mapping) {
      const allScores = behaviorLogs
        .filter((log: any) => log[field] && mapping[log[field] as keyof typeof mapping])
        .map((log: any) => mapping[log[field] as keyof typeof mapping].score);
      
      if (allScores.length >= 4) {
        const half = Math.floor(allScores.length / 2);
        const recentAvg = allScores.slice(0, half).reduce((a: number, b: number) => a + b, 0) / half;
        const olderAvg = allScores.slice(half).reduce((a: number, b: number) => a + b, 0) / (allScores.length - half);
        
        trendValue = Math.round(recentAvg - olderAvg);
        if (trendValue > 5) trend = "up";
        else if (trendValue < -5) trend = "down";
      }
    }
  }

  // Determinar label e cor baseado no valor
  let label = "Bom";
  let color = "text-green-600";
  
  if (weightedAvg >= 85) { label = "Excelente"; color = "text-emerald-600"; }
  else if (weightedAvg >= 70) { label = "Muito Bom"; color = "text-green-600"; }
  else if (weightedAvg >= 55) { label = "Bom"; color = "text-lime-600"; }
  else if (weightedAvg >= 40) { label = "Moderado"; color = "text-amber-600"; }
  else if (weightedAvg >= 25) { label = "Atenção"; color = "text-orange-600"; }
  else { label = "Crítico"; color = "text-red-600"; }

  return {
    value: weightedAvg,
    label,
    color,
    trend,
    trendValue: Math.abs(trendValue),
    source,
    confidence,
    dataPoints,
  };
}

// Função para calcular "Perfil Geral" (score composto) com insights
function calculateOverallScore(
  metrics: { value: number; confidence: string }[],
  pet: any
): {
  score: number;
  level: string;
  emoji: string;
  description: string;
  insights: string[];
} {
  const validMetrics = metrics.filter(m => m.value > 0);
  if (validMetrics.length === 0) {
    return { 
      score: 0, 
      level: "Sem dados", 
      emoji: "📊", 
      description: "Registre observações para ver o perfil",
      insights: ["Adicione registros de comportamento para análise completa"],
    };
  }

  const score = Math.round(validMetrics.reduce((a, m) => a + m.value, 0) / validMetrics.length);
  const insights: string[] = [];
  
  // Gerar insights baseados nos dados
  if (pet.fearTriggers && pet.fearTriggers.length > 0) {
    insights.push(`Tem ${pet.fearTriggers.length} gatilho(s) de medo identificados`);
  }
  if (pet.convivenceRestrictions && pet.convivenceRestrictions.length > 0) {
    insights.push(`Possui restrições de convivência`);
  }
  if (pet.playStyle) {
    const playStyles: Record<string, string> = {
      wrestling: "Gosta de brincadeiras físicas",
      chase: "Adora correr e perseguir",
      independent: "Prefere brincar sozinho",
      observer: "Gosta de observar",
    };
    if (playStyles[pet.playStyle]) insights.push(playStyles[pet.playStyle]);
  }

  if (score >= 85) return { score, level: "Excepcional", emoji: "🌟", description: "Comportamento exemplar!", insights };
  if (score >= 70) return { score, level: "Muito Bom", emoji: "😊", description: "Ótima adaptação na creche", insights };
  if (score >= 55) return { score, level: "Bom", emoji: "👍", description: "Desenvolvimento positivo", insights };
  if (score >= 40) return { score, level: "Em Progresso", emoji: "📈", description: "Evoluindo gradualmente", insights };
  return { score, level: "Atenção", emoji: "💪", description: "Trabalhando para melhorar", insights };
}

// ==========================================
// MÉTRICAS CONCRETAS E MENSURÁVEIS
// ==========================================

interface ConcreteMetric {
  value: number;
  unit: string;
  label: string;
  trend: "up" | "down" | "stable";
  trendLabel: string;
  status: "excellent" | "good" | "warning" | "alert";
  description: string;
}

// Frequência na Creche (baseado em check-ins do calendário)
function calculateAttendanceMetrics(events: any[]): {
  thisMonth: number;
  lastMonth: number;
  trend: "up" | "down" | "stable";
  avgPerWeek: number;
  totalVisits: number;
} {
  if (!events || events.length === 0) {
    return { thisMonth: 0, lastMonth: 0, trend: "stable", avgPerWeek: 0, totalVisits: 0 };
  }

  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

  const checkins = events.filter((e: any) => e.eventType === "checkin");
  
  const thisMonthCount = checkins.filter((e: any) => 
    new Date(e.eventDate) >= thisMonthStart
  ).length;
  
  const lastMonthCount = checkins.filter((e: any) => {
    const date = new Date(e.eventDate);
    return date >= lastMonthStart && date <= lastMonthEnd;
  }).length;

  // Média por semana (últimos 30 dias)
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last30Days = checkins.filter((e: any) => new Date(e.eventDate) >= thirtyDaysAgo).length;
  const avgPerWeek = Math.round((last30Days / 4.3) * 10) / 10;

  let trend: "up" | "down" | "stable" = "stable";
  if (thisMonthCount > lastMonthCount) trend = "up";
  else if (thisMonthCount < lastMonthCount) trend = "down";

  return {
    thisMonth: thisMonthCount,
    lastMonth: lastMonthCount,
    trend,
    avgPerWeek,
    totalVisits: checkins.length,
  };
}

// Saúde Alimentar (baseado em appetite dos daily logs)
function calculateFeedingHealth(dailyLogs: any[]): ConcreteMetric {
  if (!dailyLogs || dailyLogs.length === 0) {
    return {
      value: 0,
      unit: "%",
      label: "Sem dados",
      trend: "stable",
      trendLabel: "",
      status: "warning",
      description: "Registre logs para analisar",
    };
  }

  const appetiteScores: Record<string, number> = {
    excellent: 100, good: 85, moderate: 60, stimulated: 70, poor: 30, none: 0,
  };

  const recentLogs = dailyLogs.slice(0, 14); // Últimas 2 semanas
  const olderLogs = dailyLogs.slice(14, 28);

  const validRecent = recentLogs.filter((l: any) => l.appetite && appetiteScores[l.appetite] !== undefined);
  const validOlder = olderLogs.filter((l: any) => l.appetite && appetiteScores[l.appetite] !== undefined);

  if (validRecent.length === 0) {
    return {
      value: 0,
      unit: "%",
      label: "Sem dados",
      trend: "stable",
      trendLabel: "",
      status: "warning",
      description: "Sem registros de apetite",
    };
  }

  const recentAvg = Math.round(
    validRecent.reduce((a: number, l: any) => a + appetiteScores[l.appetite], 0) / validRecent.length
  );

  let trend: "up" | "down" | "stable" = "stable";
  let trendLabel = "";
  
  if (validOlder.length > 0) {
    const olderAvg = validOlder.reduce((a: number, l: any) => a + appetiteScores[l.appetite], 0) / validOlder.length;
    const diff = recentAvg - olderAvg;
    if (diff > 5) { trend = "up"; trendLabel = `+${Math.round(diff)}%`; }
    else if (diff < -5) { trend = "down"; trendLabel = `${Math.round(diff)}%`; }
  }

  let status: ConcreteMetric["status"] = "good";
  let label = "Bom";
  if (recentAvg >= 85) { status = "excellent"; label = "Excelente"; }
  else if (recentAvg >= 60) { status = "good"; label = "Bom"; }
  else if (recentAvg >= 40) { status = "warning"; label = "Atenção"; }
  else { status = "alert"; label = "Crítico"; }

  return {
    value: recentAvg,
    unit: "%",
    label,
    trend,
    trendLabel,
    status,
    description: `Baseado em ${validRecent.length} registros`,
  };
}

// Saúde Intestinal (baseado em stool/stoolQuality dos daily logs)
function calculateDigestiveHealth(dailyLogs: any[]): ConcreteMetric {
  if (!dailyLogs || dailyLogs.length === 0) {
    return {
      value: 0,
      unit: "%",
      label: "Sem dados",
      trend: "stable",
      trendLabel: "",
      status: "warning",
      description: "Registre logs para analisar",
    };
  }

  // Scores para qualidade das fezes
  const stoolScores: Record<string, number> = {
    normal: 100, type_3: 90, type_5: 80,
    soft: 60, type_6: 50, hard: 50, type_1: 40,
    diarrhea: 20, type_7: 15, mucus: 10, bloody: 0, blood: 0, none: 70,
  };

  const recentLogs = dailyLogs.slice(0, 14);
  const validLogs = recentLogs.filter((l: any) => 
    (l.stool && stoolScores[l.stool] !== undefined) ||
    (l.stoolQuality && stoolScores[l.stoolQuality] !== undefined)
  );

  if (validLogs.length === 0) {
    return {
      value: 0,
      unit: "%",
      label: "Sem dados",
      trend: "stable",
      trendLabel: "",
      status: "warning",
      description: "Sem registros intestinais",
    };
  }

  const avg = Math.round(
    validLogs.reduce((a: number, l: any) => {
      const score = stoolScores[l.stoolQuality] ?? stoolScores[l.stool] ?? 70;
      return a + score;
    }, 0) / validLogs.length
  );

  // Contar problemas
  const problems = validLogs.filter((l: any) => {
    const val = l.stoolQuality || l.stool;
    return ["diarrhea", "type_7", "bloody", "blood", "mucus"].includes(val);
  }).length;

  let status: ConcreteMetric["status"] = "good";
  let label = "Normal";
  if (avg >= 85 && problems === 0) { status = "excellent"; label = "Excelente"; }
  else if (avg >= 60) { status = "good"; label = "Normal"; }
  else if (avg >= 40) { status = "warning"; label = "Atenção"; }
  else { status = "alert"; label = "Consultar Vet"; }

  return {
    value: avg,
    unit: "%",
    label,
    trend: problems > 0 ? "down" : "stable",
    trendLabel: problems > 0 ? `${problems} ocorrência(s)` : "",
    status,
    description: `${validLogs.length} registros analisados`,
  };
}

// Estabilidade Emocional (variação do humor)
function calculateEmotionalStability(dailyLogs: any[]): ConcreteMetric {
  if (!dailyLogs || dailyLogs.length < 3) {
    return {
      value: 0,
      unit: "%",
      label: "Dados insuficientes",
      trend: "stable",
      trendLabel: "",
      status: "warning",
      description: "Mínimo 3 registros",
    };
  }

  const moodScores: Record<string, number> = {
    happy: 100, playful: 95, calm: 90,
    tired: 50, anxious: 35, agitated: 30,
    fearful: 25, aggressive: 15, apathetic: 20, sick: 10,
  };

  const validLogs = dailyLogs.filter((l: any) => l.mood && moodScores[l.mood] !== undefined).slice(0, 14);
  
  if (validLogs.length < 3) {
    return {
      value: 0,
      unit: "%",
      label: "Dados insuficientes",
      trend: "stable",
      trendLabel: "",
      status: "warning",
      description: "Mínimo 3 registros de humor",
    };
  }

  const scores = validLogs.map((l: any) => moodScores[l.mood]);
  const avg = scores.reduce((a, b) => a + b, 0) / scores.length;
  
  // Calcular variância (estabilidade)
  const variance = scores.reduce((a, s) => a + Math.pow(s - avg, 2), 0) / scores.length;
  const stdDev = Math.sqrt(variance);
  
  // Converter desvio padrão em score de estabilidade (menos variação = mais estável)
  // Desvio de 0 = 100%, desvio de 40+ = 0%
  const stabilityScore = Math.max(0, Math.round(100 - (stdDev * 2.5)));

  // Contar dias "positivos" vs "negativos"
  const positiveDays = scores.filter(s => s >= 70).length;
  const negativeDays = scores.filter(s => s < 50).length;

  let status: ConcreteMetric["status"] = "good";
  let label = "Estável";
  if (stabilityScore >= 80 && avg >= 70) { status = "excellent"; label = "Muito Estável"; }
  else if (stabilityScore >= 60) { status = "good"; label = "Estável"; }
  else if (stabilityScore >= 40) { status = "warning"; label = "Variável"; }
  else { status = "alert"; label = "Instável"; }

  return {
    value: stabilityScore,
    unit: "%",
    label,
    trend: negativeDays > positiveDays ? "down" : negativeDays < positiveDays ? "up" : "stable",
    trendLabel: `${positiveDays} dias positivos`,
    status,
    description: `Média de humor: ${Math.round(avg)}%`,
  };
}

// Nível de Atividade (baseado em energy dos logs)
function calculateActivityLevel(dailyLogs: any[], behaviorLogs: any[]): ConcreteMetric {
  const energyScores: Record<string, number> = {
    high: 95, very_high: 100, normal: 70, medium: 65, low: 40, very_low: 20,
  };

  const allLogs = [
    ...(dailyLogs || []).map((l: any) => ({ energy: l.energy, date: l.logDate })),
    ...(behaviorLogs || []).map((l: any) => ({ energy: l.energy, date: l.logDate })),
  ].filter(l => l.energy && energyScores[l.energy] !== undefined);

  if (allLogs.length === 0) {
    return {
      value: 0,
      unit: "%",
      label: "Sem dados",
      trend: "stable",
      trendLabel: "",
      status: "warning",
      description: "Registre logs de energia",
    };
  }

  const recentLogs = allLogs.slice(0, 10);
  const avg = Math.round(
    recentLogs.reduce((a, l) => a + energyScores[l.energy], 0) / recentLogs.length
  );

  let status: ConcreteMetric["status"] = "good";
  let label = "Normal";
  if (avg >= 85) { status = "excellent"; label = "Alta Energia"; }
  else if (avg >= 60) { status = "good"; label = "Normal"; }
  else if (avg >= 40) { status = "warning"; label = "Baixa"; }
  else { status = "alert"; label = "Muito Baixa"; }

  return {
    value: avg,
    unit: "%",
    label,
    trend: "stable",
    trendLabel: `${recentLogs.length} registros`,
    status,
    description: label === "Alta Energia" ? "Pet muito ativo!" : 
                 label === "Normal" ? "Nível saudável" :
                 "Monitorar energia",
  };
}

// Hidratação (baseado em waterIntake dos daily logs)
function calculateHydration(dailyLogs: any[]): ConcreteMetric {
  if (!dailyLogs || dailyLogs.length === 0) {
    return {
      value: 0,
      unit: "%",
      label: "Sem dados",
      trend: "stable",
      trendLabel: "",
      status: "warning",
      description: "Registre logs para analisar",
    };
  }

  const hydrationScores: Record<string, number> = {
    normal: 100, increased: 80, decreased: 40, none: 10,
  };

  const validLogs = dailyLogs.filter((l: any) => l.waterIntake && hydrationScores[l.waterIntake] !== undefined).slice(0, 14);

  if (validLogs.length === 0) {
    return {
      value: 0,
      unit: "%",
      label: "Sem dados",
      trend: "stable",
      trendLabel: "",
      status: "warning",
      description: "Sem registros de hidratação",
    };
  }

  const avg = Math.round(
    validLogs.reduce((a: number, l: any) => a + hydrationScores[l.waterIntake], 0) / validLogs.length
  );

  // Contar dias com problema
  const problemDays = validLogs.filter((l: any) => 
    l.waterIntake === "decreased" || l.waterIntake === "none"
  ).length;

  let status: ConcreteMetric["status"] = "good";
  let label = "Normal";
  if (avg >= 90) { status = "excellent"; label = "Excelente"; }
  else if (avg >= 70) { status = "good"; label = "Normal"; }
  else if (avg >= 50) { status = "warning"; label = "Atenção"; }
  else { status = "alert"; label = "Crítico"; }

  return {
    value: avg,
    unit: "%",
    label,
    trend: problemDays > 2 ? "down" : "stable",
    trendLabel: problemDays > 0 ? `${problemDays} dia(s) baixo` : "",
    status,
    description: `${validLogs.length} registros`,
  };
}

// Integridade Física (baseado em physicalIntegrity dos logs)
function calculatePhysicalIntegrity(dailyLogs: any[]): ConcreteMetric {
  if (!dailyLogs || dailyLogs.length === 0) {
    return {
      value: 100,
      unit: "%",
      label: "Sem registros",
      trend: "stable",
      trendLabel: "",
      status: "good",
      description: "Nenhum problema registrado",
    };
  }

  const integrityScores: Record<string, number> = {
    perfect: 100, minor_scratch: 80, bite_mark: 50, limping: 40,
    skin_issue: 60, ear_issue: 60, injury: 20, none: 100,
  };

  const validLogs = dailyLogs.filter((l: any) => 
    l.physicalIntegrity && integrityScores[l.physicalIntegrity] !== undefined
  ).slice(0, 14);

  if (validLogs.length === 0) {
    return {
      value: 100,
      unit: "%",
      label: "OK",
      trend: "stable",
      trendLabel: "",
      status: "excellent",
      description: "Sem problemas reportados",
    };
  }

  const avg = Math.round(
    validLogs.reduce((a: number, l: any) => a + integrityScores[l.physicalIntegrity], 0) / validLogs.length
  );

  // Identificar problemas
  const issues = validLogs.filter((l: any) => 
    l.physicalIntegrity && l.physicalIntegrity !== "perfect" && l.physicalIntegrity !== "none"
  );

  let status: ConcreteMetric["status"] = "excellent";
  let label = "Perfeito";
  if (avg >= 90) { status = "excellent"; label = "Perfeito"; }
  else if (avg >= 70) { status = "good"; label = "Bom"; }
  else if (avg >= 50) { status = "warning"; label = "Atenção"; }
  else { status = "alert"; label = "Crítico"; }

  return {
    value: avg,
    unit: "%",
    label,
    trend: issues.length > 2 ? "down" : "stable",
    trendLabel: issues.length > 0 ? `${issues.length} ocorrência(s)` : "",
    status,
    description: issues.length > 0 ? `Último: ${issues[0]?.physicalIntegrity}` : "Sem problemas",
  };
}

// Tempo Médio na Creche (baseado em eventos de check-in/out)
function calculateAverageStayTime(events: any[]): {
  avgHours: number;
  lastStayHours: number | null;
  longestStayHours: number;
  totalDays: number;
} {
  if (!events || events.length === 0) {
    return { avgHours: 0, lastStayHours: null, longestStayHours: 0, totalDays: 0 };
  }

  // Encontrar pares de check-in/check-out
  const checkins = events.filter((e: any) => e.eventType === "checkin")
    .sort((a: any, b: any) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());
  const checkouts = events.filter((e: any) => e.eventType === "checkout")
    .sort((a: any, b: any) => new Date(b.eventDate).getTime() - new Date(a.eventDate).getTime());

  const stayDurations: number[] = [];

  // Calcular durações (simplificado - assume checkout após checkin no mesmo dia)
  for (const checkout of checkouts) {
    const checkoutDate = new Date(checkout.eventDate);
    // Procurar checkin mais recente antes deste checkout
    const matchingCheckin = checkins.find((ci: any) => {
      const ciDate = new Date(ci.eventDate);
      return ciDate < checkoutDate && 
             ciDate.toDateString() === checkoutDate.toDateString();
    });

    if (matchingCheckin) {
      const duration = (checkoutDate.getTime() - new Date(matchingCheckin.eventDate).getTime()) / (1000 * 60 * 60);
      if (duration > 0 && duration < 24) { // Validação de sanidade
        stayDurations.push(duration);
      }
    }
  }

  if (stayDurations.length === 0) {
    return { avgHours: 0, lastStayHours: null, longestStayHours: 0, totalDays: checkins.length };
  }

  const avgHours = Math.round((stayDurations.reduce((a, b) => a + b, 0) / stayDurations.length) * 10) / 10;
  const longestStayHours = Math.round(Math.max(...stayDurations) * 10) / 10;
  const lastStayHours = Math.round(stayDurations[0] * 10) / 10;

  return {
    avgHours,
    lastStayHours,
    longestStayHours,
    totalDays: checkins.length,
  };
}

// Métricas Financeiras (créditos)
function calculateCreditMetrics(pet: any, events: any[]): {
  currentCredits: number;
  usedThisMonth: number;
  avgPerWeek: number;
  status: ConcreteMetric["status"];
  daysRemaining: number | null;
} {
  const currentCredits = pet.credits || 0;
  
  // Calcular uso no mês atual
  const now = new Date();
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  
  const thisMonthCheckins = (events || []).filter((e: any) => 
    e.eventType === "checkin" && new Date(e.eventDate) >= thisMonthStart
  ).length;

  // Assumir 1 crédito por check-in para cálculo
  const usedThisMonth = thisMonthCheckins;

  // Média por semana nos últimos 30 dias
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const last30DaysCheckins = (events || []).filter((e: any) => 
    e.eventType === "checkin" && new Date(e.eventDate) >= thirtyDaysAgo
  ).length;
  const avgPerWeek = Math.round((last30DaysCheckins / 4.3) * 10) / 10;

  // Status baseado em créditos
  let status: ConcreteMetric["status"] = "excellent";
  if (currentCredits <= 0) status = "alert";
  else if (currentCredits <= 2) status = "warning";
  else if (currentCredits <= 5) status = "good";

  // Dias restantes estimados
  const daysRemaining = avgPerWeek > 0 
    ? Math.round((currentCredits / avgPerWeek) * 7)
    : null;

  return {
    currentCredits,
    usedThisMonth,
    avgPerWeek,
    status,
    daysRemaining,
  };
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
      "relative p-2 sm:p-3 rounded-lg sm:rounded-xl border transition-all duration-300",
      "hover:shadow-md hover:-translate-y-0.5",
      bgColor,
      "border-slate-200/50 dark:border-slate-700/50"
    )}>
      {/* Header compacto */}
      <div className="flex items-center justify-center sm:justify-start gap-1.5 mb-1 sm:mb-2">
        <Icon className={cn("h-3.5 w-3.5 sm:h-4 sm:w-4", iconColor)} />
        <span className="text-[10px] sm:text-xs font-medium text-slate-600 dark:text-slate-400 truncate">
          {label}
        </span>
      </div>
      
      {/* Valor centralizado no mobile */}
      <div className="text-center sm:text-left">
        <div className="text-lg sm:text-xl font-bold text-slate-800 dark:text-slate-200">
          {value > 0 ? `${value}%` : "—"}
        </div>
        
        {/* Status e Tendência */}
        <div className="flex items-center justify-center sm:justify-between gap-1 mt-0.5">
          <span className={cn("text-[9px] sm:text-[10px] font-medium truncate", statusColor)}>
            {statusLabel}
          </span>
          
          {/* Indicador de Tendência - Só no desktop */}
          {value > 0 && trendValue > 0 && (
            <div className={cn(
              "hidden sm:flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-full",
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

  // Buscar daily logs para enriquecer as métricas
  const { data: dailyLogs } = trpc.logs.byPet.useQuery(
    { petId, limit: 30 },
    { enabled: !!pet, staleTime: 5 * 60 * 1000 }
  );

  // Buscar eventos do calendário para métricas de frequência
  const { data: calendarEvents } = trpc.calendar.byPet.useQuery(
    { petId },
    { enabled: !!pet, staleTime: 5 * 60 * 1000 }
  );

  // ========================================
  // MÉTRICAS CONCRETAS E MENSURÁVEIS
  // ========================================

  // Frequência na Creche
  const attendanceMetrics = useMemo(() => {
    return calculateAttendanceMetrics(calendarEvents || []);
  }, [calendarEvents]);

  // Saúde Alimentar
  const feedingHealth = useMemo(() => {
    return calculateFeedingHealth(dailyLogs || []);
  }, [dailyLogs]);

  // Saúde Digestiva
  const digestiveHealth = useMemo(() => {
    return calculateDigestiveHealth(dailyLogs || []);
  }, [dailyLogs]);

  // Estabilidade Emocional
  const emotionalStability = useMemo(() => {
    return calculateEmotionalStability(dailyLogs || []);
  }, [dailyLogs]);

  // Nível de Atividade
  const activityLevel = useMemo(() => {
    return calculateActivityLevel(dailyLogs || [], behaviorLogs || []);
  }, [dailyLogs, behaviorLogs]);

  // Hidratação
  const hydration = useMemo(() => {
    return calculateHydration(dailyLogs || []);
  }, [dailyLogs]);

  // Integridade Física
  const physicalIntegrity = useMemo(() => {
    return calculatePhysicalIntegrity(dailyLogs || []);
  }, [dailyLogs]);

  // Tempo Médio na Creche
  const stayTimeMetrics = useMemo(() => {
    return calculateAverageStayTime(calendarEvents || []);
  }, [calendarEvents]);

  // Métricas de Créditos
  const creditMetrics = useMemo(() => {
    return calculateCreditMetrics(pet, calendarEvents || []);
  }, [pet, calendarEvents]);

  // Calcular métricas HÍBRIDAS inteligentes
  // Combina: Perfil do Pet + Behavior Logs + Daily Logs
  const behaviorMetrics = useMemo(() => {
    if (!pet) return null;
    
    return {
      socialization: calculateHybridMetric(pet, behaviorLogs || [], dailyLogs || [], "socialization"),
      obedience: calculateHybridMetric(pet, behaviorLogs || [], dailyLogs || [], "obedience"),
      energy: calculateHybridMetric(pet, behaviorLogs || [], dailyLogs || [], "energy"),
      calmness: calculateHybridMetric(pet, behaviorLogs || [], dailyLogs || [], "calmness"),
      docility: calculateHybridMetric(pet, behaviorLogs || [], dailyLogs || [], "docility"),
    };
  }, [pet, behaviorLogs, dailyLogs]);

  // Score geral do pet com insights
  const overallScore = useMemo(() => {
    if (!behaviorMetrics || !pet) {
      return { score: 0, level: "Carregando...", emoji: "⏳", description: "", insights: [] };
    }
    
    return calculateOverallScore([
      behaviorMetrics.socialization,
      behaviorMetrics.obedience,
      behaviorMetrics.calmness,
      behaviorMetrics.docility,
    ], pet);
  }, [behaviorMetrics, pet]);

  // Dados do gráfico de radar otimizado
  const radarData = useMemo(() => {
    if (!behaviorMetrics) return [];
    
    return [
      { 
        metric: "Social", 
        value: behaviorMetrics.socialization.value,
        fullMark: 100,
      },
      { 
        metric: "Obediência", 
        value: behaviorMetrics.obedience.value,
        fullMark: 100,
      },
      { 
        metric: "Energia", 
        value: behaviorMetrics.energy.value,
        fullMark: 100,
      },
      { 
        metric: "Calma", 
        value: behaviorMetrics.calmness.value,
        fullMark: 100,
      },
      { 
        metric: "Docilidade", 
        value: behaviorMetrics.docility.value,
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

          {/* Perfil Comportamental - Versão Premium Mobile-First */}
          <Card className="overflow-hidden">
            <CardHeader className="pb-2">
              {/* Header responsivo */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                  <CardTitle className="flex items-center gap-2 text-base sm:text-lg">
                    <Brain className="h-5 w-5 text-purple-500" />
                    Perfil Comportamental
                  </CardTitle>
                  <CardDescription className="text-xs sm:text-sm">
                    {behaviorLogs?.length || 0} registros analisados
                  </CardDescription>
                </div>
                {/* Score Geral - Compacto no mobile */}
                <div className="flex items-center gap-3 sm:flex-col sm:items-center px-3 py-2 rounded-xl bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border border-purple-100 dark:border-purple-900/50">
                  <div className="text-xl sm:text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {overallScore.score > 0 ? `${overallScore.score}%` : "—"}
                  </div>
                  <div className="text-xs text-purple-600/70 dark:text-purple-400/70 flex items-center gap-1">
                    <span>{overallScore.emoji}</span>
                    <span>{overallScore.level}</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0 px-2 sm:px-6">
              {/* Gráfico de Radar - Otimizado para Mobile */}
              <div className="h-[260px] sm:h-[300px] mt-2 -mx-2 sm:mx-0">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart 
                    data={radarData} 
                    cx="50%" 
                    cy="50%" 
                    outerRadius="65%"
                    margin={{ top: 25, right: 25, bottom: 25, left: 25 }}
                  >
                    <defs>
                      <linearGradient id="behaviorGradient" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#8b5cf6" stopOpacity={0.8} />
                        <stop offset="100%" stopColor="#6366f1" stopOpacity={0.3} />
                      </linearGradient>
                    </defs>
                    <PolarGrid 
                      stroke="#e2e8f0" 
                      strokeDasharray="3 3"
                      className="dark:stroke-slate-700"
                    />
                    <PolarAngleAxis 
                      dataKey="metric" 
                      tick={({ x, y, payload }) => (
                        <text 
                          x={x} 
                          y={y} 
                          textAnchor="middle" 
                          fill="#64748b"
                          fontSize={11}
                          fontWeight={500}
                          className="dark:fill-slate-400"
                        >
                          {payload.value}
                        </text>
                      )}
                      tickLine={false}
                    />
                    <PolarRadiusAxis 
                      angle={90} 
                      domain={[0, 100]} 
                      tick={false}
                      axisLine={false}
                    />
                    <Radar
                      name="Perfil"
                      dataKey="value"
                      stroke="#8b5cf6"
                      strokeWidth={2}
                      fill="url(#behaviorGradient)"
                      fillOpacity={0.6}
                      dot={{
                        r: 4,
                        fill: '#8b5cf6',
                        stroke: '#fff',
                        strokeWidth: 2,
                      }}
                    />
                    <Tooltip 
                      contentStyle={{ 
                        backgroundColor: 'rgba(255,255,255,0.95)', 
                        border: '1px solid #e2e8f0',
                        borderRadius: '8px',
                        padding: '6px 10px',
                        fontSize: '12px',
                      }}
                      formatter={(value: number | undefined) => [`${value ?? 0}%`, 'Pontuação']}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </div>

              {/* Métricas Detalhadas - Grid Responsivo */}
              <div className="mt-3 grid grid-cols-3 sm:grid-cols-5 gap-2">
                {/* Socialização */}
                <MetricCard
                  icon={Users}
                  iconColor="text-blue-500"
                  bgColor="bg-blue-50 dark:bg-blue-950/30"
                  label="Social"
                  value={behaviorMetrics?.socialization.value || 0}
                  trend={behaviorMetrics?.socialization.trend || "stable"}
                  trendValue={behaviorMetrics?.socialization.trendValue || 0}
                  statusLabel={behaviorMetrics?.socialization.label || "—"}
                  statusColor={behaviorMetrics?.socialization.color || "text-muted-foreground"}
                />
                
                {/* Obediência */}
                <MetricCard
                  icon={GraduationCap}
                  iconColor="text-green-500"
                  bgColor="bg-green-50 dark:bg-green-950/30"
                  label="Obediência"
                  value={behaviorMetrics?.obedience.value || 0}
                  trend={behaviorMetrics?.obedience.trend || "stable"}
                  trendValue={behaviorMetrics?.obedience.trendValue || 0}
                  statusLabel={behaviorMetrics?.obedience.label || "—"}
                  statusColor={behaviorMetrics?.obedience.color || "text-muted-foreground"}
                />
                
                {/* Energia */}
                <MetricCard
                  icon={Zap}
                  iconColor="text-orange-500"
                  bgColor="bg-orange-50 dark:bg-orange-950/30"
                  label="Energia"
                  value={behaviorMetrics?.energy.value || 0}
                  trend={behaviorMetrics?.energy.trend || "stable"}
                  trendValue={behaviorMetrics?.energy.trendValue || 0}
                  statusLabel={behaviorMetrics?.energy.label || "—"}
                  statusColor={behaviorMetrics?.energy.color || "text-muted-foreground"}
                />
                
                {/* Calma */}
                <MetricCard
                  icon={Shield}
                  iconColor="text-cyan-500"
                  bgColor="bg-cyan-50 dark:bg-cyan-950/30"
                  label="Calma"
                  value={behaviorMetrics?.calmness.value || 0}
                  trend={behaviorMetrics?.calmness.trend || "stable"}
                  trendValue={behaviorMetrics?.calmness.trendValue || 0}
                  statusLabel={behaviorMetrics?.calmness.label || "—"}
                  statusColor={behaviorMetrics?.calmness.color || "text-muted-foreground"}
                />
                
                {/* Docilidade */}
                <MetricCard
                  icon={Heart}
                  iconColor="text-pink-500"
                  bgColor="bg-pink-50 dark:bg-pink-950/30"
                  label="Docilidade"
                  value={behaviorMetrics?.docility.value || 0}
                  trend={behaviorMetrics?.docility.trend || "stable"}
                  trendValue={behaviorMetrics?.docility.trendValue || 0}
                  statusLabel={behaviorMetrics?.docility.label || "—"}
                  statusColor={behaviorMetrics?.docility.color || "text-muted-foreground"}
                />
              </div>

              {/* Dica de Inteligência - Compacta no mobile */}
              {hasEnoughData && (
                <div className="mt-3 sm:mt-4 p-2.5 sm:p-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 border border-purple-100 dark:border-purple-900/30">
                  <div className="flex items-start gap-2">
                    <Sparkles className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-purple-500 mt-0.5 flex-shrink-0" />
                    <div className="text-xs sm:text-sm text-purple-700 dark:text-purple-300">
                      <span className="font-medium">Insight: </span>
                      {overallScore.description}
                      {behaviorMetrics?.socialization.trend === "up" && " Socialização melhorando!"}
                      {behaviorMetrics?.calmness.trend === "up" && " Mais tranquilo."}
                    </div>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Indicadores de Bem-estar - Métricas Concretas */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-lg bg-emerald-100 dark:bg-emerald-900/30">
                    <Activity className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">Indicadores de Bem-estar</CardTitle>
                    <CardDescription>Métricas reais e mensuráveis</CardDescription>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="grid gap-4">
                {/* Frequência na Creche */}
                <div className="p-4 rounded-xl border bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-100 dark:border-blue-900/50">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <CalendarDays className="h-5 w-5 text-blue-600" />
                      <span className="font-semibold text-blue-900 dark:text-blue-100">Frequência na Creche</span>
                    </div>
                    <div className={cn(
                      "flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full",
                      attendanceMetrics.trend === "up" && "bg-emerald-100 text-emerald-700",
                      attendanceMetrics.trend === "down" && "bg-red-100 text-red-700",
                      attendanceMetrics.trend === "stable" && "bg-slate-100 text-slate-600"
                    )}>
                      {attendanceMetrics.trend === "up" && <TrendingUp className="h-3 w-3" />}
                      {attendanceMetrics.trend === "down" && <TrendingDown className="h-3 w-3" />}
                      {attendanceMetrics.trend === "stable" && <Minus className="h-3 w-3" />}
                      <span>vs mês anterior</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="text-center p-3 bg-white/60 dark:bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-blue-600">{attendanceMetrics.thisMonth}</div>
                      <div className="text-xs text-muted-foreground">Este mês</div>
                    </div>
                    <div className="text-center p-3 bg-white/60 dark:bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-slate-600">{attendanceMetrics.lastMonth}</div>
                      <div className="text-xs text-muted-foreground">Mês passado</div>
                    </div>
                    <div className="text-center p-3 bg-white/60 dark:bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-indigo-600">{attendanceMetrics.avgPerWeek}</div>
                      <div className="text-xs text-muted-foreground">Média/semana</div>
                    </div>
                    <div className="text-center p-3 bg-white/60 dark:bg-white/5 rounded-lg">
                      <div className="text-2xl font-bold text-slate-700">{attendanceMetrics.totalVisits}</div>
                      <div className="text-xs text-muted-foreground">Total visitas</div>
                    </div>
                  </div>
                </div>

                {/* Grid de Indicadores de Saúde */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  {/* Saúde Alimentar */}
                  <div className={cn(
                    "p-4 rounded-xl border transition-all",
                    feedingHealth.status === "excellent" && "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800",
                    feedingHealth.status === "good" && "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
                    feedingHealth.status === "warning" && "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
                    feedingHealth.status === "alert" && "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <UtensilsCrossed className={cn(
                        "h-4 w-4",
                        feedingHealth.status === "excellent" && "text-emerald-600",
                        feedingHealth.status === "good" && "text-blue-600",
                        feedingHealth.status === "warning" && "text-amber-600",
                        feedingHealth.status === "alert" && "text-red-600",
                      )} />
                      <span className="text-xs font-medium text-muted-foreground">Apetite</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{feedingHealth.value > 0 ? feedingHealth.value : "—"}</span>
                      <span className="text-sm text-muted-foreground">{feedingHealth.unit}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={cn(
                        "text-xs font-medium",
                        feedingHealth.status === "excellent" && "text-emerald-600",
                        feedingHealth.status === "good" && "text-blue-600",
                        feedingHealth.status === "warning" && "text-amber-600",
                        feedingHealth.status === "alert" && "text-red-600",
                      )}>{feedingHealth.label}</span>
                      {feedingHealth.trendLabel && (
                        <span className={cn(
                          "text-[10px] flex items-center gap-0.5",
                          feedingHealth.trend === "up" && "text-emerald-600",
                          feedingHealth.trend === "down" && "text-red-600",
                        )}>
                          {feedingHealth.trend === "up" && <TrendingUp className="h-3 w-3" />}
                          {feedingHealth.trend === "down" && <TrendingDown className="h-3 w-3" />}
                          {feedingHealth.trendLabel}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Saúde Digestiva */}
                  <div className={cn(
                    "p-4 rounded-xl border transition-all",
                    digestiveHealth.status === "excellent" && "bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800",
                    digestiveHealth.status === "good" && "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
                    digestiveHealth.status === "warning" && "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
                    digestiveHealth.status === "alert" && "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <Heart className={cn(
                        "h-4 w-4",
                        digestiveHealth.status === "excellent" && "text-emerald-600",
                        digestiveHealth.status === "good" && "text-blue-600",
                        digestiveHealth.status === "warning" && "text-amber-600",
                        digestiveHealth.status === "alert" && "text-red-600",
                      )} />
                      <span className="text-xs font-medium text-muted-foreground">Digestivo</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{digestiveHealth.value > 0 ? digestiveHealth.value : "—"}</span>
                      <span className="text-sm text-muted-foreground">{digestiveHealth.unit}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={cn(
                        "text-xs font-medium",
                        digestiveHealth.status === "excellent" && "text-emerald-600",
                        digestiveHealth.status === "good" && "text-blue-600",
                        digestiveHealth.status === "warning" && "text-amber-600",
                        digestiveHealth.status === "alert" && "text-red-600",
                      )}>{digestiveHealth.label}</span>
                      {digestiveHealth.trendLabel && (
                        <span className="text-[10px] text-amber-600">{digestiveHealth.trendLabel}</span>
                      )}
                    </div>
                  </div>

                  {/* Estabilidade Emocional */}
                  <div className={cn(
                    "p-4 rounded-xl border transition-all",
                    emotionalStability.status === "excellent" && "bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800",
                    emotionalStability.status === "good" && "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
                    emotionalStability.status === "warning" && "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
                    emotionalStability.status === "alert" && "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <Brain className={cn(
                        "h-4 w-4",
                        emotionalStability.status === "excellent" && "text-purple-600",
                        emotionalStability.status === "good" && "text-blue-600",
                        emotionalStability.status === "warning" && "text-amber-600",
                        emotionalStability.status === "alert" && "text-red-600",
                      )} />
                      <span className="text-xs font-medium text-muted-foreground">Emocional</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{emotionalStability.value > 0 ? emotionalStability.value : "—"}</span>
                      <span className="text-sm text-muted-foreground">{emotionalStability.unit}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={cn(
                        "text-xs font-medium",
                        emotionalStability.status === "excellent" && "text-purple-600",
                        emotionalStability.status === "good" && "text-blue-600",
                        emotionalStability.status === "warning" && "text-amber-600",
                        emotionalStability.status === "alert" && "text-red-600",
                      )}>{emotionalStability.label}</span>
                      {emotionalStability.trendLabel && (
                        <span className="text-[10px] text-emerald-600">{emotionalStability.trendLabel}</span>
                      )}
                    </div>
                  </div>

                  {/* Nível de Atividade */}
                  <div className={cn(
                    "p-4 rounded-xl border transition-all",
                    activityLevel.status === "excellent" && "bg-orange-50 border-orange-200 dark:bg-orange-950/30 dark:border-orange-800",
                    activityLevel.status === "good" && "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
                    activityLevel.status === "warning" && "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
                    activityLevel.status === "alert" && "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className={cn(
                        "h-4 w-4",
                        activityLevel.status === "excellent" && "text-orange-600",
                        activityLevel.status === "good" && "text-blue-600",
                        activityLevel.status === "warning" && "text-amber-600",
                        activityLevel.status === "alert" && "text-red-600",
                      )} />
                      <span className="text-xs font-medium text-muted-foreground">Atividade</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{activityLevel.value > 0 ? activityLevel.value : "—"}</span>
                      <span className="text-sm text-muted-foreground">{activityLevel.unit}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={cn(
                        "text-xs font-medium",
                        activityLevel.status === "excellent" && "text-orange-600",
                        activityLevel.status === "good" && "text-blue-600",
                        activityLevel.status === "warning" && "text-amber-600",
                        activityLevel.status === "alert" && "text-red-600",
                      )}>{activityLevel.label}</span>
                      <span className="text-[10px] text-muted-foreground">{activityLevel.description}</span>
                    </div>
                  </div>

                  {/* Hidratação */}
                  <div className={cn(
                    "p-4 rounded-xl border transition-all",
                    hydration.status === "excellent" && "bg-cyan-50 border-cyan-200 dark:bg-cyan-950/30 dark:border-cyan-800",
                    hydration.status === "good" && "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
                    hydration.status === "warning" && "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
                    hydration.status === "alert" && "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <Droplets className={cn(
                        "h-4 w-4",
                        hydration.status === "excellent" && "text-cyan-600",
                        hydration.status === "good" && "text-blue-600",
                        hydration.status === "warning" && "text-amber-600",
                        hydration.status === "alert" && "text-red-600",
                      )} />
                      <span className="text-xs font-medium text-muted-foreground">Hidratação</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{hydration.value > 0 ? hydration.value : "—"}</span>
                      <span className="text-sm text-muted-foreground">{hydration.unit}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={cn(
                        "text-xs font-medium",
                        hydration.status === "excellent" && "text-cyan-600",
                        hydration.status === "good" && "text-blue-600",
                        hydration.status === "warning" && "text-amber-600",
                        hydration.status === "alert" && "text-red-600",
                      )}>{hydration.label}</span>
                      {hydration.trendLabel && (
                        <span className="text-[10px] text-amber-600">{hydration.trendLabel}</span>
                      )}
                    </div>
                  </div>

                  {/* Integridade Física */}
                  <div className={cn(
                    "p-4 rounded-xl border transition-all",
                    physicalIntegrity.status === "excellent" && "bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800",
                    physicalIntegrity.status === "good" && "bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800",
                    physicalIntegrity.status === "warning" && "bg-amber-50 border-amber-200 dark:bg-amber-950/30 dark:border-amber-800",
                    physicalIntegrity.status === "alert" && "bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800",
                  )}>
                    <div className="flex items-center gap-2 mb-2">
                      <Shield className={cn(
                        "h-4 w-4",
                        physicalIntegrity.status === "excellent" && "text-green-600",
                        physicalIntegrity.status === "good" && "text-blue-600",
                        physicalIntegrity.status === "warning" && "text-amber-600",
                        physicalIntegrity.status === "alert" && "text-red-600",
                      )} />
                      <span className="text-xs font-medium text-muted-foreground">Físico</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl font-bold">{physicalIntegrity.value > 0 ? physicalIntegrity.value : "—"}</span>
                      <span className="text-sm text-muted-foreground">{physicalIntegrity.unit}</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className={cn(
                        "text-xs font-medium",
                        physicalIntegrity.status === "excellent" && "text-green-600",
                        physicalIntegrity.status === "good" && "text-blue-600",
                        physicalIntegrity.status === "warning" && "text-amber-600",
                        physicalIntegrity.status === "alert" && "text-red-600",
                      )}>{physicalIntegrity.label}</span>
                      {physicalIntegrity.trendLabel && (
                        <span className="text-[10px] text-amber-600">{physicalIntegrity.trendLabel}</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tempo Médio na Creche + Créditos */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Tempo de Permanência */}
                  <div className="p-4 rounded-xl border bg-gradient-to-br from-violet-50 to-purple-50 dark:from-violet-950/30 dark:to-purple-950/30 border-violet-100 dark:border-violet-900/50">
                    <div className="flex items-center gap-2 mb-3">
                      <Clock className="h-5 w-5 text-violet-600" />
                      <span className="font-semibold text-violet-900 dark:text-violet-100">Tempo na Creche</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-white/60 dark:bg-white/5 rounded-lg">
                        <div className="text-xl font-bold text-violet-600">
                          {stayTimeMetrics.avgHours > 0 ? `${stayTimeMetrics.avgHours}h` : "—"}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Média</div>
                      </div>
                      <div className="text-center p-2 bg-white/60 dark:bg-white/5 rounded-lg">
                        <div className="text-xl font-bold text-purple-600">
                          {stayTimeMetrics.lastStayHours ? `${stayTimeMetrics.lastStayHours}h` : "—"}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Última</div>
                      </div>
                      <div className="text-center p-2 bg-white/60 dark:bg-white/5 rounded-lg">
                        <div className="text-xl font-bold text-indigo-600">
                          {stayTimeMetrics.longestStayHours > 0 ? `${stayTimeMetrics.longestStayHours}h` : "—"}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Máxima</div>
                      </div>
                      <div className="text-center p-2 bg-white/60 dark:bg-white/5 rounded-lg">
                        <div className="text-xl font-bold text-slate-600">{stayTimeMetrics.totalDays}</div>
                        <div className="text-[10px] text-muted-foreground">Dias</div>
                      </div>
                    </div>
                  </div>

                  {/* Créditos */}
                  <div className={cn(
                    "p-4 rounded-xl border transition-all",
                    creditMetrics.status === "excellent" && "bg-gradient-to-br from-emerald-50 to-green-50 dark:from-emerald-950/30 dark:to-green-950/30 border-emerald-100 dark:border-emerald-900/50",
                    creditMetrics.status === "good" && "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-100 dark:border-blue-900/50",
                    creditMetrics.status === "warning" && "bg-gradient-to-br from-amber-50 to-yellow-50 dark:from-amber-950/30 dark:to-yellow-950/30 border-amber-100 dark:border-amber-900/50",
                    creditMetrics.status === "alert" && "bg-gradient-to-br from-red-50 to-rose-50 dark:from-red-950/30 dark:to-rose-950/30 border-red-100 dark:border-red-900/50",
                  )}>
                    <div className="flex items-center gap-2 mb-3">
                      <Coins className={cn(
                        "h-5 w-5",
                        creditMetrics.status === "excellent" && "text-emerald-600",
                        creditMetrics.status === "good" && "text-blue-600",
                        creditMetrics.status === "warning" && "text-amber-600",
                        creditMetrics.status === "alert" && "text-red-600",
                      )} />
                      <span className={cn(
                        "font-semibold",
                        creditMetrics.status === "excellent" && "text-emerald-900 dark:text-emerald-100",
                        creditMetrics.status === "good" && "text-blue-900 dark:text-blue-100",
                        creditMetrics.status === "warning" && "text-amber-900 dark:text-amber-100",
                        creditMetrics.status === "alert" && "text-red-900 dark:text-red-100",
                      )}>Créditos</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div className="text-center p-2 bg-white/60 dark:bg-white/5 rounded-lg">
                        <div className={cn(
                          "text-xl font-bold",
                          creditMetrics.status === "excellent" && "text-emerald-600",
                          creditMetrics.status === "good" && "text-blue-600",
                          creditMetrics.status === "warning" && "text-amber-600",
                          creditMetrics.status === "alert" && "text-red-600",
                        )}>
                          {creditMetrics.currentCredits}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Saldo Atual</div>
                      </div>
                      <div className="text-center p-2 bg-white/60 dark:bg-white/5 rounded-lg">
                        <div className="text-xl font-bold text-slate-600">{creditMetrics.usedThisMonth}</div>
                        <div className="text-[10px] text-muted-foreground">Este mês</div>
                      </div>
                      <div className="text-center p-2 bg-white/60 dark:bg-white/5 rounded-lg">
                        <div className="text-xl font-bold text-slate-600">{creditMetrics.avgPerWeek}</div>
                        <div className="text-[10px] text-muted-foreground">Por semana</div>
                      </div>
                      <div className="text-center p-2 bg-white/60 dark:bg-white/5 rounded-lg">
                        <div className="text-xl font-bold text-slate-600">
                          {creditMetrics.daysRemaining ? `${creditMetrics.daysRemaining}d` : "—"}
                        </div>
                        <div className="text-[10px] text-muted-foreground">Estimativa</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Nota explicativa */}
                <div className="flex items-start gap-2 p-3 rounded-lg bg-slate-50 dark:bg-slate-900/50 border border-slate-100 dark:border-slate-800">
                  <Info className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-muted-foreground">
                    Indicadores calculados automaticamente com base nos registros diários. 
                    Quanto mais registros, mais precisas ficam as métricas.
                  </p>
                </div>
              </div>
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
