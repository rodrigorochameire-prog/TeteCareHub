"use client";

import { cn } from "@/lib/utils";

interface OccupancyGaugeProps {
  current: number;
  capacity: number;
  className?: string;
}

export function OccupancyGauge({ current, capacity, className }: OccupancyGaugeProps) {
  const percentage = capacity > 0 ? Math.min((current / capacity) * 100, 100) : 0;
  const angle = (percentage / 100) * 180; // 0-180 graus para semicírculo
  
  // Cor do arco baseada na ocupação
  const getGaugeColor = () => {
    if (percentage >= 90) return { from: "#dc2626", to: "#ef4444" }; // Vermelho
    if (percentage >= 70) return { from: "#ea580c", to: "#f97316" }; // Laranja
    if (percentage >= 50) return { from: "#0284c7", to: "#0ea5e9" }; // Azul
    return { from: "#059669", to: "#10b981" }; // Verde
  };
  
  const colors = getGaugeColor();
  
  // Dimensões do SVG
  const size = 200;
  const strokeWidth = 16;
  const radius = (size - strokeWidth) / 2;
  const center = size / 2;
  
  // Cálculo do arco
  const circumference = Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative flex flex-col items-center", className)}>
      {/* SVG do Velocímetro */}
      <div className="relative" style={{ width: size, height: size / 2 + 20 }}>
        <svg 
          width={size} 
          height={size / 2 + 20} 
          viewBox={`0 0 ${size} ${size / 2 + 20}`}
          className="overflow-visible"
        >
          <defs>
            {/* Gradiente do arco */}
            <linearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor={colors.from} />
              <stop offset="100%" stopColor={colors.to} />
            </linearGradient>
            
            {/* Sombra/Glow */}
            <filter id="gaugeShadow" x="-50%" y="-50%" width="200%" height="200%">
              <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor={colors.from} floodOpacity="0.3"/>
            </filter>
          </defs>
          
          {/* Arco de fundo (track) */}
          <path
            d={`M ${strokeWidth / 2} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center}`}
            fill="none"
            stroke="#e2e8f0"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            className="dark:stroke-slate-700"
          />
          
          {/* Arco de progresso */}
          <path
            d={`M ${strokeWidth / 2} ${center} A ${radius} ${radius} 0 0 1 ${size - strokeWidth / 2} ${center}`}
            fill="none"
            stroke="url(#gaugeGradient)"
            strokeWidth={strokeWidth}
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            filter="url(#gaugeShadow)"
            className="transition-all duration-1000 ease-out"
            style={{ transformOrigin: "center center" }}
          />
          
          {/* Marcadores de escala */}
          {[0, 25, 50, 75, 100].map((mark) => {
            const markAngle = (mark / 100) * 180;
            const rad = (markAngle - 180) * (Math.PI / 180);
            const x1 = center + (radius - 25) * Math.cos(rad);
            const y1 = center + (radius - 25) * Math.sin(rad);
            const x2 = center + (radius - 35) * Math.cos(rad);
            const y2 = center + (radius - 35) * Math.sin(rad);
            
            return (
              <g key={mark}>
                <line
                  x1={x1}
                  y1={y1}
                  x2={x2}
                  y2={y2}
                  stroke="#94a3b8"
                  strokeWidth={2}
                  className="dark:stroke-slate-500"
                />
              </g>
            );
          })}
          
          {/* Ponteiro/Agulha */}
          <g transform={`rotate(${angle - 180}, ${center}, ${center})`}>
            <line
              x1={center}
              y1={center}
              x2={center + radius - 40}
              y2={center}
              stroke="#1e293b"
              strokeWidth={3}
              strokeLinecap="round"
              className="dark:stroke-slate-200"
            />
            <circle
              cx={center}
              cy={center}
              r={8}
              fill="#1e293b"
              className="dark:fill-slate-200"
            />
          </g>
        </svg>
        
        {/* Valor central */}
        <div className="absolute inset-0 flex flex-col items-center justify-end pb-0">
          <div className="text-center">
            <div className="text-4xl font-bold tracking-tight text-slate-800 dark:text-slate-200">
              {current}
            </div>
            <div className="text-sm text-muted-foreground">
              de {capacity} pets
            </div>
          </div>
        </div>
      </div>
      
      {/* Label de ocupação */}
      <div className={cn(
        "mt-3 px-4 py-1.5 rounded-full text-sm font-semibold",
        percentage >= 90 ? "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400" :
        percentage >= 70 ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400" :
        percentage >= 50 ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" :
        "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
      )}>
        {percentage.toFixed(0)}% de ocupação
      </div>
    </div>
  );
}
