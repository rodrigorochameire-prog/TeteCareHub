/**
 * Módulo de Métricas Comportamentais
 * Cálculos inteligentes para gráfico radar/teia
 * Compartilhado entre páginas de tutor e admin
 */

// ========================================
// TIPOS
// ========================================

export interface BehaviorLog {
  id: number;
  petId: number;
  logDate: string;
  socialization?: string | null;
  energy?: string | null;
  obedience?: string | null;
  anxiety?: string | null;
  aggression?: string | null;
  notes?: string | null;
  activities?: string[];
}

export interface DailyLog {
  id: number;
  petId: number;
  date: string;
  mood?: string | null;
  appetite?: string | null;
  energy?: string | null;
  socialization?: string | null;
  notes?: string | null;
}

export interface Pet {
  id: number;
  name: string;
  breed?: string | null;
  size?: string | null;
  temperament?: string | null;
  specialNeeds?: string | null;
}

export interface RadarMetric {
  metric: string;
  shortName: string;
  value: number;
  benchmark: number;
  description: string;
  icon: string;
  trend?: 'up' | 'down' | 'stable';
  confidence: number; // 0-100, indica confiança no dado baseado em quantidade de registros
}

// ========================================
// CONSTANTES DE SCORE
// ========================================

const SOCIALIZATION_SCORES: Record<string, number> = {
  excellent: 100,
  good: 75,
  moderate: 50,
  poor: 25,
};

const ENERGY_SCORES: Record<string, number> = {
  high: 90,
  normal: 70,
  low: 40,
};

const OBEDIENCE_SCORES: Record<string, number> = {
  excellent: 100,
  good: 70,
  needs_work: 40,
};

const ANXIETY_SCORES: Record<string, number> = {
  none: 100,      // Calma máxima
  mild: 70,
  moderate: 40,
  severe: 15,
};

const AGGRESSION_SCORES: Record<string, number> = {
  none: 100,      // Docilidade máxima
  mild: 60,
  moderate: 30,
  severe: 10,
};

const MOOD_SCORES: Record<string, number> = {
  happy: 100,
  playful: 95,
  calm: 85,
  tired: 60,
  anxious: 40,
  aggressive: 20,
  sick: 30,
};

const APPETITE_SCORES: Record<string, number> = {
  excellent: 100,
  good: 80,
  normal: 70,
  reduced: 40,
  none: 10,
};

// ========================================
// BENCHMARKS POR PORTE/RAÇA
// ========================================

interface BreedBenchmarks {
  socialization: number;
  energy: number;
  obedience: number;
  calmness: number;
  docility: number;
  adaptability: number;
  focus: number;
}

const SIZE_BENCHMARKS: Record<string, BreedBenchmarks> = {
  small: {
    socialization: 70,
    energy: 80,
    obedience: 60,
    calmness: 55,
    docility: 75,
    adaptability: 70,
    focus: 55,
  },
  medium: {
    socialization: 72,
    energy: 75,
    obedience: 65,
    calmness: 62,
    docility: 72,
    adaptability: 68,
    focus: 60,
  },
  large: {
    socialization: 68,
    energy: 70,
    obedience: 70,
    calmness: 65,
    docility: 68,
    adaptability: 65,
    focus: 65,
  },
  giant: {
    socialization: 65,
    energy: 60,
    obedience: 72,
    calmness: 70,
    docility: 70,
    adaptability: 60,
    focus: 68,
  },
};

const DEFAULT_BENCHMARKS: BreedBenchmarks = {
  socialization: 70,
  energy: 72,
  obedience: 65,
  calmness: 62,
  docility: 72,
  adaptability: 65,
  focus: 60,
};

// ========================================
// FUNÇÕES DE CÁLCULO
// ========================================

/**
 * Calcula média ponderada de scores com peso maior para registros recentes
 */
