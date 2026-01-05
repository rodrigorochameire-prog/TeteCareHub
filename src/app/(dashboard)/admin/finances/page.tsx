"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  TrendingUp, 
  CreditCard, 
  DollarSign,
  Package,
  ArrowUpRight,
  ArrowDownRight,
  Sparkles,
  Calendar,
  Wallet,
  PiggyBank,
  Receipt,
  BadgePercent,
  BarChart3,
  CircleDollarSign
} from "lucide-react";
import { LoadingPage } from "@/components/shared/loading";

export default function AdminFinances() {
  const currentDate = new Date();
  const [year, setYear] = useState(currentDate.getFullYear());
  const [month, setMonth] = useState(currentDate.getMonth() + 1);

  const { data: summary, isLoading } = trpc.finances.summary.useQuery();
  const { data: monthlyReport } = trpc.finances.monthlyReport.useQuery({ year, month });

  if (isLoading) {
    return <LoadingPage />;
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value / 100);
  };

  const monthNames = [
    "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
    "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
  ];

  return (
    <div className="space-y-8 animate-page-in">
      {/* Header Premium */}
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 via-green-500/5 to-teal-500/10 rounded-2xl blur-xl" />
        <div className="relative bg-gradient-to-br from-card via-card to-emerald-500/5 rounded-2xl p-6 border shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                <div className="p-2 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white">
                  <CircleDollarSign className="h-6 w-6" />
                </div>
                Finanças
              </h1>
              <p className="text-muted-foreground mt-2 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Visão geral financeira da creche
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
                <SelectTrigger className="w-36">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {monthNames.map((name, i) => (
                    <SelectItem key={i + 1} value={String(i + 1)}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
                <SelectTrigger className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 5 }, (_, i) => (
                    <SelectItem key={i} value={String(currentDate.getFullYear() - i)}>
                      {currentDate.getFullYear() - i}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
      </div>

      {/* Main Stats - Premium Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Receita Estimada - Destaque */}
        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden relative col-span-1 lg:col-span-2 bg-gradient-to-br from-emerald-500/10 via-card to-teal-500/5 border-emerald-500/30">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-emerald-500/20 to-transparent rounded-full blur-2xl" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-emerald-600 dark:text-emerald-400">Receita Estimada</CardTitle>
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-500">
              <DollarSign className="h-5 w-5" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-emerald-600 dark:text-emerald-400">
              {formatCurrency(summary?.estimatedRevenue || 0)}
            </div>
            <p className="text-sm text-muted-foreground mt-2 flex items-center gap-1">
              <PiggyBank className="h-4 w-4" />
              Baseado em créditos ativos no sistema
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Créditos</CardTitle>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
              <CreditCard className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary?.totalCredits || 0}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Wallet className="h-3 w-3" />
              Em circulação
            </p>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden relative">
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pets Ativos</CardTitle>
            <div className="p-2 rounded-lg bg-purple-500/10 text-purple-500 group-hover:bg-purple-500 group-hover:text-white transition-all">
              <Package className="h-4 w-4" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{summary?.activePets || 0}</div>
            <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
              <Sparkles className="h-3 w-3" />
              Aprovados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Monthly Report - Visual Aprimorado */}
      <Card className="overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-muted/50 to-transparent">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BarChart3 className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Relatório de {monthNames[month - 1]} {year}</CardTitle>
              <CardDescription>
                Resumo financeiro do período selecionado
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="grid gap-6 md:grid-cols-3">
            {/* Vendas */}
            <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-green-500/10 via-green-500/5 to-emerald-500/10 border border-green-500/20 hover:border-green-500/40 transition-all hover:shadow-lg">
              <div className="absolute top-4 right-4 p-2 rounded-lg bg-green-500/20 text-green-500 group-hover:bg-green-500 group-hover:text-white transition-all">
                <ArrowUpRight className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-green-600 dark:text-green-400 mb-2">Vendas</p>
              <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                {formatCurrency(monthlyReport?.purchases?.total || 0)}
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-green-600/70 dark:text-green-400/70">
                <Receipt className="h-4 w-4" />
                <span>{monthlyReport?.purchases?.count || 0} transações</span>
              </div>
            </div>

            {/* Reembolsos */}
            <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-red-500/10 via-red-500/5 to-rose-500/10 border border-red-500/20 hover:border-red-500/40 transition-all hover:shadow-lg">
              <div className="absolute top-4 right-4 p-2 rounded-lg bg-red-500/20 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-all">
                <ArrowDownRight className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Reembolsos</p>
              <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                {formatCurrency(monthlyReport?.refunds?.total || 0)}
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-red-600/70 dark:text-red-400/70">
                <Receipt className="h-4 w-4" />
                <span>{monthlyReport?.refunds?.count || 0} transações</span>
              </div>
            </div>

            {/* Receita Líquida */}
            <div className="group relative p-6 rounded-2xl bg-gradient-to-br from-blue-500/10 via-blue-500/5 to-indigo-500/10 border border-blue-500/20 hover:border-blue-500/40 transition-all hover:shadow-lg">
              <div className="absolute top-4 right-4 p-2 rounded-lg bg-blue-500/20 text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <TrendingUp className="h-5 w-5" />
              </div>
              <p className="text-sm font-medium text-blue-600 dark:text-blue-400 mb-2">Receita Líquida</p>
              <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(monthlyReport?.netRevenue || 0)}
              </p>
              <div className="mt-3 flex items-center gap-2 text-sm text-blue-600/70 dark:text-blue-400/70">
                <BarChart3 className="h-4 w-4" />
                <span>Vendas - Reembolsos</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Credit Packages - Grid Premium */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Package className="h-5 w-5 text-primary" />
            </div>
            <div>
              <CardTitle>Pacotes de Créditos</CardTitle>
              <CardDescription>
                {summary?.packages?.length || 0} pacotes disponíveis para venda
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {!summary?.packages || summary.packages.length === 0 ? (
            <div className="text-center py-12">
              <Package className="h-16 w-16 mx-auto text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">Nenhum pacote cadastrado</p>
              <p className="text-sm text-muted-foreground/70 mt-1">
                Crie pacotes de créditos para vender aos tutores
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {summary.packages.map((pkg) => (
                <Card 
                  key={pkg.id} 
                  className="group relative hover:shadow-lg transition-all duration-300 hover:-translate-y-1 overflow-hidden"
                >
                  {/* Discount Badge */}
                  {pkg.discountPercent > 0 && (
                    <div className="absolute -top-1 -right-1 z-10">
                      <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white shadow-lg">
                        <BadgePercent className="h-3 w-3 mr-1" />
                        -{pkg.discountPercent}%
                      </Badge>
                    </div>
                  )}
                  
                  {/* Gradient Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                  
                  <CardHeader className="pb-2">
                    <div className="flex items-center gap-2">
                      <div className="p-2 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-all">
                        <CreditCard className="h-4 w-4" />
                      </div>
                      <CardTitle className="text-lg">{pkg.name}</CardTitle>
                    </div>
                    {pkg.description && (
                      <CardDescription className="mt-2">{pkg.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-baseline gap-2">
                      <span className="text-3xl font-bold bg-gradient-to-r from-primary to-purple-600 bg-clip-text text-transparent">
                        {formatCurrency(pkg.priceInCents)}
                      </span>
                    </div>
                    <div className="mt-3 flex items-center gap-2 text-sm text-muted-foreground">
                      <Sparkles className="h-4 w-4 text-primary" />
                      <span className="font-medium">{pkg.credits}</span>
                      <span>créditos inclusos</span>
                    </div>
                    <div className="mt-4 pt-4 border-t flex items-center justify-between">
                      <Badge 
                        variant={pkg.isActive ? "default" : "secondary"}
                        className={pkg.isActive 
                          ? "bg-green-500/10 text-green-600 dark:text-green-400 border-green-500/30" 
                          : "bg-muted text-muted-foreground"
                        }
                      >
                        {pkg.isActive ? "✓ Ativo" : "Inativo"}
                      </Badge>
                      {pkg.credits > 0 && (
                        <span className="text-xs text-muted-foreground">
                          {formatCurrency(Math.round(pkg.priceInCents / pkg.credits))}/crédito
                        </span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
