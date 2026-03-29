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
import { Loader2 } from "lucide-react";

interface AssignPlanDialogProps {
  petId: number;
  onSuccess?: () => void;
  children?: React.ReactNode;
}

export function AssignPlanDialog({ petId, onSuccess, children }: AssignPlanDialogProps) {
  const [open, setOpen] = useState(false);
  const [planId, setPlanId] = useState("");
  const [customName, setCustomName] = useState("");
  const [customDays, setCustomDays] = useState("");
  const [customPrice, setCustomPrice] = useState("");
  const [startDate, setStartDate] = useState(() => new Date().toISOString().split("T")[0]);
  const [renewalDay, setRenewalDay] = useState("");
  const [notes, setNotes] = useState("");

  const plansQuery = trpc.plansManagement.listPlans.useQuery(undefined, { enabled: open });

  const assignToPet = trpc.plansManagement.assignToPet.useMutation({
    onSuccess: () => {
      toast.success("Plano vinculado com sucesso!");
      setOpen(false);
      resetForm();
      onSuccess?.();
    },
    onError: (err) => toast.error(err.message),
  });

  const selectedPlan = plansQuery.data?.find((p) => String(p.id) === planId);

  function resetForm() {
    setPlanId("");
    setCustomName("");
    setCustomDays("");
    setCustomPrice("");
    setStartDate(new Date().toISOString().split("T")[0]);
    setRenewalDay("");
    setNotes("");
  }

  function handlePlanChange(value: string) {
    setPlanId(value);
    const plan = plansQuery.data?.find((p) => String(p.id) === value);
    if (plan) {
      setCustomDays(String(plan.includedDays));
      setCustomPrice(String(plan.price / 100));
    }
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!planId) {
      toast.error("Selecione um plano");
      return;
    }
    assignToPet.mutate({
      petId,
      planId: Number(planId),
      customName: customName || undefined,
      customDays: customDays ? Number(customDays) : undefined,
      customPrice: customPrice ? Math.round(Number(customPrice) * 100) : undefined,
      startDate: startDate || undefined,
      renewalDay: renewalDay ? Number(renewalDay) : undefined,
      notes: notes || undefined,
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children || (
          <Button size="sm" variant="outline">
            Vincular Plano
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Vincular Plano ao Pet</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="planId">Plano</Label>
            <Select value={planId} onValueChange={handlePlanChange}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o plano" />
              </SelectTrigger>
              <SelectContent>
                {plansQuery.data?.map((plan) => (
                  <SelectItem key={plan.id} value={String(plan.id)}>
                    {plan.name} — {plan.includedDays} dias — R$ {(plan.price / 100).toFixed(2)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedPlan && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customName">Nome personalizado</Label>
                  <Input
                    id="customName"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder={selectedPlan.name}
                    maxLength={100}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customDays">Dias inclusos</Label>
                  <Input
                    id="customDays"
                    type="number"
                    min={0}
                    value={customDays}
                    onChange={(e) => setCustomDays(e.target.value)}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customPrice">Preço (R$)</Label>
                  <Input
                    id="customPrice"
                    type="number"
                    min={0}
                    step="0.01"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="startDate">Data de início</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="renewalDay">Dia de renovação (1-31)</Label>
                <Input
                  id="renewalDay"
                  type="number"
                  min={1}
                  max={31}
                  value={renewalDay}
                  onChange={(e) => setRenewalDay(e.target.value)}
                  placeholder="Ex: 10"
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
                  maxLength={1000}
                />
              </div>
            </>
          )}

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={assignToPet.isPending || !planId}>
              {assignToPet.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Vincular
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