function weightedAverage(values: number[], decayFactor: number = 0.9): number {
  if (values.length === 0) return 0;
  
  let sum = 0;
  let weights = 0;
  
  values.forEach((value, index) => {
    const weight = Math.pow(decayFactor, index);
    sum += value * weight;
    weights += weight;
  });
  
  return Math.round(sum / weights);
}

/**
 * Calcula tendência baseada nos últimos registros
 */
function calculateTrend(values: number[]): 'up' | 'down' | 'stable' {
  if (values.length < 3) return 'stable';
  
  const recent = values.slice(0, Math.ceil(values.length / 2));
  const older = values.slice(Math.ceil(values.length / 2));
  
  const recentAvg = recent.reduce((a, b) => a + b, 0) / recent.length;
  const olderAvg = older.reduce((a, b) => a + b, 0) / older.length;
  
  const diff = recentAvg - olderAvg;
  
  if (diff > 5) return 'up';
  if (diff < -5) return 'down';
  return 'stable';
}

/**
 * Calcula nível de confiança baseado na quantidade de dados
 */
function calculateConfidence(dataPoints: number, minForMax: number = 10): number {
  return Math.min(100, Math.round((dataPoints / minForMax) * 100));
}

/**
 * Obtém benchmarks baseado no porte do pet
 */
function getBenchmarks(size?: string | null): BreedBenchmarks {
  if (!size) return DEFAULT_BENCHMARKS;
  return SIZE_BENCHMARKS[size.toLowerCase()] || DEFAULT_BENCHMARKS;
}

// ========================================
// CÁLCULO DE MÉTRICAS INDIVIDUAIS
// ========================================

/**
 * Calcula score de Sociabilidade
 * Baseado em: socialization logs, interações positivas, humor social
 */
export function calculateSocialization(
  behaviorLogs: BehaviorLog[],
  dailyLogs: DailyLog[]
): { value: number; confidence: number; trend: 'up' | 'down' | 'stable' } {
  const scores: number[] = [];
  
  // Scores de behavior logs
  behaviorLogs.forEach(log => {
    if (log.socialization && SOCIALIZATION_SCORES[log.socialization]) {
      scores.push(SOCIALIZATION_SCORES[log.socialization]);
    }
  });
  
  // Scores de daily logs (mood social)
  dailyLogs.forEach(log => {
    if (log.socialization && SOCIALIZATION_SCORES[log.socialization]) {
      scores.push(SOCIALIZATION_SCORES[log.socialization]);
    }
    // Mood positivo indica boa sociabilidade
    if (log.mood && ['happy', 'playful'].includes(log.mood)) {
      scores.push(85);
    }
  });
  
  if (scores.length === 0) {
    return { value: 65, confidence: 0, trend: 'stable' };
  }
  
  return {
    value: weightedAverage(scores),
    confidence: calculateConfidence(scores.length),
    trend: calculateTrend(scores),
  };
}

/**
 * Calcula score de Obediência
 * Baseado em: obedience logs, resposta a comandos
 */
export function calculateObedience(
  behaviorLogs: BehaviorLog[]
): { value: number; confidence: number; trend: 'up' | 'down' | 'stable' } {
  const scores: number[] = [];
  
  behaviorLogs.forEach(log => {
    if (log.obedience && OBEDIENCE_SCORES[log.obedience]) {
      scores.push(OBEDIENCE_SCORES[log.obedience]);
    }
  });
  
  if (scores.length === 0) {
    return { value: 60, confidence: 0, trend: 'stable' };
  }
  
  return {
    value: weightedAverage(scores),
    confidence: calculateConfidence(scores.length),
    trend: calculateTrend(scores),
  };
}

/**
 * Calcula score de Energia
 * Baseado em: energy logs, atividades, humor energético
 */
