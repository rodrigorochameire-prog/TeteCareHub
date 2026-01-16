"use client";

import { cn } from "@/lib/utils";
import {
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Circle,
  Zap,
  Home,
  Building2,
  Sparkles,
} from "lucide-react";

type StatusType = 
  | "active" 
  | "checked-in" 
  | "inactive" 
  | "pending" 
  | "approved" 
  | "rejected"
  | "completed"
  | "cancelled"
  | "warning"
  | "success"
  | "error"
  | "info";

interface StatusBadgeProps {
  status: StatusType | string;
  label?: string;
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  pulse?: boolean;
  className?: string;
}

// Configuração visual para cada status
const statusConfig: Record<string, {
  icon: React.ElementType;
  label: string;
  colors: string;
  iconColor: string;
  pulseColor?: string;
}> = {
  // Status de Pet
  active: {
    icon: CheckCircle2,
    label: "Ativo",
    colors: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
    iconColor: "text-emerald-500 dark:text-emerald-400",
  },
  "checked-in": {
    icon: Building2,
    label: "Na Creche",
    colors: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50",
    iconColor: "text-blue-500 dark:text-blue-400",
    pulseColor: "bg-blue-400",
  },
  inactive: {
    icon: Circle,
    label: "Inativo",
    colors: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700",
    iconColor: "text-slate-400 dark:text-slate-500",
  },
  
  // Status de Aprovação
  pending: {
    icon: Clock,
    label: "Pendente",
    colors: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50",
    iconColor: "text-amber-500 dark:text-amber-400",
    pulseColor: "bg-amber-400",
  },
  approved: {
    icon: CheckCircle2,
    label: "Aprovado",
    colors: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
    iconColor: "text-emerald-500 dark:text-emerald-400",
  },
  rejected: {
    icon: XCircle,
    label: "Rejeitado",
    colors: "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50",
    iconColor: "text-red-500 dark:text-red-400",
  },
  
  // Status de Eventos/Tarefas
  completed: {
    icon: Sparkles,
    label: "Concluído",
    colors: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
    iconColor: "text-emerald-500 dark:text-emerald-400",
  },
  cancelled: {
    icon: XCircle,
    label: "Cancelado",
    colors: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700",
    iconColor: "text-slate-400 dark:text-slate-500",
  },
  
  // Status Genéricos
  warning: {
    icon: AlertCircle,
    label: "Atenção",
    colors: "bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50",
    iconColor: "text-amber-500 dark:text-amber-400",
  },
  success: {
    icon: CheckCircle2,
    label: "Sucesso",
    colors: "bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50",
    iconColor: "text-emerald-500 dark:text-emerald-400",
  },
  error: {
    icon: XCircle,
    label: "Erro",
    colors: "bg-red-50 text-red-700 border-red-100 dark:bg-red-950/30 dark:text-red-400 dark:border-red-900/50",
    iconColor: "text-red-500 dark:text-red-400",
  },
  info: {
    icon: AlertCircle,
    label: "Info",
    colors: "bg-blue-50 text-blue-700 border-blue-100 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50",
    iconColor: "text-blue-500 dark:text-blue-400",
  },
};

// Fallback para status desconhecidos
const defaultConfig = {
  icon: Circle,
  label: "Desconhecido",
  colors: "bg-slate-50 text-slate-600 border-slate-200 dark:bg-slate-800/50 dark:text-slate-400 dark:border-slate-700",
  iconColor: "text-slate-400",
};

const sizeClasses = {
  sm: "text-[10px] px-2 py-0.5 gap-1",
  md: "text-xs px-3 py-1 gap-1.5",
  lg: "text-sm px-4 py-1.5 gap-2",
};

const iconSizeClasses = {
  sm: "h-3 w-3",
  md: "h-3.5 w-3.5",
  lg: "h-4 w-4",
};

/**
 * StatusBadge Premium
 * 
 * Badge estilizada para exibir status com ícone e cores consistentes.
 * Suporta animação de pulse para status ativos.
 */
export function StatusBadge({
  status,
  label,
  size = "md",
  showIcon = true,
  pulse = false,
  className,
}: StatusBadgeProps) {
  const config = statusConfig[status] || defaultConfig;
  const Icon = config.icon;
  const displayLabel = label || config.label;
  const shouldPulse = pulse || (status === "checked-in" || status === "pending");

  return (
    <div
      className={cn(
        // Base
        "inline-flex items-center justify-center font-semibold rounded-full border",
        // Transição suave
        "transition-all duration-300",
        // Sombra sutil
        "shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        // Hover
        "hover:shadow-[0_2px_4px_rgba(0,0,0,0.06)]",
        // Cores do status
        config.colors,
        // Tamanho
        sizeClasses[size],
        className
      )}
    >
      {showIcon && (
        <span className="relative flex items-center justify-center">
          <Icon className={cn(iconSizeClasses[size], config.iconColor)} />
          {/* Pulse animation para status ativos */}
          {shouldPulse && config.pulseColor && (
            <span className={cn(
              "absolute inline-flex h-full w-full rounded-full opacity-75 animate-ping",
              config.pulseColor
            )} />
          )}
        </span>
      )}
      <span>{displayLabel}</span>
    </div>
  );
}

/**
 * HealthScoreBadge
 * 
 * Badge especial para indicar o "Health Score" do pet.
 * Verde = OK, Amarelo = Atenção, Vermelho = Crítico
 */
interface HealthScoreBadgeProps {
  statusColor: "green" | "yellow" | "red";
  alertCount?: number;
  size?: "sm" | "md" | "lg";
  className?: string;
}

const healthColorConfig = {
  green: {
    colors: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-800",
    dotColor: "bg-emerald-500",
    label: "OK",
  },
  yellow: {
    colors: "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-800",
    dotColor: "bg-amber-500",
    label: "Atenção",
  },
  red: {
    colors: "bg-red-50 text-red-700 border-red-200 dark:bg-red-950/30 dark:text-red-400 dark:border-red-800",
    dotColor: "bg-red-500",
    label: "Crítico",
  },
};

export function HealthScoreBadge({
  statusColor,
  alertCount = 0,
  size = "md",
  className,
}: HealthScoreBadgeProps) {
  const config = healthColorConfig[statusColor];

  return (
    <div
      className={cn(
        "inline-flex items-center font-semibold rounded-full border",
        "transition-all duration-300",
        "shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
        config.colors,
        sizeClasses[size],
        className
      )}
    >
      {/* Bolinha colorida */}
      <span className="relative flex h-2 w-2">
        <span className={cn(
          "absolute inline-flex h-full w-full rounded-full opacity-75",
          statusColor !== "green" && "animate-ping",
          config.dotColor
        )} />
        <span className={cn("relative inline-flex rounded-full h-2 w-2", config.dotColor)} />
      </span>
      
      <span>{config.label}</span>
      
      {alertCount > 0 && (
        <span className={cn(
          "ml-1 px-1.5 py-0.5 rounded-full text-[10px] font-bold",
          "bg-white/80 dark:bg-black/20"
        )}>
          {alertCount}
        </span>
      )}
    </div>
  );
}
