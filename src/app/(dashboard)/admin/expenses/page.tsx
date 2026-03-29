"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Receipt,
  TrendingUp,
  TrendingDown,
  Plus,
  Pencil,
  Trash2,
  Settings,
  Loader2,
  ReceiptText,
} from "lucide-react";
import { toast } from "sonner";
import { LoadingPage } from "@/components/shared/loading";
import { ExpenseDialog } from "@/components/finance/expense-dialog";
import { CategoryManagerDialog } from "@/components/finance/category-manager-dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function formatPrice(cents: number) {
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

const MONTHS = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro",
];

export default function AdminExpensesPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [year, setYear] = useState(now.getFullYear());
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deletingExpense, setDeletingExpense] = useState<{ id: number; description: string } | null>(null);

  // monthlySummary and list expect month as 0-11 (JS Date convention)
  const summaryMonth = month - 1;
  const summary = trpc.expenses.monthlySummary.useQuery({ month: summaryMonth, year });
  const expenseList = trpc.expenses.list.useQuery({
    month: summaryMonth,
    year,
    ...(categoryFilter !== "all" ? { categoryId: Number(categoryFilter) } : {}),
  });
  const categories = trpc.expenses.listCategories.useQuery();
  const utils = trpc.useUtils();

  const deleteExpense = trpc.expenses.delete.useMutation({
    onSuccess: () => {
      toast.success("Despesa excluída com sucesso!");
      setDeleteDialogOpen(false);
      setDeletingExpense(null);
      utils.expenses.invalidate();
    },
    onError: (err) => toast.error(err.message),
  });

  function handleOpenDelete(id: number, description: string) {
    setDeletingExpense({ id, description });
    setDeleteDialogOpen(true);
  }

  function handleConfirmDelete() {
    if (!deletingExpense) return;
    deleteExpense.mutate({ id: deletingExpense.id });
  }

  const isLoading = summary.isLoading || expenseList.isLoading;

  if (isLoading) {
    return <LoadingPage />;
  }

  const data = summary.data;
  const totalSpent = data?.total ?? 0;
  const previousTotal = data?.previousMonthTotal ?? 0;
  const percentChange = previousTotal > 0
    ? Math.round(((totalSpent - previousTotal) / previousTotal) * 100)
    : 0;
  const isUp = percentChange >= 0;
  const byCategory = data?.byCategory ?? [];

  // Map list query results to the shape the template expects
  const filteredExpenses = (expenseList.data ?? []).map((row) => ({
    id: row.expense.id,
    categoryId: row.expense.categoryId,
    description: row.expense.description,
    amount: row.expense.amount,
    date: row.expense.date,
    supplier: row.expense.supplier,
    categoryName: row.category.name,
    categoryIcon: row.category.icon,
  }));

  const maxCategoryAmount = Math.max(
    ...byCategory.map((c) => c.total),
    1,
  );

  // Gerar anos disponíveis
  const currentYear = now.getFullYear();
  const availableYears = Array.from({ length: 3 }, (_, i) => currentYear - i);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-icon">
            <Receipt />
          </div>
          <div className="page-header-info">
            <h1>Despesas</h1>
            <p>Controle de despesas e custos operacionais</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <CategoryManagerDialog>
            <Button variant="outline" size="sm" className="gap-1.5">
              <Settings className="h-3.5 w-3.5" />
              Categorias
            </Button>
          </CategoryManagerDialog>
          <ExpenseDialog>
            <Button size="sm" className="gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              Nova Despesa
            </Button>
          </ExpenseDialog>
        </div>
      </div>

      {/* Resumo Mensal */}
      <Card className="section-card">
        <CardHeader className="section-card-header">
          <CardTitle className="section-card-title">
            <Receipt className="icon" />
            Resumo Mensal
          </CardTitle>
        </CardHeader>
        <CardContent className="section-card-content">
          <div className="flex flex-col md:flex-row md:items-start gap-6">
            {/* Total */}
            <div className="flex-shrink-0">
              <p className="text-sm text-muted-foreground mb-1">
                Total em {MONTHS[month - 1]} {year}
              </p>
              <p className="text-3xl font-bold text-foreground">
                {formatPrice(totalSpent)}
              </p>
              {previousTotal > 0 && (
                <div className="flex items-center gap-1.5 mt-2">
                  {isUp ? (
                    <TrendingUp className="h-4 w-4 text-rose-500" />
                  ) : (
                    <TrendingDown className="h-4 w-4 text-emerald-500" />
                  )}
                  <span
                    className={`text-sm font-medium ${
                      isUp ? "text-rose-500" : "text-emerald-500"
                    }`}
                  >
                    {isUp ? "+" : ""}
                    {percentChange}% vs mês anterior
                  </span>
                </div>
              )}
            </div>

            {/* Barras por categoria */}
            <div className="flex-1 space-y-3">
              {byCategory.length > 0 ? (
                byCategory.map((cat) => (
                  <div key={cat.name} className="space-y-1">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">
                        {cat.icon} {cat.name}
                      </span>
                      <span className="text-muted-foreground">
                        {formatPrice(cat.total)}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary transition-all"
                        style={{
                          width: `${(cat.total / maxCategoryAmount) * 100}%`,
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">
                  Nenhuma despesa registrada neste período
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={String(month)}
          onValueChange={(v) => setMonth(Number(v))}
        >
          <SelectTrigger className="w-[160px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {MONTHS.map((m, i) => (
              <SelectItem key={i} value={String(i + 1)}>
                {m}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select
          value={String(year)}
          onValueChange={(v) => setYear(Number(v))}
        >
          <SelectTrigger className="w-[100px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {availableYears.map((y) => (
              <SelectItem key={y} value={String(y)}>
                {y}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Todas as categorias" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todas as categorias</SelectItem>
            {categories.data?.map((cat) => (
              <SelectItem key={cat.id} value={String(cat.id)}>
                {cat.icon} {cat.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Lista de despesas */}
      <Card className="section-card">
        <CardHeader className="section-card-header">
          <CardTitle className="section-card-title">
            <ReceiptText className="icon" />
            Despesas do Período
          </CardTitle>
        </CardHeader>
        <CardContent className="section-card-content">
          {filteredExpenses.length === 0 ? (
            <div className="empty-state">
              <Receipt className="empty-state-icon" />
              <p className="empty-state-text">
                Nenhuma despesa registrada neste período
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredExpenses.map((exp) => (
                <div
                  key={exp.id}
                  className="flex items-center gap-4 p-4 rounded-xl border bg-card hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <div className="text-2xl">{exp.categoryIcon}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-sm truncate">
                        {exp.description}
                      </span>
                      <Badge variant="secondary" className="text-xs shrink-0">
                        {exp.categoryName}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>
                        {format(new Date(exp.date), "dd/MM/yyyy", {
                          locale: ptBR,
                        })}
                      </span>
                      {exp.supplier && (
                        <span>&middot; {exp.supplier}</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-foreground">
                      {formatPrice(exp.amount)}
                    </span>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <ExpenseDialog expense={{ id: exp.id, categoryId: exp.categoryId, description: exp.description, amount: exp.amount, date: exp.date, supplier: exp.supplier }}>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                    </ExpenseDialog>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive"
                      onClick={() => handleOpenDelete(exp.id, exp.description)}
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirm Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir despesa?</DialogTitle>
            <DialogDescription>
              Essa ação não pode ser desfeita. A despesa &quot;{deletingExpense?.description}&quot; será
              removida permanentemente.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              disabled={deleteExpense.isPending}
              onClick={handleConfirmDelete}
            >
              {deleteExpense.isPending ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