export function calculateEnergy(
  behaviorLogs: BehaviorLog[],
  dailyLogs: DailyLog[]
): { value: number; confidence: number; trend: 'up' | 'down' | 'stable' } {
  const scores: number[] = [];
  
  behaviorLogs.forEach(log => {
    if (log.energy && ENERGY_SCORES[log.energy]) {
      scores.push(ENERGY_SCORES[log.energy]);
    }
    // Atividades indicam energia
    if (log.activities && log.activities.length > 0) {
      const activityBonus = Math.min(20, log.activities.length * 5);
      scores.push(70 + activityBonus);
    }
  });
  
  dailyLogs.forEach(log => {
    if (log.energy && ENERGY_SCORES[log.energy]) {
      scores.push(ENERGY_SCORES[log.energy]);
    }
    if (log.mood === 'playful') {
      scores.push(90);
    } else if (log.mood === 'tired') {
      scores.push(40);
    }
  });
  
  if (scores.length === 0) {
    return { value: 70, confidence: 0, trend: 'stable' };
  }
  
  return {
    value: weightedAverage(scores),
    confidence: calculateConfidence(scores.length),
    trend: calculateTrend(scores),
  };
}

/**
 * Calcula score de Tranquilidade/Calma (inverso de ansiedade)
 * Baseado em: anxiety logs, humor calmo
 */
export function calculateCalmness(
  behaviorLogs: BehaviorLog[],
  dailyLogs: DailyLog[]
): { value: number; confidence: number; trend: 'up' | 'down' | 'stable' } {
  const scores: number[] = [];
  
  behaviorLogs.forEach(log => {
    if (log.anxiety && ANXIETY_SCORES[log.anxiety]) {
      scores.push(ANXIETY_SCORES[log.anxiety]);
    }
  });
  
  dailyLogs.forEach(log => {
    if (log.mood === 'calm') {
      scores.push(95);
    } else if (log.mood === 'anxious') {
      scores.push(30);
    } else if (log.mood === 'happy') {
      scores.push(80);
    }
  });
  
  if (scores.length === 0) {
    return { value: 65, confidence: 0, trend: 'stable' };
  }
  
  return {
    value: weightedAverage(scores),
    confidence: calculateConfidence(scores.length),
    trend: calculateTrend(scores),
  };
}

/**
 * Calcula score de Docilidade (inverso de agressão)
 * Baseado em: aggression logs, comportamento gentil
 */
export function calculateDocility(
  behaviorLogs: BehaviorLog[],
  dailyLogs: DailyLog[]
): { value: number; confidence: number; trend: 'up' | 'down' | 'stable' } {
  const scores: number[] = [];
  
  behaviorLogs.forEach(log => {
    if (log.aggression && AGGRESSION_SCORES[log.aggression]) {
      scores.push(AGGRESSION_SCORES[log.aggression]);
    }
    // Boa socialização indica docilidade
    if (log.socialization === 'excellent' || log.socialization === 'good') {
      scores.push(85);
    }
  });
  
  dailyLogs.forEach(log => {
    if (log.mood === 'aggressive') {
      scores.push(20);
    } else if (log.mood && ['happy', 'calm', 'playful'].includes(log.mood)) {
      scores.push(85);
    }
  });
  
  if (scores.length === 0) {
    return { value: 75, confidence: 0, trend: 'stable' };
  }
  
  return {
    value: weightedAverage(scores),
    confidence: calculateConfidence(scores.length),
    trend: calculateTrend(scores),
  };
}

/**
 * Calcula score de Adaptabilidade
 * Baseado em: variedade de humores positivos, consistência
 */
