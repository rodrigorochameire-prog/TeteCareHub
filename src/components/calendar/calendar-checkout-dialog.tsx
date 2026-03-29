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
import { Checkbox } from "@/components/ui/checkbox";
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
  const [selectedActivities, setSelectedActivities] = useState<number[]>([]);
  const [customActivity, setCustomActivity] = useState("");

  const activitiesList = trpc.activities.list.useQuery(undefined, { enabled: open });

  const checkOutMutation = trpc.checkin.checkOut.useMutation({
    onSuccess: () => {
      // Após checkout, registrar atividades se houver alguma selecionada
      const hasActivities = selectedActivities.length > 0 || customActivity.trim();
      if (hasActivities) {
        const activityEntries = selectedActivities.map((id) => ({
          activityId: id,
        }));
        if (customActivity.trim()) {
          activityEntries.push({ activityId: undefined as unknown as number });
        }

        const activitiesPayload: Array<{ activityId?: number; customName?: string }> =
          selectedActivities.map((id) => ({ activityId: id }));
        if (customActivity.trim()) {
          activitiesPayload.push({ customName: customActivity.trim() });
        }

        logMultiple.mutate({
          petId,
          logDate: new Date().toISOString().split("T")[0],
          activities: activitiesPayload,
        });
      } else {
        resetAndClose();
      }
    },
  });

  const logMultiple = trpc.activities.logMultiple.useMutation({
    onSuccess: () => {
      resetAndClose();
    },
    onError: () => {
      // Checkout já foi feito, apenas fechar
      resetAndClose();
    },
  });

  function resetAndClose() {
    onOpenChange(false);
    setNotes("");
    setTime(format(new Date(), "HH:mm"));
    setSelectedActivities([]);
    setCustomActivity("");
    onSuccess();
  }

  function toggleActivity(activityId: number) {
    setSelectedActivities((prev) =>
      prev.includes(activityId)
        ? prev.filter((id) => id !== activityId)
        : [...prev, activityId]
    );
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    checkOutMutation.mutate({
      petId,
      notes: notes.trim() || undefined,
    });
  }

  const isSubmitting = checkOutMutation.isPending || logMultiple.isPending;

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

            {/* Atividades do dia */}
            <div className="space-y-2">
              <Label>Atividades do dia</Label>
              <div className="rounded-lg border border-border/40 p-3 space-y-2">
                {activitiesList.isLoading ? (
                  <p className="text-xs text-muted-foreground">Carregando atividades...</p>
                ) : activitiesList.data && activitiesList.data.length > 0 ? (
                  <div className="grid grid-cols-2 gap-2">
                    {activitiesList.data.map((activity) => (
                      <label
                        key={activity.id}
                        className="flex items-center gap-2 text-sm cursor-pointer"
                      >
                        <Checkbox
                          checked={selectedActivities.includes(activity.id)}
                          onCheckedChange={() => toggleActivity(activity.id)}
                        />
                        <span className="text-foreground">{activity.name}</span>
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-muted-foreground">Nenhuma atividade cadastrada</p>
                )}
                <div className="pt-2 border-t border-border/40">
                  <Input
                    placeholder="Outra atividade:"
                    value={customActivity}
                    onChange={(e) => setCustomActivity(e.target.value)}
                    maxLength={100}
                    className="text-sm"
                  />
                </div>
              </div>
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
              disabled={isSubmitting}
            >
              {isSubmitting
                ? "Registrando..."
                : "Confirmar check-out"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
