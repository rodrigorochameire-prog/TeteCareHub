"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent } from "@/components/ui/card";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Receipt,
  AlertTriangle,
} from "lucide-react";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export function FinanceSummaryCards() {
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const { data: chartData } = trpc.expenses.monthlyChart.useQuery({ months: 1 });
  const { data: delinquency } = trpc.expenses.getDelinquencyReport.useQuery();

  const currentMonth = chartData?.[0];
  const revenue = currentMonth?.revenue ?? 0;
  const expensesTotal = currentMonth?.expenses ?? 0;
  const profit = revenue - expensesTotal;
  const delinquentCount = delinquency?.filter((p) => p.status === "red").length ?? 0;

  const cards = [
    {
      label: "Receita",
      value: formatCurrency(revenue),
      icon: DollarSign,
      iconBg: "bg-emerald-100 dark:bg-emerald-900/30",
      iconColor: "text-emerald-600 dark:text-emerald-400",
    },
    {
      label: "Despesas",
      value: formatCurrency(expensesTotal),
      icon: Receipt,
      iconBg: "bg-rose-100 dark:bg-rose-900/30",
      iconColor: "text-rose-600 dark:text-rose-400",
    },
    {
      label: "Lucro",
      value: formatCurrency(profit),
      icon: profit >= 0 ? TrendingUp : TrendingDown,
      iconBg: profit >= 0
        ? "bg-emerald-100 dark:bg-emerald-900/30"
        : "bg-rose-100 dark:bg-rose-900/30",
      iconColor: profit >= 0
        ? "text-emerald-600 dark:text-emerald-400"
        : "text-rose-600 dark:text-rose-400",
    },
    {
      label: "Inadimplência",
      value: String(delinquentCount),
      subtitle: delinquentCount === 1 ? "pet sem créditos" : "pets sem créditos",
      icon: AlertTriangle,
      iconBg: "bg-amber-100 dark:bg-amber-900/30",
      iconColor: "text-amber-600 dark:text-amber-400",
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className="shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-5 pb-4">
              <div className="flex items-center gap-3">
                <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                  <Icon className={`h-5 w-5 ${card.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-medium text-muted-foreground">
                    {card.label}
                  </p>
                  <p className="text-2xl font-bold text-foreground leading-tight">
                    {card.value}
                  </p>
                  {card.subtitle && (
                    <p className="text-xs text-muted-foreground">{card.subtitle}</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
