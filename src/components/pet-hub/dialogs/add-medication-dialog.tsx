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

interface AddMedicationDialogProps {
  petId: number;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function AddMedicationDialog({ petId, onSuccess, children }: AddMedicationDialogProps) {
  const [open, setOpen] = useState(false);
  const [medicationId, setMedicationId] = useState("");
  const [customMedName, setCustomMedName] = useState("");
  const [customMedType, setCustomMedType] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [endDate, setEndDate] = useState("");
  const [dosage, setDosage] = useState("");
  const [frequency, setFrequency] = useState("");
  const [notes, setNotes] = useState("");

  const library = trpc.medications.library.useQuery(undefined, { enabled: open });

  const addMedication = trpc.medications.add.useMutation({
    onSuccess: () => {
      toast.success("Medicamento registrado com sucesso!");
      setOpen(false);
      resetForm();
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message),
  });

  function resetForm() {
    setMedicationId("");
    setCustomMedName("");
    setCustomMedType("");
    setUseCustom(false);
    setStartDate(new Date().toISOString().split("T")[0]);
    setEndDate("");
    setDosage("");
    setFrequency("");
    setNotes("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!dosage) {
      toast.error("Informe a dosagem");
      return;
    }
    if (useCustom) {
      if (!customMedName || !customMedType) {
        toast.error("Informe nome e tipo do medicamento");
        return;
      }
      addMedication.mutate({
        petId,
        customMedName,
        customMedType,
        startDate,
        endDate: endDate || undefined,
        dosage,
        frequency: frequency || undefined,
        notes: notes || undefined,
        addToCalendar: true,
      });
    } else {
      if (!medicationId) {
        toast.error("Selecione um medicamento");
        return;
      }
      addMedication.mutate({
        petId,
        medicationId: Number(medicationId),
        startDate,
        endDate: endDate || undefined,
        dosage,
        frequency: frequency || undefined,
        notes: notes || undefined,
        addToCalendar: true,
      });
    }
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
          <DialogTitle>Adicionar Medicamento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Toggle: biblioteca ou customizado */}
          <div className="flex items-center gap-2">
            <Button
              type="button"
              size="sm"
              variant={!useCustom ? "default" : "outline"}
              onClick={() => setUseCustom(false)}
            >
              Biblioteca
            </Button>
            <Button
              type="button"
              size="sm"
              variant={useCustom ? "default" : "outline"}
              onClick={() => setUseCustom(true)}
            >
              Personalizado
            </Button>
          </div>

          {!useCustom ? (
            <div className="space-y-2">
              <Label>Medicamento</Label>
              <Select value={medicationId} onValueChange={setMedicationId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o medicamento" />
                </SelectTrigger>
                <SelectContent>
                  {library.data?.map((m) => (
                    <SelectItem key={m.id} value={String(m.id)}>
                      {m.name} {m.type ? `(${m.type})` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="customMedName">Nome</Label>
                <Input
                  id="customMedName"
                  value={customMedName}
                  onChange={(e) => setCustomMedName(e.target.value)}
                  placeholder="Nome do medicamento"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="customMedType">Tipo</Label>
                <Input
                  id="customMedType"
                  value={customMedType}
                  onChange={(e) => setCustomMedType(e.target.value)}
                  placeholder="Ex: comprimido, xarope..."
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosagem</Label>
              <Input
                id="dosage"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="Ex: 10mg 2x/dia"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequência</Label>
              <Input
                id="frequency"
                value={frequency}
                onChange={(e) => setFrequency(e.target.value)}
                placeholder="Ex: 12/12h"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="startDate">Início</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="endDate">Término</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="medNotes">Observações</Label>
            <Textarea
              id="medNotes"
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
            <Button type="submit" disabled={addMedication.isPending}>
              {addMedication.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
