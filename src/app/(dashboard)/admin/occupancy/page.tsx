"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  LayoutGrid,
  Users,
  DoorOpen,
  Hotel,
  Settings2,
} from "lucide-react";
import { OccupancyGrid } from "@/components/occupancy/occupancy-grid";
import {
  CalendarCheckinDialog,
  CalendarCheckoutDialog,
} from "@/components/calendar";

export default function OccupancyPage() {
  const utils = trpc.useUtils();

  const { data: currentData, isLoading: loadingCurrent } =
    trpc.occupancy.current.useQuery(undefined, { staleTime: 15 * 1000 });
  const { data: capacityData } = trpc.occupancy.getCapacity.useQuery();
  const { data: allPets } = trpc.pets.list.useQuery({ approvalStatus: "approved" });

  // Dialog de capacidade
  const [capacityDialogOpen, setCapacityDialogOpen] = useState(false);
  const [newCapacity, setNewCapacity] = useState("");

  // Dialog de checkout
  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [checkoutPet, setCheckoutPet] = useState<{
    id: number;
    name: string;
  } | null>(null);

  const setCapacityMutation = trpc.occupancy.setCapacity.useMutation({
    onSuccess: () => {
      utils.occupancy.current.invalidate();
      utils.occupancy.getCapacity.invalidate();
      setCapacityDialogOpen(false);
      setNewCapacity("");
    },
  });

  function handleRefresh() {
    utils.occupancy.current.invalidate();
  }

  function handleCheckinSuccess() {
    utils.occupancy.current.invalidate();
    utils.dashboard.checkedInPets.invalidate();
  }

  function handleCheckoutTrigger(petId: number, petName: string) {
    setCheckoutPet({ id: petId, name: petName });
    setCheckoutOpen(true);
  }

  function handleCheckoutSuccess() {
    setCheckoutOpen(false);
    setCheckoutPet(null);
    utils.occupancy.current.invalidate();
    utils.dashboard.checkedInPets.invalidate();
  }

  function handleSetCapacity(e: React.FormEvent) {
    e.preventDefault();
    const val = parseInt(newCapacity, 10);
    if (isNaN(val) || val < 1) return;
    setCapacityMutation.mutate({ maxCapacity: val });
  }

  const capacity = currentData?.maxCapacity ?? capacityData?.maxCapacity ?? 15;
  const occupied = currentData?.count ?? 0;
  const available = currentData?.availableSpots ?? 0;
  const percentage = currentData?.occupancyPercent ?? 0;

  // Pets que ainda nao fizeram check-in (para o dialog)
  const checkedInIds = new Set(currentData?.pets.map((p) => p.id) ?? []);
  const availablePetsForCheckin = (allPets ?? [])
    .filter((p) => !checkedInIds.has(p.id))
    .map((p) => ({ id: p.id, name: p.name }));

  if (loadingCurrent) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-7 w-7 text-primary" />
          <h1 className="text-2xl font-bold text-foreground">Ocupação</h1>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="bg-card border-border">
              <CardContent className="p-4">
                <div className="h-16 animate-pulse rounded bg-muted" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="h-64 animate-pulse rounded-xl bg-muted" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <LayoutGrid className="h-7 w-7 text-primary" />
          <div>
            <h1 className="text-2xl font-bold text-foreground">Ocupação</h1>
            <p className="text-sm text-muted-foreground">
              Mapa visual de vagas da creche
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setNewCapacity(String(capacity));
              setCapacityDialogOpen(true);
            }}
          >
            <Settings2 className="mr-1.5 h-4 w-4" />
            Alterar capacidade
          </Button>
          <CalendarCheckinDialog
            onSuccess={handleCheckinSuccess}
            pets={availablePetsForCheckin}
          />
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium uppercase">
                Capacidade
              </span>
              <LayoutGrid className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground mt-2">
              {capacity}
            </div>
            <div className="text-xs text-muted-foreground">vagas totais</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium uppercase">
                Ocupados
              </span>
              <Users className="h-4 w-4 text-primary" />
            </div>
            <div className="text-2xl font-bold text-foreground mt-2">
              {occupied}
            </div>
            <div className="text-xs text-muted-foreground">
              {percentage}% de ocupação
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium uppercase">
                Livres
              </span>
              <DoorOpen className="h-4 w-4 text-emerald-500" />
            </div>
            <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400 mt-2">
              {available}
            </div>
            <div className="text-xs text-muted-foreground">vagas disponíveis</div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <span className="text-muted-foreground text-xs font-medium uppercase">
                Hospedados
              </span>
              <Hotel className="h-4 w-4 text-blue-500" />
            </div>
            <div className="text-2xl font-bold text-foreground mt-2">
              {occupied}
            </div>
            <div className="text-xs text-muted-foreground">pets na creche</div>
          </CardContent>
        </Card>
      </div>

      {/* Grid visual */}
      <Card className="bg-card border-border">
        <CardHeader>
          <CardTitle className="text-foreground text-base">
            Mapa de Vagas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <OccupancyGrid
            capacity={capacity}
            pets={(currentData?.pets ?? []).map((p) => ({
              id: p.id,
              name: p.name,
              photoUrl: p.photoUrl,
              checkinTime: p.updatedAt,
            }))}
            onCheckin={() => {
              /* CalendarCheckinDialog é trigger-based, o botão no header abre */
            }}
            onCheckout={handleCheckoutTrigger}
          />
        </CardContent>
      </Card>

      {/* Check-out dialog */}
      {checkoutPet && (
        <CalendarCheckoutDialog
          petId={checkoutPet.id}
          petName={checkoutPet.name}
          open={checkoutOpen}
          onOpenChange={(open) => {
            setCheckoutOpen(open);
            if (!open) setCheckoutPet(null);
          }}
          onSuccess={handleCheckoutSuccess}
        />
      )}

      {/* Alterar capacidade dialog */}
      <Dialog open={capacityDialogOpen} onOpenChange={setCapacityDialogOpen}>
        <DialogContent>
          <form onSubmit={handleSetCapacity}>
            <DialogHeader>
              <DialogTitle>Alterar Capacidade</DialogTitle>
              <DialogDescription>
                Defina a capacidade máxima de pets na creche.
              </DialogDescription>
            </DialogHeader>
            <div className="mt-4 space-y-2">
              <Label htmlFor="new-capacity">Nova capacidade</Label>
              <Input
                id="new-capacity"
                type="number"
                min={1}
                max={200}
                value={newCapacity}
                onChange={(e) => setNewCapacity(e.target.value)}
                placeholder="Ex: 30"
              />
            </div>
            <DialogFooter className="mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => setCapacityDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={
                  setCapacityMutation.isPending ||
                  !newCapacity ||
                  parseInt(newCapacity, 10) < 1
                }
              >
                {setCapacityMutation.isPending
                  ? "Salvando..."
                  : "Salvar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
