"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { UtensilsCrossed, Plus, Package, Cookie, Leaf, AlertTriangle, Clock, Trash2 } from "lucide-react";
import { toast } from "sonner";

interface PetFoodTabProps {
  petId: number;
  role: "admin" | "tutor";
}

const FOOD_TYPE_LABELS: Record<string, string> = {
  dry: "Ração seca",
  wet: "Ração úmida",
  natural: "Alimentação natural",
  mixed: "Mista",
};

function StockBar({ remaining, total }: { remaining: number; total: number }) {
  const pct = total > 0 ? Math.round((remaining / total) * 100) : 0;
  const color =
    pct <= 0
      ? "bg-red-500"
      : pct < 20
        ? "bg-amber-500"
        : pct < 50
          ? "bg-sky-500"
          : "bg-emerald-500";

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {remaining}g de {total}g
        </span>
        <div className="flex items-center gap-1.5">
          {pct > 0 && pct < 20 && (
            <AlertTriangle className="h-3 w-3 text-amber-500" />
          )}
          <span className="font-medium">{pct}%</span>
        </div>
      </div>
      <div className="h-2.5 w-full rounded-full bg-muted/40 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
      {pct > 0 && pct < 20 && (
        <Badge variant="warning" className="text-[10px] gap-1">
          <AlertTriangle className="h-3 w-3" />
          Estoque baixo
        </Badge>
      )}
    </div>
  );
}

