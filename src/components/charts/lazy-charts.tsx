"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

// Skeleton para carregamento de gráficos
const ChartSkeleton = () => (
  <div className="w-full h-full flex items-center justify-center">
    <Skeleton className="w-full h-full min-h-[200px]" />
  </div>
);

// Lazy load de todos os componentes do Recharts
// Isso reduz o bundle inicial em ~150KB por página

export const LazyBarChart = dynamic(
  () => import("recharts").then((mod) => mod.BarChart),
  { loading: ChartSkeleton, ssr: false }
);

export const LazyBar = dynamic(
  () => import("recharts").then((mod) => mod.Bar),
  { ssr: false }
);

export const LazyLineChart = dynamic(
  () => import("recharts").then((mod) => mod.LineChart),
  { loading: ChartSkeleton, ssr: false }
);

export const LazyLine = dynamic(
  () => import("recharts").then((mod) => mod.Line),
  { ssr: false }
);

export const LazyAreaChart = dynamic(
  () => import("recharts").then((mod) => mod.AreaChart),
  { loading: ChartSkeleton, ssr: false }
);

export const LazyArea = dynamic(
  () => import("recharts").then((mod) => mod.Area),
  { ssr: false }
);

export const LazyPieChart = dynamic(
  () => import("recharts").then((mod) => mod.PieChart),
  { loading: ChartSkeleton, ssr: false }
);

export const LazyPie = dynamic(
  () => import("recharts").then((mod) => mod.Pie),
  { ssr: false }
);

export const LazyRadarChart = dynamic(
  () => import("recharts").then((mod) => mod.RadarChart),
  { loading: ChartSkeleton, ssr: false }
);

export const LazyRadar = dynamic(
  () => import("recharts").then((mod) => mod.Radar),
  { ssr: false }
);

export const LazyResponsiveContainer = dynamic(
  () => import("recharts").then((mod) => mod.ResponsiveContainer),
  { ssr: false }
);

export const LazyXAxis = dynamic(
  () => import("recharts").then((mod) => mod.XAxis),
  { ssr: false }
);

export const LazyYAxis = dynamic(
  () => import("recharts").then((mod) => mod.YAxis),
  { ssr: false }
);

export const LazyCartesianGrid = dynamic(
  () => import("recharts").then((mod) => mod.CartesianGrid),
  { ssr: false }
);

export const LazyTooltip = dynamic(
  () => import("recharts").then((mod) => mod.Tooltip),
  { ssr: false }
);

export const LazyLegend = dynamic(
  () => import("recharts").then((mod) => mod.Legend),
  { ssr: false }
);

export const LazyCell = dynamic(
  () => import("recharts").then((mod) => mod.Cell),
  { ssr: false }
);

export const LazyPolarGrid = dynamic(
  () => import("recharts").then((mod) => mod.PolarGrid),
  { ssr: false }
);

export const LazyPolarAngleAxis = dynamic(
  () => import("recharts").then((mod) => mod.PolarAngleAxis),
  { ssr: false }
);

export const LazyPolarRadiusAxis = dynamic(
  () => import("recharts").then((mod) => mod.PolarRadiusAxis),
  { ssr: false }
);
