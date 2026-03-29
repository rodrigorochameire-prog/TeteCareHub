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
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-muted-foreground">
          {remaining}g de {total}g
        </span>
        <span className="font-medium">{pct}%</span>
      </div>
      <div className="h-2 w-full rounded-full bg-muted/40 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${color}`}
          style={{ width: `${Math.max(pct, 2)}%` }}
        />
      </div>
    </div>
  );
}

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
            </div>
          ) : (
            <div className="text-center py-8">
              <UtensilsCrossed className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum plano alimentar cadastrado.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Crie um plano para controlar a alimentação.
              </p>
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
                <div key={item.id} className="p-3 rounded-lg border text-sm space-y-2">
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
            <div className="text-center py-8">
              <Package className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum estoque registrado.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Controle o estoque de ração e suplementos.
              </p>
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
                        Frequência: {treat.frequency}
                      </p>
                    )}
                  </div>
                  {treat.acceptance && (
                    <Badge
                      variant={treat.acceptance === "loved" ? "success" : treat.acceptance === "liked" ? "info" : "secondary"}
                      className="text-[10px]"
                    >
                      {treat.acceptance === "loved" ? "Adora" : treat.acceptance === "liked" ? "Gosta" : treat.acceptance === "neutral" ? "Neutro" : "Não gosta"}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Cookie className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum petisco registrado.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Registre petiscos favoritos e preferências.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alimentacao Natural */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Leaf className="h-4 w-4" />
              Alimentação Natural
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
                        Proteína: {food.proteinSource}
                      </p>
                    )}
                    {food.frequency && (
                      <p className="text-xs text-muted-foreground mt-0.5">
                        Frequência: {food.frequency}
                      </p>
                    )}
                  </div>
                  {food.acceptance && (
                    <Badge
                      variant={food.acceptance === "loved" ? "success" : food.acceptance === "liked" ? "info" : "secondary"}
                      className="text-[10px]"
                    >
                      {food.acceptance === "loved" ? "Adora" : food.acceptance === "liked" ? "Gosta" : food.acceptance === "neutral" ? "Neutro" : "Não gosta"}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Leaf className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma alimentação natural registrada.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Registre dietas naturais e ingredientes.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