/** Generate meal schedule times based on portions per day */
function MealSchedule({ portionsPerDay, dailyAmount }: { portionsPerDay: number; dailyAmount: number }) {
  const times: string[] = [];
  if (portionsPerDay === 1) times.push("08:00");
  else if (portionsPerDay === 2) times.push("08:00", "18:00");
  else if (portionsPerDay === 3) times.push("08:00", "13:00", "18:00");
  else if (portionsPerDay === 4) times.push("07:00", "11:00", "15:00", "19:00");
  else {
    for (let i = 0; i < portionsPerDay; i++) {
      const hour = 7 + Math.round((i * 12) / (portionsPerDay - 1 || 1));
      times.push(`${String(hour).padStart(2, "0")}:00`);
    }
  }

  const perMeal = Math.round(dailyAmount / portionsPerDay);

  return (
    <div className="mt-3 pt-3 border-t">
      <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
        <Clock className="h-3 w-3" />
        Horários sugeridos
      </p>
      <div className="flex items-center gap-2 overflow-x-auto">
        {times.map((time, i) => (
          <div key={i} className="flex flex-col items-center gap-1 min-w-[60px]">
            <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">{time}</span>
            </div>
            <span className="text-[10px] text-muted-foreground">{perMeal}g</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function PetFoodTab({ petId, role }: PetFoodTabProps) {
  const router = useRouter();
  const utils = trpc.useUtils();

  const plan = trpc.food.getPlanByPet.useQuery({ petId });
  const treats = trpc.food.getTreatsByPet.useQuery({ petId });
  const naturalFood = trpc.food.getNaturalFoodByPet.useQuery({ petId });
  const inventory = trpc.food.getInventoryByPet.useQuery({ petId });

  // Delete mutations
  const removeTreat = trpc.food.removeTreat.useMutation({
    onSuccess: () => {
      toast.success("Petisco removido com sucesso");
      utils.food.getTreatsByPet.invalidate({ petId });
    },
    onError: (err) => toast.error(err.message),
  });

  const removeNaturalFood = trpc.food.removeNaturalFood.useMutation({
    onSuccess: () => {
      toast.success("Alimentação natural removida com sucesso");
      utils.food.getNaturalFoodByPet.invalidate({ petId });
    },
    onError: (err) => toast.error(err.message),
  });

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    type: "treat" | "naturalFood";
    id: number;
    label: string;
  } | null>(null);

  function handleDeleteClick(type: "treat" | "naturalFood", id: number, label: string) {
    setPendingDelete({ type, id, label });
    setConfirmOpen(true);
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    switch (pendingDelete.type) {
      case "treat":
        removeTreat.mutate({ treatId: pendingDelete.id });
        break;
      case "naturalFood":
        removeNaturalFood.mutate({ naturalFoodId: pendingDelete.id });
        break;
    }
    setConfirmOpen(false);
    setPendingDelete(null);
  }

  const isDeleting = removeTreat.isPending || removeNaturalFood.isPending;
  const isLoading = plan.isLoading || treats.isLoading || naturalFood.isLoading || inventory.isLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-8 w-24" />
              </div>
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  function navigateToAdd() {
    router.push(`/admin/food?petId=${petId}`);
  }

  return (
    <div className="space-y-4">
      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirmar remoção"
        description={`Tem certeza que deseja remover "${pendingDelete?.label ?? ""}"? Esta ação não pode ser desfeita.`}
        confirmLabel="Remover"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={isDeleting}
      />

      {/* Plano Alimentar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4" />
              Plano Alimentar
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 transition-all duration-200 hover:bg-primary/5"
              onClick={navigateToAdd}
            >
              <Plus className="h-3.5 w-3.5" />
              {plan.data ? "Atualizar" : "Criar Plano"}
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {plan.data ? (
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tipo</span>
                <span>{FOOD_TYPE_LABELS[plan.data.foodType] ?? plan.data.foodType}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Marca</span>
                <span>{plan.data.brand}</span>
              </div>
              {plan.data.productName && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Produto</span>
                  <span>{plan.data.productName}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Quantidade diária</span>
                <span>{plan.data.dailyAmount}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Porções por dia</span>
                <span>{plan.data.portionsPerDay}x</span>
              </div>
              {plan.data.notes && (
                <div className="pt-2 border-t">
                  <p className="text-muted-foreground text-xs mb-1">Observações</p>
                  <p>{plan.data.notes}</p>
                </div>
              )}
              {/* Meal schedule visual */}
              <MealSchedule
                portionsPerDay={plan.data.portionsPerDay}
                dailyAmount={plan.data.dailyAmount}
              />
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <UtensilsCrossed className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">Nenhum plano alimentar cadastrado</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Crie um plano para controlar a alimentação.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 gap-1.5 transition-all duration-200"
                onClick={navigateToAdd}
              >
                <Plus className="h-3.5 w-3.5" /> Criar Plano
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Estoque */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Package className="h-4 w-4" />
              Estoque
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 transition-all duration-200 hover:bg-primary/5"
              onClick={navigateToAdd}
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {inventory.data && inventory.data.length > 0 ? (
            <div className="space-y-3">
              {inventory.data.map((item) => (
                <div key={item.id} className="p-3 rounded-lg border text-sm space-y-2 transition-all duration-200 hover:bg-muted/50">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">{item.brand}</p>
                      {item.productName && (
                        <p className="text-xs text-muted-foreground">{item.productName}</p>
                      )}
                    </div>
                    <Badge
                      variant={
                        (item.quantityRemaining ?? 0) <= 0
                          ? "destructive"
                          : (item.quantityRemaining ?? 0) < (item.quantityReceived ?? 1) * 0.2
                            ? "warning"
                            : "success"
                      }
                      className="text-[10px]"
                    >
                      {(item.quantityRemaining ?? 0) <= 0
                        ? "Vazio"
                        : `${Math.round(((item.quantityRemaining ?? 0) / (item.quantityReceived || 1)) * 100)}%`}
                    </Badge>
                  </div>
                  <StockBar
                    remaining={item.quantityRemaining ?? 0}
                    total={item.quantityReceived ?? 0}
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Package className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">Nenhum estoque registrado</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Controle o estoque de ração e suplementos.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 gap-1.5 transition-all duration-200"
                onClick={navigateToAdd}
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Petiscos */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Cookie className="h-4 w-4" />
              Petiscos
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 transition-all duration-200 hover:bg-primary/5"
              onClick={navigateToAdd}
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {treats.data && treats.data.length > 0 ? (
            <div className="space-y-3">
              {treats.data.map((treat) => (
                <div key={treat.id} className="flex items-center justify-between p-3 rounded-lg border text-sm transition-all duration-200 hover:bg-muted/50">
                  <div>
                    <p className="font-medium">{treat.name}</p>
                    {treat.brand && (
                      <p className="text-xs text-muted-foreground">{treat.brand}</p>
                    )}
                    {treat.frequency && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Frequência: {treat.frequency}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {treat.acceptance && (
                      <Badge
                        variant={treat.acceptance === "loved" ? "success" : treat.acceptance === "liked" ? "info" : "secondary"}
                        className="text-[10px]"
                      >
                        {treat.acceptance === "loved" ? "Adora" : treat.acceptance === "liked" ? "Gosta" : treat.acceptance === "neutral" ? "Neutro" : "Não gosta"}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive transition-colors duration-200"
                      onClick={() => handleDeleteClick("treat", treat.id, treat.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Cookie className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">Nenhum petisco registrado</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Registre petiscos favoritos e preferências.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 gap-1.5 transition-all duration-200"
                onClick={navigateToAdd}
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alimentação Natural */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Alimentação Natural
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 transition-all duration-200 hover:bg-primary/5"
              onClick={navigateToAdd}
            >
              <Plus className="h-3.5 w-3.5" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {naturalFood.data && naturalFood.data.length > 0 ? (
            <div className="space-y-3">
              {naturalFood.data.map((food) => (
                <div key={food.id} className="flex items-center justify-between p-3 rounded-lg border text-sm transition-all duration-200 hover:bg-muted/50">
                  <div>
                    <p className="font-medium">{food.name}</p>
                    {food.proteinSource && (
                      <p className="text-xs text-muted-foreground">
                        Proteína: {food.proteinSource}
                      </p>
                    )}
                    {food.frequency && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Frequência: {food.frequency}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    {food.acceptance && (
                      <Badge
                        variant={food.acceptance === "loved" ? "success" : food.acceptance === "liked" ? "info" : "secondary"}
                        className="text-[10px]"
                      >
                        {food.acceptance === "loved" ? "Adora" : food.acceptance === "liked" ? "Gosta" : food.acceptance === "neutral" ? "Neutro" : "Não gosta"}
                      </Badge>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive transition-colors duration-200"
                      onClick={() => handleDeleteClick("naturalFood", food.id, food.name)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Leaf className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">Nenhuma alimentação natural registrada</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Registre dietas naturais e ingredientes.</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-4 gap-1.5 transition-all duration-200"
                onClick={navigateToAdd}
              >
                <Plus className="h-3.5 w-3.5" /> Adicionar
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
