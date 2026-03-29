"use client";

import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Plus, Loader2, Upload } from "lucide-react";
import { uploadDocument } from "@/lib/supabase/storage";

interface Expense {
  id: number;
  categoryId: number;
  description: string;
  amount: number; // centavos
  date: string;
  supplier?: string | null;
  receiptUrl?: string | null;
  notes?: string | null;
}

interface ExpenseDialogProps {
  expense?: Expense;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function ExpenseDialog({ expense, onSuccess, children }: ExpenseDialogProps) {
  const isEdit = !!expense;
  const [open, setOpen] = useState(false);
  const [categoryId, setCategoryId] = useState("");
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [supplier, setSupplier] = useState("");
  const [receiptFile, setReceiptFile] = useState<File | null>(null);
  const [notes, setNotes] = useState("");
  const [uploading, setUploading] = useState(false);

  const categories = trpc.expenses.listCategories.useQuery(undefined, { enabled: open });
  const utils = trpc.useUtils();

  const createExpense = trpc.expenses.create.useMutation({
    onSuccess: () => {
      toast.success("Despesa registrada com sucesso!");
      handleClose();
      utils.expenses.invalidate();
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message),
  });

  const updateExpense = trpc.expenses.update.useMutation({
    onSuccess: () => {
      toast.success("Despesa atualizada com sucesso!");
      handleClose();
      utils.expenses.invalidate();
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message),
  });

  useEffect(() => {
    if (open && expense) {
      setCategoryId(String(expense.categoryId));
      setDescription(expense.description);
      setAmount(String(expense.amount / 100));
      setDate(expense.date);
      setSupplier(expense.supplier || "");
      setNotes(expense.notes || "");
    }
  }, [open, expense]);

  function resetForm() {
    setCategoryId("");
    setDescription("");
    setAmount("");
    setDate(new Date().toISOString().split("T")[0]);
    setSupplier("");
    setReceiptFile(null);
    setNotes("");
  }

  function handleClose() {
    setOpen(false);
    resetForm();
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!categoryId) {
      toast.error("Selecione uma categoria");
      return;
    }
    if (!description.trim()) {
      toast.error("Informe uma descrição");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast.error("Informe um valor válido");
      return;
    }

    const amountCents = Math.round(Number(amount) * 100);
    let receiptUrl: string | undefined;

    if (receiptFile) {
      try {
        setUploading(true);
        const result = await uploadDocument(receiptFile, 0);
        receiptUrl = result.url;
      } catch {
        toast.error("Erro ao enviar comprovante");
        return;
      } finally {
        setUploading(false);
      }
    }

    const payload = {
      categoryId: Number(categoryId),
      description: description.trim(),
      amount: amountCents,
      date,
      supplier: supplier.trim() || undefined,
      receiptUrl,
      notes: notes.trim() || undefined,
    };

    if (isEdit && expense) {
      updateExpense.mutate({ id: expense.id, ...payload });
    } else {
      createExpense.mutate(payload);
    }
  }

  const isPending = createExpense.isPending || updateExpense.isPending || uploading;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" variant="outline" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> {isEdit ? "Editar" : "Nova Despesa"}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? "Editar Despesa" : "Nova Despesa"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="categoryId">Categoria</Label>
            <Select value={categoryId} onValueChange={setCategoryId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a categoria" />
              </SelectTrigger>
              <SelectContent>
                {categories.data?.map((cat) => (
                  <SelectItem key={cat.id} value={String(cat.id)}>
                    {cat.icon} {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Input
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Descrição da despesa"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="supplier">Fornecedor</Label>
            <Input
              id="supplier"
              value={supplier}
              onChange={(e) => setSupplier(e.target.value)}
              placeholder="Nome do fornecedor (opcional)"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Comprovante</Label>
            <div className="flex items-center gap-2">
              <Input
                id="receipt"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setReceiptFile(e.target.files?.[0] || null)}
                className="flex-1"
              />
              {receiptFile && (
                <Upload className="h-4 w-4 text-muted-foreground" />
              )}
            </div>
            {isEdit && expense?.receiptUrl && !receiptFile && (
              <p className="text-xs text-muted-foreground">
                Comprovante já anexado. Envie um novo para substituir.
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Observações</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Observações opcionais..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isEdit ? "Atualizar" : "Salvar"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
