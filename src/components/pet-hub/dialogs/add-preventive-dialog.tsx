"use client";

import { useState } from "react";
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
import { Plus, Loader2 } from "lucide-react";

interface AddPreventiveDialogProps {
  petId: number;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

const PREVENTIVE_TYPES = [
  { value: "flea", label: "Antipulgas" },
  { value: "deworming", label: "Vermífugo" },
  { value: "tick", label: "Carrapaticida" },
  { value: "heartworm", label: "Dirofilariose" },
] as const;

export function AddPreventiveDialog({ petId, onSuccess, children }: AddPreventiveDialogProps) {
  const [open, setOpen] = useState(false);
  const [type, setType] = useState("");
  const [productName, setProductName] = useState("");
  const [applicationDate, setApplicationDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [nextDueDate, setNextDueDate] = useState("");
  const [dosage, setDosage] = useState("");
  const [notes, setNotes] = useState("");

  const addPreventive = trpc.preventives.add.useMutation({
    onSuccess: () => {
      toast.success("Preventivo registrado com sucesso!");
      setOpen(false);
      resetForm();
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message),
  });

  function resetForm() {
    setType("");
    setProductName("");
    setApplicationDate(new Date().toISOString().split("T")[0]);
    setNextDueDate("");
    setDosage("");
    setNotes("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!type) {
      toast.error("Selecione o tipo de preventivo");
      return;
    }
    if (!productName.trim()) {
      toast.error("Informe o nome do produto");
      return;
    }
    addPreventive.mutate({
      petId,
      type: type as "flea" | "deworming" | "heartworm" | "tick",
      productName: productName.trim(),
      applicationDate,
      nextDueDate: nextDueDate || undefined,
      dosage: dosage || undefined,
      notes: notes || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" variant="outline" className="gap-1.5">
            <Plus className="h-3.5 w-3.5" /> Adicionar
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Registrar Preventivo</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="preventiveType">Tipo</Label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {PREVENTIVE_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="productName">Nome do produto</Label>
            <Input
              id="productName"
              value={productName}
              onChange={(e) => setProductName(e.target.value)}
              placeholder="Ex: NexGard, Drontal..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="applicationDate">Data de aplicação</Label>
              <Input
                id="applicationDate"
                type="date"
                value={applicationDate}
                onChange={(e) => setApplicationDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="nextDueDate">Próxima dose</Label>
              <Input
                id="nextDueDate"
                type="date"
                value={nextDueDate}
                onChange={(e) => setNextDueDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="dosage">Dosagem</Label>
            <Input
              id="dosage"
              value={dosage}
              onChange={(e) => setDosage(e.target.value)}
              placeholder="Ex: 1 comprimido, 0.5ml..."
            />
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
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={addPreventive.isPending}>
              {addPreventive.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