export function calculateAdaptability(
  dailyLogs: DailyLog[],
  behaviorLogs: BehaviorLog[]
): { value: number; confidence: number; trend: 'up' | 'down' | 'stable' } {
  if (dailyLogs.length < 3 && behaviorLogs.length < 3) {
    return { value: 65, confidence: 0, trend: 'stable' };
  }
  
  const scores: number[] = [];
  
  // Variedade de humores positivos indica adaptabilidade
  const moodSet = new Set<string>();
  const positiveMoods = ['happy', 'playful', 'calm'];
  let positiveCount = 0;
  
  dailyLogs.slice(0, 15).forEach(log => {
    if (log.mood) {
      moodSet.add(log.mood);
      if (positiveMoods.includes(log.mood)) {
        positiveCount++;
      }
    }
  });
  
  // Score baseado em variedade positiva
  const varietyScore = Math.min(100, 50 + (moodSet.size * 8) + (positiveCount * 3));
  scores.push(varietyScore);
  
  // Participação em atividades diferentes indica adaptabilidade
  const activitySet = new Set<string>();
  behaviorLogs.forEach(log => {
    if (log.activities) {
      log.activities.forEach(a => activitySet.add(a));
    }
  });
  
  if (activitySet.size > 0) {
    const activityScore = Math.min(100, 60 + (activitySet.size * 6));
    scores.push(activityScore);
  }
  
  return {
    value: weightedAverage(scores),
    confidence: calculateConfidence(dailyLogs.length + behaviorLogs.length),
    trend: calculateTrend(scores),
  };
}

/**
 * Calcula score de Foco/Atenção
 * Baseado em: obediência excelente, atividades de treinamento
 */
export function calculateFocus(
  behaviorLogs: BehaviorLog[]
): { value: number; confidence: number; trend: 'up' | 'down' | 'stable' } {
  const scores: number[] = [];
  
  behaviorLogs.forEach(log => {
    // Obediência excelente indica alto foco
    if (log.obedience === 'excellent') {
      scores.push(95);
    } else if (log.obedience === 'good') {
      scores.push(75);
    } else if (log.obedience === 'needs_work') {
      scores.push(45);
    }
    
    // Atividades de treinamento indicam foco
    if (log.activities) {
      const trainingActivities = log.activities.filter(a => 
        a.toLowerCase().includes('trein') || 
        a.toLowerCase().includes('comando') ||
        a.toLowerCase().includes('obediência')
      );
      if (trainingActivities.length > 0) {
        scores.push(85);
      }
    }
  });
  
  if (scores.length === 0) {
    return { value: 60, confidence: 0, trend: 'stable' };
  }
  
  return {
    value: weightedAverage(scores),
    confidence: calculateConfidence(scores.length),
    trend: calculateTrend(scores),
  };
}

/**
 * Calcula score de Bem-Estar Geral
 * Baseado em: apetite, humor, saúde geral
 */
export function calculateWellbeing(
  dailyLogs: DailyLog[]
): { value: number; confidence: number; trend: 'up' | 'down' | 'stable' } {
  const scores: number[] = [];
  
  dailyLogs.forEach(log => {
    // Apetite é indicador chave de bem-estar
    if (log.appetite && APPETITE_SCORES[log.appetite]) {
      scores.push(APPETITE_SCORES[log.appetite]);
    }
    
    // Humor geral
    if (log.mood && MOOD_SCORES[log.mood]) {
      scores.push(MOOD_SCORES[log.mood]);
    }
  });
  
  if (scores.length === 0) {
    return { value: 70, confidence: 0, trend: 'stable' };
  }
  
  return {
    value: weightedAverage(scores),
    confidence: calculateConfidence(scores.length),
    trend: calculateTrend(scores),
  };
}

// ========================================
// FUNÇÃO PRINCIPAL - GERAR DADOS DO RADAR
// ========================================

export interface RadarChartData {
  metrics: RadarMetric[];
  overallScore: number;
  insights: string[];
  alerts: string[];
  dataQuality: 'excellent' | 'good' | 'limited' | 'insufficient';
}

/**
 * Gera dados completos para o gráfico radar
 */
