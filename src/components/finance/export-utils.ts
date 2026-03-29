// Tipos para o relatório financeiro
export interface RevenueByPet {
  petName: string;
  planName: string;
  amount: number; // centavos
}

export interface ExpenseByCategory {
  categoryName: string;
  icon: string | null;
  total: number; // centavos
}

export interface DelinquentPet {
  id: number;
  name: string;
  credits: number;
  planName: string;
  tutorName: string;
  status: "green" | "yellow" | "red";
}

export interface FinanceReportData {
  monthLabel: string;
  revenue: number; // centavos
  expenses: number; // centavos
  profit: number; // centavos
  margin: number; // percentual
  revenueByPet: RevenueByPet[];
  expensesByCategory: ExpenseByCategory[];
  delinquentPets: DelinquentPet[];
  previousMonthExpenses: number; // centavos
  projection: {
    averageRevenue: number;
    averageExpenses: number;
    averageProfit: number;
  };
}

function formatCurrency(cents: number): string {
  return (cents / 100).toFixed(2).replace(".", ",");
}

export async function exportToPDF(reportData: FinanceReportData): Promise<void> {
  const { jsPDF } = await import("jspdf");
  const doc = new jsPDF();

  // Titulo
  doc.setFontSize(18);
  doc.text("Relat\u00f3rio Financeiro", 14, 22);
  doc.setFontSize(11);
  doc.text(`Per\u00edodo: ${reportData.monthLabel}`, 14, 30);

  // Resumo
  let y = 45;
  doc.setFontSize(14);
  doc.text("Resumo", 14, y);
  y += 10;
  doc.setFontSize(10);
  doc.text(`Receita: R$ ${formatCurrency(reportData.revenue)}`, 14, y);
  y += 7;
  doc.text(`Despesas: R$ ${formatCurrency(reportData.expenses)}`, 14, y);
  y += 7;
  doc.text(`Lucro: R$ ${formatCurrency(reportData.profit)}`, 14, y);
  y += 7;
  doc.text(`Margem: ${reportData.margin.toFixed(1)}%`, 14, y);
  y += 15;

  // Receita por Pet
  if (reportData.revenueByPet.length > 0) {
    doc.setFontSize(14);
    doc.text("Receita por Pet", 14, y);
    y += 10;
    doc.setFontSize(9);
    doc.text("Pet", 14, y);
    doc.text("Plano", 80, y);
    doc.text("Valor (R$)", 150, y);
    y += 6;
    doc.setDrawColor(200);
    doc.line(14, y - 2, 196, y - 2);

    for (const r of reportData.revenueByPet) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(r.petName, 14, y);
      doc.text(r.planName, 80, y);
      doc.text(formatCurrency(r.amount), 150, y);
      y += 6;
    }
    y += 10;
  }

  // Despesas por Categoria
  if (reportData.expensesByCategory.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(14);
    doc.text("Despesas por Categoria", 14, y);
    y += 10;
    doc.setFontSize(9);
    doc.text("Categoria", 14, y);
    doc.text("Total (R$)", 150, y);
    y += 6;
    doc.line(14, y - 2, 196, y - 2);

    for (const e of reportData.expensesByCategory) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      doc.text(e.categoryName, 14, y);
      doc.text(formatCurrency(e.total), 150, y);
      y += 6;
    }
    y += 10;
  }

  // Inadimpl\u00eancia
  const delinquent = reportData.delinquentPets.filter(
    (p) => p.status === "red" || p.status === "yellow"
  );
  if (delinquent.length > 0) {
    if (y > 240) {
      doc.addPage();
      y = 20;
    }
    doc.setFontSize(14);
    doc.text("Inadimpl\u00eancia", 14, y);
    y += 10;
    doc.setFontSize(9);

    for (const pet of delinquent) {
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
      const statusLabel = pet.status === "red" ? "[CR\u00cdTICO]" : "[ATEN\u00c7\u00c3O]";
      doc.text(
        `${statusLabel} ${pet.name} - ${pet.planName} - ${pet.credits} cr\u00e9ditos (Tutor: ${pet.tutorName})`,
        14,
        y
      );
      y += 6;
    }
    y += 10;
  }

  // Proje\u00e7\u00e3o
  if (y > 250) {
    doc.addPage();
    y = 20;
  }
  doc.setFontSize(14);
  doc.text("Proje\u00e7\u00e3o (m\u00e9dia 3 meses)", 14, y);
  y += 10;
  doc.setFontSize(10);
  doc.text(
    `Receita m\u00e9dia: R$ ${formatCurrency(reportData.projection.averageRevenue)}`,
    14,
    y
  );
  y += 7;
  doc.text(
    `Despesa m\u00e9dia: R$ ${formatCurrency(reportData.projection.averageExpenses)}`,
    14,
    y
  );
  y += 7;
  doc.text(
    `Lucro m\u00e9dio: R$ ${formatCurrency(reportData.projection.averageProfit)}`,
    14,
    y
  );

  doc.save(`relatorio-financeiro-${reportData.monthLabel}.pdf`);
}

