"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Activity } from "lucide-react";
import Link from "next/link";

export function OccupancyCard() {
  const { data, isLoading } = trpc.occupancy.current.useQuery(undefined, {
    staleTime: 30 * 1000,
  });

  if (isLoading || !data) {
    return (
      <Card className="bg-card border-border">
        <CardHeader className="pb-2">
          <CardTitle className="text-muted-foreground text-sm font-medium uppercase tracking-wider flex justify-between">
            Ocupação <Activity className="h-4 w-4 text-primary" />
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-24 animate-pulse rounded-lg bg-muted" />
        </CardContent>
      </Card>
    );
  }

  const { maxCapacity, count, pets, occupancyPercent } = data;
  const percentage = occupancyPercent;

  const barColor =
    percentage > 90
      ? "bg-destructive"
      : percentage >= 70
        ? "bg-yellow-500"
        : "bg-emerald-500";

  const statusLabel =
    percentage > 90
      ? "Lotação Alta"
      : percentage >= 70
        ? "Lotação Média"
        : "Lotação Normal";

  const statusClass =
    percentage > 90
      ? "text-destructive"
      : percentage >= 70
        ? "text-yellow-600 dark:text-yellow-400"
        : "text-emerald-600 dark:text-emerald-400";

  const maxVisible = 5;
  const visiblePets = pets.slice(0, maxVisible);
  const remaining = pets.length - maxVisible;

  return (
    <Card className="bg-card border-border">
      <CardHeader className="pb-2">
        <CardTitle className="text-muted-foreground text-sm font-medium uppercase tracking-wider flex justify-between">
          Ocupação <Activity className="h-4 w-4 text-primary" />
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Barra de progresso */}
        <div>
          <div className="flex justify-between items-baseline mb-1.5">
            <span className="text-2xl font-bold text-foreground">
              {count}/{maxCapacity}
            </span>
            <span className={`text-sm font-semibold ${statusClass}`}>
              {statusLabel} ({percentage}%)
            </span>
          </div>
          <div className="h-3 w-full rounded-full bg-muted overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-500 ${barColor}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>

        {/* Lista compacta de pets */}
        {visiblePets.length > 0 && (
          <div className="flex flex-wrap items-center gap-2">
            {visiblePets.map((pet) => (
              <div
                key={pet.id}
                className="flex items-center gap-1.5 rounded-full bg-muted/60 pl-1 pr-2.5 py-0.5"
              >
                <Avatar className="h-5 w-5">
                  {pet.photoUrl && <AvatarImage src={pet.photoUrl} alt={pet.name} />}
                  <AvatarFallback className="text-[10px] bg-primary/10 text-primary font-bold">
                    {pet.name[0]}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs font-medium text-foreground truncate max-w-[80px]">
                  {pet.name}
                </span>
              </div>
            ))}
            {remaining > 0 && (
              <span className="text-xs text-muted-foreground font-medium">
                +{remaining} mais
              </span>
            )}
          </div>
        )}

        {/* Link */}
        <Link
          href="/admin/occupancy"
          className="block text-sm font-medium text-primary hover:text-primary/80 transition-colors"
        >
          Ver mapa completo &rarr;
        </Link>
      </CardContent>
    </Card>
  );
}
