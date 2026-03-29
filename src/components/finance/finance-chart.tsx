"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const MONTH_NAMES_SHORT = [
  "Jan", "Fev", "Mar", "Abr", "Mai", "Jun",
  "Jul", "Ago", "Set", "Out", "Nov", "Dez",
];

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function FinanceChart() {
  const { data, isLoading } = trpc.expenses.monthlyChart.useQuery({ months: 6 });

  const chartData = (data ?? []).map((item) => ({
    name: `${MONTH_NAMES_SHORT[item.month]}/${String(item.year).slice(2)}`,
    receita: item.revenue,
    despesas: item.expenses,
    lucro: item.profit,
  }));

  return (
    <Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-primary/10">
            <BarChart3 className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base font-semibold">
              Evolução Financeira
            </CardTitle>
            <CardDescription className="text-xs">
              Receita, despesas e lucro dos últimos 6 meses
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="h-[320px] flex items-center justify-center text-muted-foreground">
            Carregando...
          </div>
        ) : chartData.length === 0 ? (
          <div className="h-[320px] flex items-center justify-center text-muted-foreground">
            Nenhum dado disponível
          </div>
        ) : (
          <div className="h-[320px]">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart
                data={chartData}
                margin={{ top: 10, right: 10, bottom: 10, left: 0 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  className="stroke-border"
                  strokeOpacity={0.5}
                  vertical={false}
                />
                <XAxis
                  dataKey="name"
                  className="text-muted-foreground"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                />
                <YAxis
                  className="text-muted-foreground"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(v) =>
                    `R$${(v / 100).toLocaleString("pt-BR", { maximumFractionDigits: 0 })}`
                  }
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "hsl(var(--popover))",
                    border: "1px solid hsl(var(--border))",
                    borderRadius: "8px",
                    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
                    fontSize: "12px",
                    color: "hsl(var(--popover-foreground))",
                  }}
                  formatter={(value, name) => [
                    formatCurrency(Number(value ?? 0)),
                    name === "receita"
                      ? "Receita"
                      : name === "despesas"
                        ? "Despesas"
                        : "Lucro",
                  ]}
                />
                <Legend
                  iconType="circle"
                  iconSize={8}
                  formatter={(value: string) =>
                    value === "receita"
                      ? "Receita"
                      : value === "despesas"
                        ? "Despesas"
                        : "Lucro"
                  }
                />
                <Bar
                  dataKey="receita"
                  name="receita"
                  fill="#16a34a"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
                <Bar
                  dataKey="despesas"
                  name="despesas"
                  fill="#dc2626"
                  radius={[4, 4, 0, 0]}
                  maxBarSize={36}
                />
                <Line
                  type="monotone"
                  dataKey="lucro"
                  name="lucro"
                  stroke="#16a34a"
                  strokeWidth={2}
                  dot={{ r: 3, fill: "#16a34a" }}
                />
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
