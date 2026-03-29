"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LogIn } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { format } from "date-fns";

interface CalendarCheckinDialogProps {
  onSuccess: () => void;
  pets: Array<{ id: number; name: string }>;
}

export function CalendarCheckinDialog({
  onSuccess,
  pets,
}: CalendarCheckinDialogProps) {
  const [open, setOpen] = useState(false);
  const [petId, setPetId] = useState<string>("");
  const [time, setTime] = useState(() =>
    format(new Date(), "HH:mm")
  );
  const [notes, setNotes] = useState("");

  const checkInMutation = trpc.checkin.checkIn.useMutation({
    onSuccess: () => {
      setOpen(false);
      resetForm();
      onSuccess();
    },
  });

  function resetForm() {
    setPetId("");
    setTime(format(new Date(), "HH:mm"));
    setNotes("");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!petId) return;

    checkInMutation.mutate({
      petId: Number(petId),
      notes: notes.trim() || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="gap-1.5">
          <LogIn className="h-4 w-4" />
          Check-in
        </Button>
      </DialogTrigger>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Novo Check-in</DialogTitle>
            <DialogDescription>
              Registre a entrada de um pet na creche.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="checkin-pet">Pet</Label>
              <Select value={petId} onValueChange={setPetId}>
                <SelectTrigger id="checkin-pet">
                  <SelectValue placeholder="Selecione o pet" />
                </SelectTrigger>
                <SelectContent>
                  {pets.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id.toString()}>
                      {pet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkin-time">Horário</Label>
              <Input
                id="checkin-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkin-notes">Observações</Label>
              <Textarea
                id="checkin-notes"
                placeholder="Observações sobre o check-in..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                maxLength={500}
              />
            </div>
          </div>

          <DialogFooter className="mt-6">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={!petId || checkInMutation.isPending}
            >
              {checkInMutation.isPending ? "Registrando..." : "Confirmar check-in"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
