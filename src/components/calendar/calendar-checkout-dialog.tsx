"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LogOut } from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { format } from "date-fns";

interface CalendarCheckoutDialogProps {
  petId: number;
  petName: string;
  onSuccess: () => void;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CalendarCheckoutDialog({
  petId,
  petName,
  onSuccess,
  open,
  onOpenChange,
}: CalendarCheckoutDialogProps) {
  const [time, setTime] = useState(() =>
    format(new Date(), "HH:mm")
  );
  const [notes, setNotes] = useState("");

  const checkOutMutation = trpc.checkin.checkOut.useMutation({
    onSuccess: () => {
      onOpenChange(false);
      setNotes("");
      setTime(format(new Date(), "HH:mm"));
      onSuccess();
    },
  });

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    checkOutMutation.mutate({
      petId,
      notes: notes.trim() || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <LogOut className="h-5 w-5 text-muted-foreground" />
              Check-out
            </DialogTitle>
            <DialogDescription>
              Registre a saída de <strong>{petName}</strong> da creche.
            </DialogDescription>
          </DialogHeader>

          <div className="mt-4 space-y-4">
            <div className="rounded-xl border border-border/40 bg-muted/30 px-4 py-3">
              <p className="text-sm text-muted-foreground">Pet</p>
              <p className="text-sm font-medium text-foreground">{petName}</p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkout-time">Horário</Label>
              <Input
                id="checkout-time"
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="checkout-notes">Observações</Label>
              <Textarea
                id="checkout-notes"
                placeholder="Observações sobre o check-out..."
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
              onClick={() => onOpenChange(false)}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={checkOutMutation.isPending}
            >
              {checkOutMutation.isPending
                ? "Registrando..."
                : "Confirmar check-out"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