export function generateRadarData(
  pet: Pet | null,
  behaviorLogs: BehaviorLog[],
  dailyLogs: DailyLog[]
): RadarChartData {
  // Limitar aos últimos registros para relevância
  const recentBehavior = behaviorLogs.slice(0, 20);
  const recentDaily = dailyLogs.slice(0, 30);
  
  // Obter benchmarks baseados no porte
  const benchmarks = getBenchmarks(pet?.size);
  
  // Calcular cada métrica
  const socialization = calculateSocialization(recentBehavior, recentDaily);
  const obedience = calculateObedience(recentBehavior);
  const energy = calculateEnergy(recentBehavior, recentDaily);
  const calmness = calculateCalmness(recentBehavior, recentDaily);
  const docility = calculateDocility(recentBehavior, recentDaily);
  const adaptability = calculateAdaptability(recentDaily, recentBehavior);
  const focus = calculateFocus(recentBehavior);
  
  // Montar métricas
  const metrics: RadarMetric[] = [
    {
      metric: "Sociabilidade",
      shortName: "Social",
      value: socialization.value,
      benchmark: benchmarks.socialization,
      description: "Interação com outros pets e pessoas",
      icon: "users",
      trend: socialization.trend,
      confidence: socialization.confidence,
    },
    {
      metric: "Obediência",
      shortName: "Obed.",
      value: obedience.value,
      benchmark: benchmarks.obedience,
      description: "Resposta a comandos e regras",
      icon: "graduation",
      trend: obedience.trend,
      confidence: obedience.confidence,
    },
    {
      metric: "Energia",
      shortName: "Energia",
      value: energy.value,
      benchmark: benchmarks.energy,
      description: "Nível de atividade física",
      icon: "zap",
      trend: energy.trend,
      confidence: energy.confidence,
    },
    {
      metric: "Tranquilidade",
      shortName: "Calma",
      value: calmness.value,
      benchmark: benchmarks.calmness,
      description: "Capacidade de se manter calmo",
      icon: "shield",
      trend: calmness.trend,
      confidence: calmness.confidence,
    },
    {
      metric: "Docilidade",
      shortName: "Dócil",
      value: docility.value,
      benchmark: benchmarks.docility,
      description: "Gentileza e não-agressividade",
      icon: "heart",
      trend: docility.trend,
      confidence: docility.confidence,
    },
    {
      metric: "Adaptabilidade",
      shortName: "Adapt.",
      value: adaptability.value,
      benchmark: benchmarks.adaptability,
      description: "Flexibilidade a mudanças",
      icon: "refresh",
      trend: adaptability.trend,
      confidence: adaptability.confidence,
    },
    {
      metric: "Foco",
      shortName: "Foco",
      value: focus.value,
      benchmark: benchmarks.focus,
      description: "Capacidade de atenção",
      icon: "target",
      trend: focus.trend,
      confidence: focus.confidence,
    },
  ];
  
  // Calcular score geral
  const overallScore = Math.round(
    metrics.reduce((sum, m) => sum + m.value, 0) / metrics.length
  );
  
  // Gerar insights dinâmicos
  const insights = generateInsights(metrics, pet);
  
  // Gerar alertas
  const alerts = generateAlerts(metrics, recentBehavior);
  
  // Avaliar qualidade dos dados
  const avgConfidence = Math.round(
    metrics.reduce((sum, m) => sum + m.confidence, 0) / metrics.length
  );
  
  let dataQuality: 'excellent' | 'good' | 'limited' | 'insufficient';
  if (avgConfidence >= 80) dataQuality = 'excellent';
  else if (avgConfidence >= 50) dataQuality = 'good';
  else if (avgConfidence >= 20) dataQuality = 'limited';
  else dataQuality = 'insufficient';
  
  return {
    metrics,
    overallScore,
    insights,
    alerts,
    dataQuality,
  };
}

/**
 * Gera insights baseados nas métricas
 */
