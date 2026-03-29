"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  BarChart3,
  Users,
} from "lucide-react";
import type { FinanceReportData } from "./export-utils";

interface FinanceReportProps {
  data: FinanceReportData;
}

function formatPrice(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

export function FinanceReport({ data }: FinanceReportProps) {
  const expenseChange =
    data.previousMonthExpenses > 0
      ? ((data.expenses - data.previousMonthExpenses) /
          data.previousMonthExpenses) *
        100
      : 0;

  return (
    <div className="space-y-6">
      {/* Sec\u00e7\u00e3o 1: Receita */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-primary" />
            Receita
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="text-3xl font-bold text-primary">
            {formatPrice(data.revenue)}
          </div>

          {data.revenueByPet.length > 0 ? (
            <div>
              <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                Por Pet
              </h4>
              <div className="rounded-lg border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-muted/50">
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                        Pet
                      </th>
                      <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                        Plano
                      </th>
                      <th className="text-right px-4 py-2 font-medium text-muted-foreground">
                        Valor
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.revenueByPet.map((r, i) => (
                      <tr
                        key={`${r.petName}-${i}`}
                        className="border-t border-border"
                      >
                        <td className="px-4 py-2">{r.petName}</td>
                        <td className="px-4 py-2 text-muted-foreground">
                          {r.planName}
                        </td>
                        <td className="px-4 py-2 text-right font-medium">
                          {formatPrice(r.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma receita registrada neste per\u00edodo.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Sec\u00e7\u00e3o 2: Despesas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-destructive" />
            Despesas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="text-3xl font-bold text-destructive">
              {formatPrice(data.expenses)}
            </div>
            {expenseChange !== 0 && (
              <Badge
                variant={expenseChange > 0 ? "destructive" : "secondary"}
                className="flex items-center gap-1"
              >
                {expenseChange > 0 ? (
                  <TrendingUp className="h-3 w-3" />
                ) : (
                  <TrendingDown className="h-3 w-3" />
                )}
                {Math.abs(expenseChange).toFixed(1)}% vs m\u00eas anterior
              </Badge>
            )}
          </div>

          {data.expensesByCategory.length > 0 ? (
            <>
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                  Por Categoria
                </h4>
                <div className="rounded-lg border border-border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="bg-muted/50">
                        <th className="text-left px-4 py-2 font-medium text-muted-foreground">
                          Categoria
                        </th>
                        <th className="text-right px-4 py-2 font-medium text-muted-foreground">
                          Total
                        </th>
                        <th className="text-right px-4 py-2 font-medium text-muted-foreground">
                          %
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.expensesByCategory.map((e, i) => (
                        <tr
                          key={`${e.categoryName}-${i}`}
                          className="border-t border-border"
                        >
                          <td className="px-4 py-2">{e.categoryName}</td>
                          <td className="px-4 py-2 text-right font-medium">
                            {formatPrice(e.total)}
                          </td>
                          <td className="px-4 py-2 text-right text-muted-foreground">
                            {data.expenses > 0
                              ? ((e.total / data.expenses) * 100).toFixed(1)
                              : "0.0"}
                            %
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Top 5 maiores despesas */}
              <div>
                <h4 className="text-sm font-semibold text-muted-foreground mb-2">
                  Top 5 Categorias
                </h4>
                <div className="space-y-2">
                  {data.expensesByCategory.slice(0, 5).map((e, i) => {
                    const pct =
                      data.expenses > 0
                        ? (e.total / data.expenses) * 100
                        : 0;
                    return (
                      <div key={`top-${e.categoryName}-${i}`} className="flex items-center gap-3">
                        <span className="text-sm w-32 truncate">
                          {e.categoryName}
                        </span>
                        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-destructive/70 rounded-full transition-all"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="text-xs text-muted-foreground w-16 text-right">
                          {formatPrice(e.total)}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhuma despesa registrada neste per\u00edodo.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Sec\u00e7\u00e3o 3: Lucro */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {data.profit >= 0 ? (
              <TrendingUp className="h-5 w-5 text-primary" />
            ) : (
              <TrendingDown className="h-5 w-5 text-destructive" />
            )}
            Lucro
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Receita</p>
              <p className="text-xl font-semibold">{formatPrice(data.revenue)}</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Despesas</p>
              <p className="text-xl font-semibold text-destructive">
                - {formatPrice(data.expenses)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lucro</p>
              <p
                className={`text-xl font-bold ${
                  data.profit >= 0 ? "text-primary" : "text-destructive"
                }`}
              >
                {data.profit >= 0 ? "" : "- "}
                {formatPrice(Math.abs(data.profit))}
              </p>
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Margem:</span>
            <Badge variant={data.margin >= 0 ? "default" : "destructive"}>
              {data.margin.toFixed(1)}%
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Sec\u00e7\u00e3o 4: Inadimpl\u00eancia */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Inadimpl\u00eancia
          </CardTitle>
        </CardHeader>
        <CardContent>
          {data.delinquentPets.length > 0 ? (
            <div className="space-y-3">
              {data.delinquentPets
                .filter((p) => p.status === "red" || p.status === "yellow")
                .map((pet) => (
                  <div
                    key={pet.id}
                    className="flex items-center justify-between rounded-lg border border-border p-3"
                  >
                    <div className="flex items-center gap-3">
                      {pet.status === "red" ? (
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                      <div>
                        <p className="font-medium">{pet.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {pet.planName} &middot; Tutor: {pet.tutorName}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge
                        variant={
                          pet.status === "red" ? "destructive" : "secondary"
                        }
                      >
                        {pet.credits} cr\u00e9dito{pet.credits !== 1 ? "s" : ""}
                      </Badge>
                    </div>
                  </div>
                ))}
              {data.delinquentPets.filter(
                (p) => p.status === "red" || p.status === "yellow"
              ).length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Nenhum pet em situa\u00e7\u00e3o de inadimpl\u00eancia.
                </p>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Nenhum dado de inadimpl\u00eancia dispon\u00edvel.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Sec\u00e7\u00e3o 5: Proje\u00e7\u00e3o */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-primary" />
            Proje\u00e7\u00e3o (m\u00e9dia dos \u00faltimos 3 meses)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Receita m\u00e9dia</p>
              <p className="text-xl font-semibold">
                {formatPrice(data.projection.averageRevenue)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Despesa m\u00e9dia</p>
              <p className="text-xl font-semibold">
                {formatPrice(data.projection.averageExpenses)}
              </p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Lucro m\u00e9dio</p>
              <p
                className={`text-xl font-bold ${
                  data.projection.averageProfit >= 0
                    ? "text-primary"
                    : "text-destructive"
                }`}
              >
                {formatPrice(data.projection.averageProfit)}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
