"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SourceBadge } from "./source-badge";
import { Brain, Plus, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PetBehaviorTabProps {
  petId: number;
  role: "admin" | "tutor";
}

const LEVEL_LABELS: Record<string, { label: string; variant: "success" | "info" | "warning" | "destructive" | "secondary" }> = {
  excellent: { label: "Excelente", variant: "success" },
  good: { label: "Bom", variant: "info" },
  moderate: { label: "Moderado", variant: "warning" },
  poor: { label: "Ruim", variant: "destructive" },
  high: { label: "Alto", variant: "success" },
  normal: { label: "Normal", variant: "info" },
  low: { label: "Baixo", variant: "warning" },
  none: { label: "Nenhum", variant: "success" },
  mild: { label: "Leve", variant: "warning" },
  severe: { label: "Severo", variant: "destructive" },
  needs_work: { label: "Precisa melhorar", variant: "warning" },
};

function LevelBadge({ value, label }: { value: string | null; label: string }) {
  if (!value) return null;
  const info = LEVEL_LABELS[value] ?? { label: value, variant: "secondary" as const };
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground text-xs">{label}</span>
      <Badge variant={info.variant} className="text-[10px]">
        {info.label}
      </Badge>
    </div>
  );
}

export function PetBehaviorTab({ petId, role }: PetBehaviorTabProps) {
  const { data, isLoading } = trpc.behavior.byPet.useQuery({ petId });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <Skeleton className="h-5 w-48" />
            <Skeleton className="h-8 w-24" />
          </div>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-24 w-full rounded-lg" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Registros de Comportamento
          </CardTitle>
          <Button variant="outline" size="sm" className="gap-1">
            <Plus className="h-3.5 w-3.5" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <div className="space-y-3">
            {data.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg border text-sm"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="font-medium">
                      {format(new Date(log.logDate), "dd/MM/yyyy", { locale: ptBR })}
                    </span>
                    {String((log as Record<string, unknown>).source || "") !== "" && (
                      <SourceBadge source={(log as Record<string, unknown>).source as "admin" | "tutor"} />
                    )}
                  </div>
                  {(role === "admin" || (log as Record<string, unknown>).source === "tutor") && (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <LevelBadge value={log.socialization} label="Socialização" />
                  <LevelBadge value={log.energy} label="Energia" />
                  <LevelBadge value={log.obedience} label="Obediência" />
                  <LevelBadge value={log.anxiety} label="Ansiedade" />
                  <LevelBadge value={log.aggression} label="Agressividade" />
                </div>
                {log.activities && log.activities.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {log.activities.map((activity: string, i: number) => (
                      <Badge key={i} variant="secondary" className="text-[10px]">
                        {activity}
                      </Badge>
                    ))}
                  </div>
                )}
                {log.notes && (
                  <p className="text-xs text-muted-foreground mt-2 pt-2 border-t">
                    {log.notes}
                  </p>
                )}
                {log.createdBy && (
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Por: {log.createdBy.name}
                  </p>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Brain className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Nenhum registro de comportamento.</p>
            <p className="text-xs text-muted-foreground/60 mt-1">
              Acompanhe socialização, energia e obediência ao longo do tempo.
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
