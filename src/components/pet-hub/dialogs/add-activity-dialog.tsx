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

interface AddActivityDialogProps {
  petId: number;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function AddActivityDialog({ petId, onSuccess, children }: AddActivityDialogProps) {
  const [open, setOpen] = useState(false);
  const [activityId, setActivityId] = useState("");
  const [customName, setCustomName] = useState("");
  const [logDate, setLogDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [notes, setNotes] = useState("");

  const activitiesList = trpc.activities.list.useQuery(undefined, { enabled: open });

  const logActivity = trpc.activities.logActivity.useMutation({
    onSuccess: () => {
      toast.success("Atividade registrada com sucesso!");
      setOpen(false);
      resetForm();
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message),
  });

  function resetForm() {
    setActivityId("");
    setCustomName("");
    setLogDate(new Date().toISOString().split("T")[0]);
    setNotes("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!activityId && !customName.trim()) {
      toast.error("Selecione uma atividade ou informe o nome");
      return;
    }
    logActivity.mutate({
      petId,
      activityId: activityId ? Number(activityId) : undefined,
      customName: customName.trim() || undefined,
      logDate,
      notes: notes.trim() || undefined,
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
          <DialogTitle>Registrar Atividade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="activityId">Atividade</Label>
            <Select value={activityId} onValueChange={(val) => { setActivityId(val); if (val) setCustomName(""); }}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma atividade" />
              </SelectTrigger>
              <SelectContent>
                {activitiesList.data?.map((a) => (
                  <SelectItem key={a.id} value={String(a.id)}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="customName">Ou informe o nome da atividade</Label>
            <Input
              id="customName"
              value={customName}
              onChange={(e) => { setCustomName(e.target.value); if (e.target.value) setActivityId(""); }}
              placeholder="Ex: Banho, Tosa..."
              maxLength={100}
            />
          </div>

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
            <Button type="submit" disabled={logActivity.isPending}>
              {logActivity.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
