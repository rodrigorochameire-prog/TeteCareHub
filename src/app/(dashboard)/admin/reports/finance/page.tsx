"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { FileDown, Sheet, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { LoadingPage } from "@/components/shared/loading";
import { FinanceReport } from "@/components/finance/finance-report";
import {
  exportToPDF,
  exportToExcel,
  type FinanceReportData,
} from "@/components/finance/export-utils";

const MONTHS = [
  "Janeiro",
  "Fevereiro",
  "Mar\u00e7o",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

export default function FinanceReportPage() {
  const now = new Date();
  const [month, setMonth] = useState(now.getMonth());
  const [year, setYear] = useState(now.getFullYear());
  const [exporting, setExporting] = useState<"pdf" | "excel" | null>(null);

  const monthLabel = `${MONTHS[month]} ${year}`;

  // Queries
  const expensesSummary = trpc.expenses.monthlySummary.useQuery({
    month,
    year,
  });

  const financesReport = trpc.finances.monthlyReport.useQuery({
    year,
    month: month + 1, // finances router uses 1-12
  });

  const delinquency = trpc.expenses.getDelinquencyReport.useQuery();

  const chartData = trpc.expenses.monthlyChart.useQuery({ months: 3 });

  const isLoading =
    expensesSummary.isLoading ||
    financesReport.isLoading ||
    delinquency.isLoading ||
    chartData.isLoading;

  // Agregar dados no formato FinanceReportData
  const reportData: FinanceReportData | null = useMemo(() => {
    if (
      !expensesSummary.data ||
      !financesReport.data ||
      !delinquency.data ||
      !chartData.data
    ) {
      return null;
    }

    const revenue = financesReport.data.purchases.total ?? 0;
    const expensesTotal = expensesSummary.data.total ?? 0;
    const profit = revenue - expensesTotal;
    const margin = revenue > 0 ? (profit / revenue) * 100 : 0;

    // Montar receita por pet a partir das transa\u00e7\u00f5es
    // O router de finances n\u00e3o retorna por pet, ent\u00e3o usamos dados agregados
    const revenueByPet: FinanceReportData["revenueByPet"] = [];

    // Despesas por categoria
    const expensesByCategory: FinanceReportData["expensesByCategory"] =
      expensesSummary.data.byCategory.map((c) => ({
        categoryName: c.name,
        icon: c.icon,
        total: c.total,
      }));

    // Inadimpl\u00eancia
    const delinquentPets: FinanceReportData["delinquentPets"] =
      delinquency.data.map((p) => ({
        id: p.id,
        name: p.name,
        credits: p.credits,
        planName: p.planName,
        tutorName: p.tutorName,
        status: p.status,
      }));

    // Proje\u00e7\u00e3o: m\u00e9dia dos \u00faltimos 3 meses
    const chart = chartData.data;
    const avgRevenue =
      chart.length > 0
        ? chart.reduce((sum, m) => sum + m.revenue, 0) / chart.length
        : 0;
    const avgExpenses =
      chart.length > 0
        ? chart.reduce((sum, m) => sum + m.expenses, 0) / chart.length
        : 0;

    return {
      monthLabel,
      revenue,
      expenses: expensesTotal,
      profit,
      margin,
      revenueByPet,
      expensesByCategory,
      delinquentPets,
      previousMonthExpenses: expensesSummary.data.previousMonthTotal ?? 0,
      projection: {
        averageRevenue: Math.round(avgRevenue),
        averageExpenses: Math.round(avgExpenses),
        averageProfit: Math.round(avgRevenue - avgExpenses),
      },
    };
  }, [
    expensesSummary.data,
    financesReport.data,
    delinquency.data,
    chartData.data,
    monthLabel,
  ]);

  async function handleExportPDF() {
    if (!reportData) return;
    setExporting("pdf");
    try {
      await exportToPDF(reportData);
      toast.success("PDF exportado com sucesso!");
    } catch {
      toast.error("Erro ao exportar PDF. Verifique se o jsPDF est\u00e1 instalado.");
    } finally {
      setExporting(null);
    }
  }

  async function handleExportExcel() {
    if (!reportData) return;
    setExporting("excel");
    try {
      await exportToExcel(reportData);
      toast.success("Excel exportado com sucesso!");
    } catch {
      toast.error("Erro ao exportar Excel. Verifique se o xlsx est\u00e1 instalado.");
    } finally {
      setExporting(null);
    }
  }

  // Anos dispon\u00edveis
  const currentYear = now.getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="space-y-6">
      {/* Cabe\u00e7alho */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Relat\u00f3rio Financeiro
          </h1>
          <p className="text-muted-foreground">{monthLabel}</p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Seletor de m\u00eas */}
          <Select
            value={String(month)}
            onValueChange={(v) => setMonth(Number(v))}
          >
            <SelectTrigger className="w-[140px]">
              <SelectValue placeholder="M\u00eas" />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, i) => (
                <SelectItem key={i} value={String(i)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Seletor de ano */}
          <Select
            value={String(year)}
            onValueChange={(v) => setYear(Number(v))}
          >
            <SelectTrigger className="w-[100px]">
              <SelectValue placeholder="Ano" />
            </SelectTrigger>
            <SelectContent>
              {years.map((y) => (
                <SelectItem key={y} value={String(y)}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Bot\u00f5es de exporta\u00e7\u00e3o */}
          <Button
            variant="outline"
            onClick={handleExportPDF}
            disabled={!reportData || exporting !== null}
          >
            {exporting === "pdf" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <FileDown className="mr-2 h-4 w-4" />
            )}
            Exportar PDF
          </Button>
          <Button
            variant="outline"
            onClick={handleExportExcel}
            disabled={!reportData || exporting !== null}
          >
            {exporting === "excel" ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Sheet className="mr-2 h-4 w-4" />
            )}
            Exportar Excel
          </Button>
        </div>
      </div>

      {/* Relat\u00f3rio */}
      {reportData ? (
        <FinanceReport data={reportData} />
      ) : (
        <p className="text-muted-foreground">
          N\u00e3o foi poss\u00edvel carregar os dados do relat\u00f3rio.
        </p>
      )}
    </div>
  );
}