export async function exportToExcel(
  reportData: FinanceReportData
): Promise<void> {
  const XLSX = await import("xlsx");
  const wb = XLSX.utils.book_new();

  // Aba Resumo
  const summaryData = [
    { Item: "Receita", "Valor (R$)": formatCurrency(reportData.revenue) },
    { Item: "Despesas", "Valor (R$)": formatCurrency(reportData.expenses) },
    { Item: "Lucro", "Valor (R$)": formatCurrency(reportData.profit) },
    { Item: "Margem %", "Valor (R$)": reportData.margin.toFixed(1) + "%" },
    {
      Item: "Proje\u00e7\u00e3o Receita (m\u00e9dia 3m)",
      "Valor (R$)": formatCurrency(reportData.projection.averageRevenue),
    },
    {
      Item: "Proje\u00e7\u00e3o Despesas (m\u00e9dia 3m)",
      "Valor (R$)": formatCurrency(reportData.projection.averageExpenses),
    },
    {
      Item: "Proje\u00e7\u00e3o Lucro (m\u00e9dia 3m)",
      "Valor (R$)": formatCurrency(reportData.projection.averageProfit),
    },
  ];
  const ws1 = XLSX.utils.json_to_sheet(summaryData);
  XLSX.utils.book_append_sheet(wb, ws1, "Resumo");

  // Aba Receita por Pet
  if (reportData.revenueByPet.length > 0) {
    const revenueData = reportData.revenueByPet.map((r) => ({
      Pet: r.petName,
      Plano: r.planName,
      "Valor (R$)": formatCurrency(r.amount),
    }));
    const ws2 = XLSX.utils.json_to_sheet(revenueData);
    XLSX.utils.book_append_sheet(wb, ws2, "Receita");
  }

  // Aba Despesas por Categoria
  if (reportData.expensesByCategory.length > 0) {
    const expenseData = reportData.expensesByCategory.map((e) => ({
      Categoria: e.categoryName,
      "Total (R$)": formatCurrency(e.total),
    }));
    const ws3 = XLSX.utils.json_to_sheet(expenseData);
    XLSX.utils.book_append_sheet(wb, ws3, "Despesas");
  }

  // Aba Inadimpl\u00eancia
  const delinquent = reportData.delinquentPets.filter(
    (p) => p.status === "red" || p.status === "yellow"
  );
  if (delinquent.length > 0) {
    const delinquencyData = delinquent.map((p) => ({
      Pet: p.name,
      Plano: p.planName,
      "Cr\u00e9ditos": p.credits,
      Tutor: p.tutorName,
      Status: p.status === "red" ? "Cr\u00edtico" : "Aten\u00e7\u00e3o",
    }));
    const ws4 = XLSX.utils.json_to_sheet(delinquencyData);
    XLSX.utils.book_append_sheet(wb, ws4, "Inadimpl\u00eancia");
  }

  XLSX.writeFile(wb, `relatorio-financeiro-${reportData.monthLabel}.xlsx`);
}
