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

interface AddEventDialogProps {
  petId: number;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

const EVENT_TYPES = [
  { value: "vaccine", label: "Vacina" },
  { value: "medication", label: "Medicamento" },
  { value: "grooming", label: "Banho/Tosa" },
  { value: "vet", label: "Veterinário" },
  { value: "training", label: "Adestramento" },
  { value: "checkin", label: "Check-in" },
  { value: "checkout", label: "Check-out" },
  { value: "custom", label: "Outro" },
] as const;

export function AddEventDialog({ petId, onSuccess, children }: AddEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [eventType, setEventType] = useState("");
  const [eventDate, setEventDate] = useState(() => {
    const now = new Date();
    return now.toISOString().slice(0, 16);
  });
  const [isAllDay, setIsAllDay] = useState(true);
  const [description, setDescription] = useState("");
  const [location, setLocation] = useState("");
  const [reminderMinutes, setReminderMinutes] = useState("");

  const createEvent = trpc.calendar.create.useMutation({
    onSuccess: () => {
      toast.success("Evento criado com sucesso!");
      setOpen(false);
      resetForm();
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message),
  });

  function resetForm() {
    setTitle("");
    setEventType("");
    const now = new Date();
    setEventDate(now.toISOString().slice(0, 16));
    setIsAllDay(true);
    setDescription("");
    setLocation("");
    setReminderMinutes("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim()) {
      toast.error("Informe o título do evento");
      return;
    }
    if (!eventType) {
      toast.error("Selecione o tipo de evento");
      return;
    }

    // Build ISO datetime string
    let dateStr = eventDate;
    if (isAllDay && dateStr.length === 10) {
      dateStr = `${dateStr}T00:00:00.000Z`;
    } else if (!dateStr.includes("T")) {
      dateStr = `${dateStr}T00:00:00.000Z`;
    } else {
      // Ensure it's a valid ISO datetime
      dateStr = new Date(dateStr).toISOString();
    }

    createEvent.mutate({
      title: title.trim(),
      eventType,
      eventDate: dateStr,
      petId,
      isAllDay,
      description: description || undefined,
      location: location || undefined,
      reminderMinutes: reminderMinutes ? Number(reminderMinutes) : undefined,
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
          <DialogTitle>Novo Evento</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex: Consulta veterinária..."
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="eventType">Tipo</Label>
            <Select value={eventType} onValueChange={setEventType}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o tipo" />
              </SelectTrigger>
              <SelectContent>
                {EVENT_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="eventDate">Data/hora</Label>
              <Input
                id="eventDate"
                type={isAllDay ? "date" : "datetime-local"}
                value={isAllDay ? eventDate.slice(0, 10) : eventDate}
                onChange={(e) => setEventDate(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="isAllDay">Dia inteiro</Label>
              <Select
                value={isAllDay ? "yes" : "no"}
                onValueChange={(v) => setIsAllDay(v === "yes")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="yes">Sim</SelectItem>
                  <SelectItem value="no">Não</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="location">Local</Label>
              <Input
                id="location"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Opcional"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reminderMinutes">Lembrete (min antes)</Label>
              <Input
                id="reminderMinutes"
                type="number"
                min={0}
                value={reminderMinutes}
                onChange={(e) => setReminderMinutes(e.target.value)}
                placeholder="30"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Descrição</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              placeholder="Descrição opcional..."
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={createEvent.isPending}>
              {createEvent.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Salvar
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
