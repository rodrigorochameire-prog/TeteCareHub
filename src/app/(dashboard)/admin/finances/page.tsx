"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  CircleDollarSign,
  Eye,
  BarChart3,
  Package,
  CreditCard,
  Receipt,
} from "lucide-react";
import { LoadingPage } from "@/components/shared/loading";
import { FinanceSummaryCards } from "@/components/finance/finance-summary-cards";
import { FinanceChart } from "@/components/finance/finance-chart";
import { DelinquencyPanel } from "@/components/finance/delinquency-panel";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function formatCurrency(cents: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(cents / 100);
}

export default function AdminFinances() {
  const [activeTab, setActiveTab] = useState("overview");

  const { data: summary, isLoading: summaryLoading } = trpc.finances.summary.useQuery();
  const { data: recentTx, isLoading: txLoading } = trpc.finances.transactions.useQuery({
    limit: 10,
  });

  if (summaryLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 bg-primary/10 rounded-lg">
          <CircleDollarSign className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold">Finanças</h1>
          <p className="text-sm text-muted-foreground">
            Visão geral financeira da creche
          </p>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-muted/50">
          <TabsTrigger value="overview" className="gap-2">
            <Eye className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="packages" className="gap-2">
            <Package className="h-4 w-4" />
            Pacotes
          </TabsTrigger>
        </TabsList>

        {/* Tab: Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          {/* Summary Cards */}
          <FinanceSummaryCards />

          {/* Chart */}
          <FinanceChart />

          {/* Delinquency Panel */}
          <DelinquencyPanel />

          {/* Recent Transactions */}
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <Receipt className="h-4 w-4 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-base font-semibold">
                    Transações Recentes
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Últimas movimentações financeiras
                  </CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              {txLoading ? (
                <div className="py-8 text-center text-muted-foreground">
                  Carregando...
                </div>
              ) : !recentTx || recentTx.length === 0 ? (
                <div className="py-8 text-center text-muted-foreground">
                  Nenhuma transação registrada
                </div>
              ) : (
                <div className="space-y-2">
                  {recentTx.map((item) => {
                    const tx = item.transaction;
                    const isCredit = tx.type === "credit_purchase";
                    const isRefund = tx.type === "refund";
                    return (
                      <div
                        key={tx.id}
                        className="flex items-center gap-3 p-3 rounded-xl border bg-card"
                      >
                        <div
                          className={`p-2 rounded-lg ${
                            isRefund
                              ? "bg-rose-100 dark:bg-rose-900/30"
                              : "bg-emerald-100 dark:bg-emerald-900/30"
                          }`}
                        >
                          {isCredit ? (
                            <CreditCard
                              className="h-4 w-4 text-emerald-600 dark:text-emerald-400"
                            />
                          ) : (
                            <Receipt
                              className={`h-4 w-4 ${
                                isRefund
                                  ? "text-rose-600 dark:text-rose-400"
                                  : "text-emerald-600 dark:text-emerald-400"
                              }`}
                            />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">
                              {tx.description ||
                                (isCredit
                                  ? "Compra de créditos"
                                  : isRefund
                                    ? "Reembolso"
                                    : tx.type)}
                            </span>
                            {tx.credits && (
                              <Badge variant="secondary" className="text-[10px] px-1.5">
                                {tx.credits} cr
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            {item.pet?.name && <span>{item.pet.name}</span>}
                            {item.user?.name && (
                              <>
                                {item.pet?.name && <span>&middot;</span>}
                                <span>{item.user.name}</span>
                              </>
                            )}
                            <span>&middot;</span>
                            <span>
                              {format(new Date(tx.createdAt), "dd/MM/yy HH:mm", {
                                locale: ptBR,
                              })}
                            </span>
                          </div>
                        </div>
                        <span
                          className={`font-bold text-sm shrink-0 ${
                            isRefund
                              ? "text-rose-600 dark:text-rose-400"
                              : "text-emerald-600 dark:text-emerald-400"
                          }`}
                        >
                          {isRefund ? "-" : "+"}
                          {formatCurrency(Math.abs(tx.amount))}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Pacotes */}
        <TabsContent value="packages" className="space-y-6">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Package className="h-5 w-5" />
                Pacotes de Créditos
              </CardTitle>
              <CardDescription>
                {summary?.packages?.length || 0} pacotes disponíveis
              </CardDescription>
            </CardHeader>
            <CardContent>
              {!summary?.packages || summary.packages.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12">
                  <div className="p-4 bg-muted rounded-full mb-4">
                    <Package className="h-12 w-12 text-muted-foreground" />
                  </div>
                  <p className="text-lg font-medium text-muted-foreground">
                    Nenhum pacote cadastrado
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {summary.packages.map((pkg) => (
                    <div
                      key={pkg.id}
                      className="p-4 rounded-xl border bg-card hover:border-primary/30 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <span className="font-semibold">{pkg.name}</span>
                        {pkg.discountPercent > 0 && (
                          <Badge variant="secondary">-{pkg.discountPercent}%</Badge>
                        )}
                      </div>
                      {pkg.description && (
                        <p className="text-sm text-muted-foreground mb-3">
                          {pkg.description}
                        </p>
                      )}
                      <div className="text-2xl font-bold mb-2">
                        {formatCurrency(pkg.priceInCents)}
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          <CreditCard className="h-3.5 w-3.5 inline mr-1" />
                          {pkg.credits} créditos
                        </span>
                        <Badge variant={pkg.isActive ? "secondary" : "outline"}>
                          {pkg.isActive ? "Ativo" : "Inativo"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
