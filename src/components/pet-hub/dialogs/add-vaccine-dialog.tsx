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

interface AddVaccineDialogProps {
  petId: number;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function AddVaccineDialog({ petId, onSuccess, children }: AddVaccineDialogProps) {
  const [open, setOpen] = useState(false);
  const [vaccineId, setVaccineId] = useState("");
  const [applicationDate, setApplicationDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [nextDueDate, setNextDueDate] = useState("");
  const [doseNumber, setDoseNumber] = useState("1");
  const [veterinarian, setVeterinarian] = useState("");
  const [clinic, setClinic] = useState("");
  const [notes, setNotes] = useState("");

  const library = trpc.vaccines.library.useQuery(undefined, { enabled: open });

  const addVaccination = trpc.vaccines.addVaccination.useMutation({
    onSuccess: () => {
      toast.success("Vacina registrada com sucesso!");
      setOpen(false);
      resetForm();
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message),
  });

  function resetForm() {
    setVaccineId("");
    setApplicationDate(new Date().toISOString().split("T")[0]);
    setNextDueDate("");
    setDoseNumber("1");
    setVeterinarian("");
    setClinic("");
    setNotes("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!vaccineId) {
      toast.error("Selecione uma vacina");
      return;
    }
    addVaccination.mutate({
      petId,
      vaccineId: Number(vaccineId),
      applicationDate,
      nextDueDate: nextDueDate || undefined,
      doseNumber: Number(doseNumber) || 1,
      veterinarian: veterinarian || undefined,
      clinic: clinic || undefined,
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
          <DialogTitle>Registrar Vacina</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="vaccineId">Vacina</Label>
            <Select value={vaccineId} onValueChange={setVaccineId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a vacina" />
              </SelectTrigger>
              <SelectContent>
                {library.data?.map((v) => (
                  <SelectItem key={v.id} value={String(v.id)}>
                    {v.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="doseNumber">Dose nº</Label>
              <Input
                id="doseNumber"
                type="number"
                min={1}
                value={doseNumber}
                onChange={(e) => setDoseNumber(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="veterinarian">Veterinário</Label>
              <Input
                id="veterinarian"
                value={veterinarian}
                onChange={(e) => setVeterinarian(e.target.value)}
                placeholder="Dr(a)..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="clinic">Clínica</Label>
              <Input
                id="clinic"
                value={clinic}
                onChange={(e) => setClinic(e.target.value)}
              />
            </div>
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
            <Button type="submit" disabled={addVaccination.isPending}>
              {addVaccination.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
