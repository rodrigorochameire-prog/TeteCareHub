"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { UtensilsCrossed, Plus, Package, Cookie, Leaf } from "lucide-react";

interface PetFoodTabProps {
  petId: number;
  role: "admin" | "tutor";
}

const FOOD_TYPE_LABELS: Record<string, string> = {
  dry: "Racao seca",
  wet: "Racao umida",
  natural: "Alimentacao natural",
  mixed: "Mista",
};

export function PetFoodTab({ petId, role }: PetFoodTabProps) {
  const plan = trpc.food.getPlanByPet.useQuery({ petId });
  const treats = trpc.food.getTreatsByPet.useQuery({ petId });
  const naturalFood = trpc.food.getNaturalFoodByPet.useQuery({ petId });
  const inventory = trpc.food.getInventoryByPet.useQuery({ petId });

  const isLoading = plan.isLoading || treats.isLoading || naturalFood.isLoading || inventory.isLoading;

  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-6 w-32 mb-4" />
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Plano Alimentar */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <UtensilsCrossed className="h-4 w-4" />
              Plano Alimentar
            </CardTitle>
            <Button variant="outline" size="sm" className="gap-1">
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
                <span className="text-muted-foreground">Quantidade diaria</span>
                <span>{plan.data.dailyAmount}g</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Porcoes por dia</span>
                <span>{plan.data.portionsPerDay}x</span>
              </div>
              {plan.data.notes && (
                <div className="pt-2 border-t">
                  <p className="text-muted-foreground text-xs mb-1">Observacoes</p>
                  <p>{plan.data.notes}</p>
                </div>
              )}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum plano alimentar cadastrado.
            </p>
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
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="h-3.5 w-3.5" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {inventory.data && inventory.data.length > 0 ? (
            <div className="space-y-3">
              {inventory.data.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border text-sm">
                  <div>
                    <p className="font-medium">{item.brand}</p>
                    {item.productName && (
                      <p className="text-xs text-muted-foreground">{item.productName}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-0.5">
                      Restante: {item.quantityRemaining}g de {item.quantityReceived}g
                    </p>
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
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum estoque registrado.
            </p>
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
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="h-3.5 w-3.5" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {treats.data && treats.data.length > 0 ? (
            <div className="space-y-3">
              {treats.data.map((treat) => (
                <div key={treat.id} className="flex items-center justify-between p-3 rounded-lg border text-sm">
                  <div>
                    <p className="font-medium">{treat.name}</p>
                    {treat.brand && (
                      <p className="text-xs text-muted-foreground">{treat.brand}</p>
                    )}
                    {treat.frequency && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Frequencia: {treat.frequency}
                      </p>
                    )}
                  </div>
                  {treat.acceptance && (
                    <Badge
                      variant={treat.acceptance === "loved" ? "success" : treat.acceptance === "liked" ? "info" : "secondary"}
                      className="text-[10px]"
                    >
                      {treat.acceptance === "loved" ? "Adora" : treat.acceptance === "liked" ? "Gosta" : treat.acceptance === "neutral" ? "Neutro" : "Nao gosta"}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum petisco registrado.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Alimentacao Natural */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Alimentacao Natural
            </CardTitle>
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="h-3.5 w-3.5" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {naturalFood.data && naturalFood.data.length > 0 ? (
            <div className="space-y-3">
              {naturalFood.data.map((food) => (
                <div key={food.id} className="flex items-center justify-between p-3 rounded-lg border text-sm">
                  <div>
                    <p className="font-medium">{food.name}</p>
                    {food.proteinSource && (
                      <p className="text-xs text-muted-foreground">
                        Proteina: {food.proteinSource}
                      </p>
                    )}
                    {food.frequency && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Frequencia: {food.frequency}
                      </p>
                    )}
                  </div>
                  {food.acceptance && (
                    <Badge
                      variant={food.acceptance === "loved" ? "success" : food.acceptance === "liked" ? "info" : "secondary"}
                      className="text-[10px]"
                    >
                      {food.acceptance === "loved" ? "Adora" : food.acceptance === "liked" ? "Gosta" : food.acceptance === "neutral" ? "Neutro" : "Nao gosta"}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma alimentacao natural registrada.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