function generateInsights(metrics: RadarMetric[], pet: Pet | null): string[] {
  const insights: string[] = [];
  
  // Ordenar por valor
  const sorted = [...metrics].sort((a, b) => b.value - a.value);
  const strongest = sorted[0];
  const weakest = sorted[sorted.length - 1];
  
  // Pontos fortes
  if (strongest && strongest.value >= 80) {
    insights.push(`Destaque em ${strongest.metric.toLowerCase()} (${strongest.value}%) - continue o bom trabalho!`);
  }
  
  // Pontos de melhoria
  if (weakest && weakest.value < 50) {
    insights.push(`${weakest.metric} pode melhorar - considere atividades específicas`);
  }
  
  // Tendências positivas
  const improving = metrics.filter(m => m.trend === 'up');
  if (improving.length > 0) {
    insights.push(`Evolução positiva em ${improving.map(m => m.metric.toLowerCase()).join(', ')}`);
  }
  
  // Comparação com benchmark
  const aboveBenchmark = metrics.filter(m => m.value > m.benchmark);
  if (aboveBenchmark.length >= 5) {
    insights.push(`${pet?.name || 'Pet'} supera a média em ${aboveBenchmark.length} de 7 dimensões`);
  }
  
  // Equilíbrio geral
  const values = metrics.map(m => m.value);
  const variance = Math.sqrt(values.reduce((sum, v) => sum + Math.pow(v - (values.reduce((a, b) => a + b, 0) / values.length), 2), 0) / values.length);
  if (variance < 10) {
    insights.push("Perfil comportamental bem equilibrado");
  }
  
  return insights.slice(0, 4);
}

/**
 * Gera alertas baseados em comportamentos preocupantes
 */
function generateAlerts(metrics: RadarMetric[], behaviorLogs: BehaviorLog[]): string[] {
  const alerts: string[] = [];
  
  // Alerta de ansiedade
  const calmness = metrics.find(m => m.metric === "Tranquilidade");
  if (calmness && calmness.value < 40) {
    alerts.push("Níveis de ansiedade elevados detectados");
  }
  
  // Alerta de agressão
  const docility = metrics.find(m => m.metric === "Docilidade");
  if (docility && docility.value < 50) {
    alerts.push("Comportamentos agressivos registrados - considere avaliação profissional");
  }
  
  // Alerta de socialização
  const socialization = metrics.find(m => m.metric === "Sociabilidade");
  if (socialization && socialization.value < 40) {
    alerts.push("Dificuldades de socialização - recomenda-se acompanhamento");
  }
  
  // Verificar registros recentes de problemas
  const recentProblems = behaviorLogs.slice(0, 5).filter(log => 
    log.aggression === 'severe' || 
    log.anxiety === 'severe' ||
    log.socialization === 'poor'
  );
  
  if (recentProblems.length >= 2) {
    alerts.push("Padrão de comportamento preocupante nos últimos registros");
  }
  
  return alerts;
}

// ========================================
// FUNÇÕES PARA AGREGAÇÃO (ADMIN)
// ========================================

/**
 * Gera dados do radar para visão geral de todos os pets (admin)
 */
export function generateAggregatedRadarData(
  allBehaviorLogs: BehaviorLog[]
): { subject: string; value: number; fullMark: number }[] {
  if (allBehaviorLogs.length === 0) {
    return [
      { subject: "Socialização", value: 0, fullMark: 100 },
      { subject: "Obediência", value: 0, fullMark: 100 },
      { subject: "Energia", value: 0, fullMark: 100 },
      { subject: "Calma", value: 0, fullMark: 100 },
      { subject: "Docilidade", value: 0, fullMark: 100 },
    ];
  }
  
  // Calcular médias agregadas
  const calcAvg = (key: keyof BehaviorLog, scoreMap: Record<string, number>): number => {
    const values = allBehaviorLogs
      .filter(log => log[key] && scoreMap[log[key] as string])
      .map(log => scoreMap[log[key] as string]);
    
    if (values.length === 0) return 50;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };
  
  return [
    { 
      subject: "Socialização", 
      value: calcAvg('socialization', SOCIALIZATION_SCORES), 
      fullMark: 100 
    },
    { 
      subject: "Obediência", 
      value: calcAvg('obedience', OBEDIENCE_SCORES), 
      fullMark: 100 
    },
    { 
      subject: "Energia", 
      value: calcAvg('energy', ENERGY_SCORES), 
      fullMark: 100 
    },
    { 
      subject: "Calma", 
      value: calcAvg('anxiety', ANXIETY_SCORES), 
      fullMark: 100 
    },
    { 
      subject: "Docilidade", 
      value: calcAvg('aggression', AGGRESSION_SCORES), 
      fullMark: 100 
    },
  ];
}

