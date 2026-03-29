"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { AddTrainingDialog } from "./dialogs/add-training-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { SourceBadge } from "./source-badge";
import { GraduationCap, Plus, Trash2, Calendar, Target } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

interface PetTrainingTabProps {
  petId: number;
  role: "admin" | "tutor";
}

const STATUS_MAP: Record<string, { label: string; variant: "success" | "info" | "warning" }> = {
  mastered: { label: "Dominado", variant: "success" },
  practicing: { label: "Praticando", variant: "info" },
  learning: { label: "Aprendendo", variant: "warning" },
};

const CATEGORY_MAP: Record<string, string> = {
  obedience: "Obediência",
  socialization: "Socialização",
  behavior: "Comportamento",
  agility: "Agilidade",
  tricks: "Truques",
};

/** Visual skills matrix -- colored circles per status */
function SkillsMatrix({ data }: { data: Array<{ command: string; status: string; category: string }> }) {
  // Group by category
  const grouped: Record<string, Array<{ command: string; status: string }>> = {};
  for (const item of data) {
    const cat = CATEGORY_MAP[item.category] ?? item.category;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push({ command: item.command, status: item.status });
  }

  // Deduplicate commands within each category, keeping the best status
  const statusPriority: Record<string, number> = { mastered: 3, practicing: 2, learning: 1 };
  for (const cat of Object.keys(grouped)) {
    const seen = new Map<string, { command: string; status: string }>();
    for (const item of grouped[cat]) {
      const existing = seen.get(item.command);
      if (!existing || (statusPriority[item.status] ?? 0) > (statusPriority[existing.status] ?? 0)) {
        seen.set(item.command, item);
      }
    }
    grouped[cat] = Array.from(seen.values());
  }

  const statusColor: Record<string, string> = {
    mastered: "bg-emerald-500",
    practicing: "bg-sky-500",
    learning: "bg-amber-500",
  };

  const categories = Object.keys(grouped);
  if (categories.length === 0) return null;

  return (
    <Card className="bg-muted/30">
      <CardContent className="p-4">
        <p className="text-xs font-medium text-muted-foreground mb-3">Matriz de Habilidades</p>
        <div className="space-y-3">
          {categories.map((cat) => (
            <div key={cat}>
              <p className="text-[11px] text-muted-foreground mb-1.5">{cat}</p>
              <div className="flex flex-wrap gap-2">
                {grouped[cat].map((skill) => (
                  <div
                    key={skill.command}
                    className="flex items-center gap-1.5 rounded-md bg-background border px-2 py-1 text-xs transition-all duration-200 hover:bg-muted/50"
                  >
                    <span className={`h-2 w-2 rounded-full ${statusColor[skill.status] ?? "bg-muted-foreground"}`} />
                    <span className="text-foreground">{skill.command}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
        {/* Legend */}
        <div className="flex items-center gap-4 mt-3 pt-3 border-t">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-emerald-500" /> Dominado
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-sky-500" /> Praticando
          </div>
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
            <span className="h-2 w-2 rounded-full bg-amber-500" /> Aprendendo
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function PetTrainingTab({ petId, role }: PetTrainingTabProps) {
  const utils = trpc.useUtils();
  const { data, isLoading } = trpc.training.byPet.useQuery({ petId });
  const progress = trpc.training.progress.useQuery({ petId });

  const deleteTraining = trpc.training.delete.useMutation({
    onSuccess: () => {
      toast.success("Sessão removida com sucesso");
      utils.training.byPet.invalidate({ petId });
      utils.training.progress.invalidate({ petId });
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
    deleteTraining.mutate({ id: pendingDeleteId });
    setConfirmOpen(false);
    setPendingDeleteId(null);
  }

  function handleTrainingSuccess() {
    utils.training.byPet.invalidate({ petId });
    utils.training.progress.invalidate({ petId });
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i}>
              <CardContent className="p-4">
                <Skeleton className="h-8 w-12 mx-auto mb-1" />
                <Skeleton className="h-3 w-16 mx-auto" />
              </CardContent>
            </Card>
          ))}
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <Skeleton className="h-5 w-48" />
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full rounded-lg" />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Confirm Dialog */}
      <ConfirmDialog
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="Confirmar remoção"
        description="Tem certeza que deseja remover esta sessão de treinamento? Esta ação não pode ser desfeita."
        confirmLabel="Remover"
        variant="destructive"
        onConfirm={handleConfirmDelete}
        isLoading={deleteTraining.isPending}
      />

      {/* Resumo de Progresso */}
      {progress.data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card className="transition-all duration-200 hover:bg-muted/50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{progress.data.totalCommands}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card className="transition-all duration-200 hover:bg-muted/50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-500">{progress.data.mastered}</p>
              <p className="text-xs text-muted-foreground">Dominados</p>
            </CardContent>
          </Card>
          <Card className="transition-all duration-200 hover:bg-muted/50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-sky-500">{progress.data.practicing}</p>
              <p className="text-xs text-muted-foreground">Praticando</p>
            </CardContent>
          </Card>
          <Card className="transition-all duration-200 hover:bg-muted/50">
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-500">{progress.data.learning}</p>
              <p className="text-xs text-muted-foreground">Aprendendo</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Skills Matrix */}
      {data && data.length > 0 && (
        <SkillsMatrix
          data={data.map((log) => ({
            command: log.command,
            status: log.status,
            category: log.category,
          }))}
        />
      )}

      {/* Sessoes de Treinamento */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Sessões de Treinamento
            </CardTitle>
            <AddTrainingDialog petId={petId} onSuccess={handleTrainingSuccess} />
          </div>
        </CardHeader>
        <CardContent>
          {data && data.length > 0 ? (
            <div className="space-y-3">
              {data.map((log) => {
                const statusInfo = STATUS_MAP[log.status] ?? { label: log.status, variant: "secondary" as const };
                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-lg border text-sm transition-all duration-200 hover:bg-muted/50"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="font-medium">{log.command}</p>
                        <Badge variant={statusInfo.variant} className="text-[10px]">
                          {statusInfo.label}
                        </Badge>
                        <Badge variant="secondary" className="text-[10px]">
                          {CATEGORY_MAP[log.category] ?? log.category}
                        </Badge>
                        {String((log as Record<string, unknown>).source || "") !== "" && (
                          <SourceBadge source={(log as Record<string, unknown>).source as "admin" | "tutor"} />
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-muted-foreground text-xs mt-1">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(log.logDate), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                        {log.successRate !== null && log.successRate !== undefined && (
                          <span className="flex items-center gap-1">
                            <Target className="h-3 w-3" />
                            {log.successRate}%
                          </span>
                        )}
                        {log.duration && <span>{log.duration} min</span>}
                      </div>
                      {log.notes && (
                        <p className="text-xs text-muted-foreground mt-1">{log.notes}</p>
                      )}
                      {log.createdBy && (
                        <p className="text-[10px] text-muted-foreground mt-0.5">
                          Por: {log.createdBy.name}
                        </p>
                      )}
                    </div>
                    {(role === "admin" || (log as Record<string, unknown>).source === "tutor") && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0 transition-colors duration-200"
                        onClick={() => handleDeleteClick(log.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <GraduationCap className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">Nenhum treinamento registrado</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Registre sessões de treinamento e acompanhe o progresso.</p>
              <AddTrainingDialog petId={petId} onSuccess={handleTrainingSuccess}>
                <Button variant="outline" size="sm" className="mt-4 gap-1.5 transition-all duration-200">
                  <Plus className="h-3.5 w-3.5" /> Adicionar
                </Button>
              </AddTrainingDialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
