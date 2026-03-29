"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { AddBehaviorDialog } from "./dialogs/add-behavior-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SourceBadge } from "./source-badge";
import { Brain, Plus, Trash2, Calendar, PawPrint } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

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
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.behavior.byPet.useQuery({ petId });

  const deleteBehavior = trpc.behavior.delete.useMutation({
    onSuccess: () => {
      toast.success("Registro removido com sucesso");
      utils.behavior.byPet.invalidate({ petId });
    },
    onError: (err) => toast.error(err.message),
  });

  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDeleteId, setPendingDeleteId] = useState<number | null>(null);

  function handleDeleteClick(id: number) {
    setPendingDeleteId(id);
    setConfirmOpen(true);
  }

  function handleConfirmDelete() {
    if (pendingDeleteId === null) return;
    deleteBehavior.mutate({ id: pendingDeleteId });
    setConfirmOpen(false);
    setPendingDeleteId(null);
  }

  function handleBehaviorSuccess() {
    utils.behavior.byPet.invalidate({ petId });
  }

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
      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirmar remoção"
        description="Tem certeza que deseja remover este registro de comportamento? Esta ação não pode ser desfeita."
        confirmLabel="Remover"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={deleteBehavior.isPending}
      />

      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Registros de Comportamento
          </CardTitle>
          <AddBehaviorDialog petId={petId} onSuccess={handleBehaviorSuccess} />
        </div>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <div className="space-y-3">
            {data.map((log) => (
              <div
                key={log.id}
                className="p-3 rounded-lg border text-sm transition-all duration-200 hover:bg-muted/50"
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive transition-colors duration-200"
                      onClick={() => handleDeleteClick(log.id)}
                    >
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
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <div className="relative mb-4">
              <PawPrint className="h-16 w-16 text-muted-foreground/20" />
              <Brain className="h-7 w-7 text-muted-foreground/40 absolute -bottom-1 -right-1" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              Nenhum registro de comportamento ainda
            </p>
            <p className="text-xs text-muted-foreground/70 mt-1 max-w-[280px]">
              Comece registrando o primeiro dia do pet na creche. Acompanhe socialização, energia e obediência ao longo do tempo.
            </p>
            <AddBehaviorDialog petId={petId} onSuccess={handleBehaviorSuccess}>
              <Button variant="outline" size="sm" className="mt-4 gap-1.5 transition-all duration-200">
                <Plus className="h-3.5 w-3.5" /> Registrar primeiro dia
              </Button>
            </AddBehaviorDialog>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
