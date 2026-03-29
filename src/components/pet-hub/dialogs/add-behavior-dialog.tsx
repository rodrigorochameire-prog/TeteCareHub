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

interface AddBehaviorDialogProps {
  petId: number;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

const SOCIALIZATION_OPTIONS = [
  { value: "excellent", label: "Excelente" },
  { value: "good", label: "Bom" },
  { value: "moderate", label: "Moderado" },
  { value: "poor", label: "Ruim" },
];

const ENERGY_OPTIONS = [
  { value: "high", label: "Alto" },
  { value: "normal", label: "Normal" },
  { value: "low", label: "Baixo" },
];

const OBEDIENCE_OPTIONS = [
  { value: "excellent", label: "Excelente" },
  { value: "good", label: "Bom" },
  { value: "needs_work", label: "Precisa melhorar" },
];

const ANXIETY_OPTIONS = [
  { value: "none", label: "Nenhuma" },
  { value: "mild", label: "Leve" },
  { value: "moderate", label: "Moderada" },
  { value: "severe", label: "Severa" },
];

const AGGRESSION_OPTIONS = [
  { value: "none", label: "Nenhuma" },
  { value: "mild", label: "Leve" },
  { value: "moderate", label: "Moderada" },
  { value: "severe", label: "Severa" },
];

export function AddBehaviorDialog({ petId, onSuccess, children }: AddBehaviorDialogProps) {
  const [open, setOpen] = useState(false);
  const [logDate, setLogDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [socialization, setSocialization] = useState("");
  const [energy, setEnergy] = useState("");
  const [obedience, setObedience] = useState("");
  const [anxiety, setAnxiety] = useState("");
  const [aggression, setAggression] = useState("");
  const [notes, setNotes] = useState("");

  const addBehavior = trpc.behavior.add.useMutation({
    onSuccess: () => {
      toast.success("Registro de comportamento adicionado!");
      setOpen(false);
      resetForm();
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message),
  });

  function resetForm() {
    setLogDate(new Date().toISOString().split("T")[0]);
    setSocialization("");
    setEnergy("");
    setObedience("");
    setAnxiety("");
    setAggression("");
    setNotes("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    addBehavior.mutate({
      petId,
      logDate,
      socialization: (socialization || undefined) as "excellent" | "good" | "moderate" | "poor" | undefined,
      energy: (energy || undefined) as "high" | "normal" | "low" | undefined,
      obedience: (obedience || undefined) as "excellent" | "good" | "needs_work" | undefined,
      anxiety: (anxiety || undefined) as "none" | "mild" | "moderate" | "severe" | undefined,
      aggression: (aggression || undefined) as "none" | "mild" | "moderate" | "severe" | undefined,
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
          <DialogTitle>Registrar Comportamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="logDate">Data</Label>
            <Input
              id="logDate"
              type="date"
              value={logDate}
              onChange={(e) => setLogDate(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Socialização</Label>
              <Select value={socialization} onValueChange={setSocialization}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {SOCIALIZATION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Energia</Label>
              <Select value={energy} onValueChange={setEnergy}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {ENERGY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Obediência</Label>
              <Select value={obedience} onValueChange={setObedience}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {OBEDIENCE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Ansiedade</Label>
              <Select value={anxiety} onValueChange={setAnxiety}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {ANXIETY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Agressividade</Label>
              <Select value={aggression} onValueChange={setAggression}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {AGGRESSION_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="behaviorNotes">Observações</Label>
            <Textarea
              id="behaviorNotes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
              placeholder="Observações sobre o comportamento..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={addBehavior.isPending}>
              {addBehavior.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
