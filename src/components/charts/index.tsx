"use client";

/**
 * Re-export de Recharts para uso consistente
 * Os gráficos são carregados normalmente mas as páginas que os usam
 * devem ser carregadas com next/dynamic para reduzir o bundle inicial
 */

export {
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  RadarChart,
  Radar,
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
} from "recharts";