/**
 * Gera dados premium do radar para visão geral (admin) - 7 dimensões
 */
export function generateAggregatedRadarDataPremium(
  allBehaviorLogs: BehaviorLog[]
): RadarMetric[] {
  if (allBehaviorLogs.length === 0) {
    return DEFAULT_METRICS_EMPTY;
  }
  
  const calcAvg = (key: keyof BehaviorLog, scoreMap: Record<string, number>): number => {
    const values = allBehaviorLogs
      .filter(log => log[key] && scoreMap[log[key] as string])
      .map(log => scoreMap[log[key] as string]);
    
    if (values.length === 0) return 50;
    return Math.round(values.reduce((a, b) => a + b, 0) / values.length);
  };
  
  const dataPoints = allBehaviorLogs.length;
  const confidence = calculateConfidence(dataPoints, 50);
  
  return [
    {
      metric: "Sociabilidade",
      shortName: "Social",
      value: calcAvg('socialization', SOCIALIZATION_SCORES),
      benchmark: 70,
      description: "Média de interação social",
      icon: "users",
      confidence,
    },
    {
      metric: "Obediência",
      shortName: "Obed.",
      value: calcAvg('obedience', OBEDIENCE_SCORES),
      benchmark: 65,
      description: "Média de obediência",
      icon: "graduation",
      confidence,
    },
    {
      metric: "Energia",
      shortName: "Energia",
      value: calcAvg('energy', ENERGY_SCORES),
      benchmark: 72,
      description: "Média de nível de energia",
      icon: "zap",
      confidence,
    },
    {
      metric: "Tranquilidade",
      shortName: "Calma",
      value: calcAvg('anxiety', ANXIETY_SCORES),
      benchmark: 62,
      description: "Média de calma/baixa ansiedade",
      icon: "shield",
      confidence,
    },
    {
      metric: "Docilidade",
      shortName: "Dócil",
      value: calcAvg('aggression', AGGRESSION_SCORES),
      benchmark: 72,
      description: "Média de docilidade",
      icon: "heart",
      confidence,
    },
    {
      metric: "Adaptabilidade",
      shortName: "Adapt.",
      value: Math.round((calcAvg('socialization', SOCIALIZATION_SCORES) + calcAvg('anxiety', ANXIETY_SCORES)) / 2),
      benchmark: 65,
      description: "Estimativa de adaptabilidade",
      icon: "refresh",
      confidence: Math.round(confidence * 0.7),
    },
    {
      metric: "Foco",
      shortName: "Foco",
      value: calcAvg('obedience', OBEDIENCE_SCORES),
      benchmark: 60,
      description: "Estimativa de foco",
      icon: "target",
      confidence: Math.round(confidence * 0.7),
    },
  ];
}

const DEFAULT_METRICS_EMPTY: RadarMetric[] = [
  { metric: "Sociabilidade", shortName: "Social", value: 50, benchmark: 70, description: "Sem dados", icon: "users", confidence: 0 },
  { metric: "Obediência", shortName: "Obed.", value: 50, benchmark: 65, description: "Sem dados", icon: "graduation", confidence: 0 },
  { metric: "Energia", shortName: "Energia", value: 50, benchmark: 72, description: "Sem dados", icon: "zap", confidence: 0 },
  { metric: "Tranquilidade", shortName: "Calma", value: 50, benchmark: 62, description: "Sem dados", icon: "shield", confidence: 0 },
  { metric: "Docilidade", shortName: "Dócil", value: 50, benchmark: 72, description: "Sem dados", icon: "heart", confidence: 0 },
  { metric: "Adaptabilidade", shortName: "Adapt.", value: 50, benchmark: 65, description: "Sem dados", icon: "refresh", confidence: 0 },
  { metric: "Foco", shortName: "Foco", value: 50, benchmark: 60, description: "Sem dados", icon: "target", confidence: 0 },
];
