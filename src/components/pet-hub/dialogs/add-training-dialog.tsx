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

interface AddTrainingDialogProps {
  petId: number;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

const CATEGORIES = [
  { value: "obedience", label: "Obediência" },
  { value: "socialization", label: "Socialização" },
  { value: "behavior", label: "Comportamento" },
  { value: "agility", label: "Agilidade" },
  { value: "tricks", label: "Truques" },
] as const;

const STATUSES = [
  { value: "learning", label: "Aprendendo" },
  { value: "practicing", label: "Praticando" },
  { value: "mastered", label: "Dominado" },
] as const;

const METHODS = [
  { value: "positive_reinforcement", label: "Reforço positivo" },
  { value: "clicker", label: "Clicker" },
  { value: "lure", label: "Isca (lure)" },
  { value: "capture", label: "Captura" },
] as const;

export function AddTrainingDialog({ petId, onSuccess, children }: AddTrainingDialogProps) {
  const [open, setOpen] = useState(false);
  const [command, setCommand] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("learning");
  const [logDate, setLogDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [duration, setDuration] = useState("");
  const [successRate, setSuccessRate] = useState("");
  const [method, setMethod] = useState("");
  const [notes, setNotes] = useState("");

  const addTraining = trpc.training.add.useMutation({
    onSuccess: () => {
      toast.success("Sessão de treinamento registrada!");
      setOpen(false);
      resetForm();
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message),
  });

  function resetForm() {
    setCommand("");
    setCategory("");
    setStatus("learning");
    setLogDate(new Date().toISOString().split("T")[0]);
    setDuration("");
    setSuccessRate("");
    setMethod("");
    setNotes("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!command.trim()) {
      toast.error("Informe o comando/habilidade");
      return;
    }
    if (!category) {
      toast.error("Selecione a categoria");
      return;
    }
    addTraining.mutate({
      petId,
      command: command.trim(),
      category: category as "obedience" | "socialization" | "behavior" | "agility" | "tricks",
      status: status as "learning" | "practicing" | "mastered",
      logDate,
      duration: duration ? Number(duration) : undefined,
      successRate: successRate ? Number(successRate) : undefined,
      method: method ? (method as "positive_reinforcement" | "clicker" | "lure" | "capture") : undefined,
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
          <DialogTitle>Registrar Sessão de Treinamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="command">Comando / Habilidade</Label>
            <Input
              id="command"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder="Ex: Senta, Fica, Deita..."
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value}>
                      {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUSES.map((s) => (
                    <SelectItem key={s.value} value={s.value}>
                      {s.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
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
            <div className="space-y-2">
              <Label htmlFor="duration">Duração (min)</Label>
              <Input
                id="duration"
                type="number"
                min={1}
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="15"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="successRate">Sucesso (%)</Label>
              <Input
                id="successRate"
                type="number"
                min={0}
                max={100}
                value={successRate}
                onChange={(e) => setSuccessRate(e.target.value)}
                placeholder="70"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="method">Método</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Opcional" />
              </SelectTrigger>
              <SelectContent>
                {METHODS.map((m) => (
                  <SelectItem key={m.value} value={m.value}>
                    {m.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
            <Button type="submit" disabled={addTraining.isPending}>
              {addTraining.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
