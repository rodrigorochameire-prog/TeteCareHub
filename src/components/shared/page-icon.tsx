"use client";

import { type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface PageIconProps {
  icon: LucideIcon;
  className?: string;
  size?: "sm" | "md" | "lg";
}

/**
 * Ícone de página sofisticado e minimalista
 * Design inspirado no estilo da sidebar mas mais elaborado
 */
export function PageIcon({ icon: Icon, className, size = "md" }: PageIconProps) {
  const sizeClasses = {
    sm: "h-10 w-10 rounded-xl",
    md: "h-12 w-12 rounded-2xl",
    lg: "h-14 w-14 rounded-2xl",
  };

  const iconSizes = {
    sm: "h-5 w-5",
    md: "h-6 w-6",
    lg: "h-7 w-7",
  };

  return (
    <div
      className={cn(
        "relative flex items-center justify-center",
        "bg-gradient-to-br from-slate-100 to-slate-50",
        "dark:from-slate-800 dark:to-slate-900",
        "border border-slate-200/60 dark:border-slate-700/50",
        "shadow-sm",
        sizeClasses[size],
        className
      )}
    >
      {/* Subtle inner glow */}
      <div className="absolute inset-0 rounded-inherit bg-gradient-to-br from-white/40 to-transparent dark:from-white/5" />
      
      {/* Icon */}
      <Icon 
        className={cn(
          "relative z-10 text-slate-600 dark:text-slate-300",
          iconSizes[size]
        )} 
        strokeWidth={1.75}
      />
    </div>
  );
}

