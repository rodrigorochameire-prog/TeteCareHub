"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { uploadDocument } from "@/lib/supabase/storage";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";

interface RequestCreditsDialogProps {
  petId: number;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

const PAYMENT_METHODS = [
  { value: "pix", label: "Pix" },
  { value: "cartao", label: "Cartão" },
  { value: "dinheiro", label: "Dinheiro" },
  { value: "transferencia", label: "Transferência" },
] as const;

export function RequestCreditsDialog({ petId, onSuccess, children }: RequestCreditsDialogProps) {
  const [open, setOpen] = useState(false);
  const [daysRequested, setDaysRequested] = useState("");
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const createRequest = trpc.paymentRequests.create.useMutation({
    onSuccess: () => {
      toast.success("Solicitação enviada com sucesso!");
      setOpen(false);
      resetForm();
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message),
  });

  function resetForm() {
    setDaysRequested("");
    setAmount("");
    setMethod("");
    setFile(null);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!daysRequested || !method) {
      toast.error("Preencha os campos obrigatórios");
      return;
    }

    let proofUrl: string | undefined;

    if (file) {
      try {
        setUploading(true);
        const result = await uploadDocument(file, petId);
        proofUrl = result.url;
      } catch {
        toast.error("Erro ao enviar comprovante");
        return;
      } finally {
        setUploading(false);
      }
    }

    createRequest.mutate({
      petId,
      daysRequested: Number(daysRequested),
      amount: Math.round(Number(amount) * 100),
      method: method as "pix" | "cartao" | "dinheiro" | "transferencia",
      proofUrl,
    });
  }

  const isSubmitting = uploading || createRequest.isPending;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" variant="outline">
            Solicitar Créditos
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Solicitar Créditos</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="daysRequested">Diárias solicitadas</Label>
              <Input
                id="daysRequested"
                type="number"
                min={1}
                value={daysRequested}
                onChange={(e) => setDaysRequested(e.target.value)}
                placeholder="Nº de diárias"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor (R$)</Label>
              <Input
                id="amount"
                type="number"
                min={0}
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0,00"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Forma de pagamento</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o método" />
              </SelectTrigger>
              <SelectContent>
                {PAYMENT_METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="proof">Comprovante</Label>
            <div className="flex items-center gap-2">
              <Input
                id="proof"
                type="file"
                accept="image/*,.pdf"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="file:mr-2 file:rounded file:border-0 file:bg-primary/10 file:px-3 file:py-1 file:text-sm file:font-medium file:text-primary"
              />
              {file && (
                <Upload className="h-4 w-4 shrink-0 text-muted-foreground" />
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Envie o comprovante de pagamento (imagem ou PDF)
            </p>
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting || !daysRequested || !method}>
              {isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Solicitar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
