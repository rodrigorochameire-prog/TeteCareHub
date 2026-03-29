"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SourceBadge } from "./source-badge";
import { GraduationCap, Plus, Trash2, Calendar, Target } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

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
  obedience: "Obediencia",
  socialization: "Socializacao",
  behavior: "Comportamento",
  agility: "Agilidade",
  tricks: "Truques",
};

export function PetTrainingTab({ petId, role }: PetTrainingTabProps) {
  const { data, isLoading } = trpc.training.byPet.useQuery({ petId });
  const progress = trpc.training.progress.useQuery({ petId });

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
      {/* Resumo de Progresso */}
      {progress.data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold">{progress.data.totalCommands}</p>
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-emerald-500">{progress.data.mastered}</p>
              <p className="text-xs text-muted-foreground">Dominados</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-sky-500">{progress.data.practicing}</p>
              <p className="text-xs text-muted-foreground">Praticando</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4 text-center">
              <p className="text-2xl font-bold text-amber-500">{progress.data.learning}</p>
              <p className="text-xs text-muted-foreground">Aprendendo</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Sessoes de Treinamento */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Sessoes de Treinamento
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
              {data.map((log) => {
                const statusInfo = STATUS_MAP[log.status] ?? { label: log.status, variant: "secondary" as const };
                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-3 rounded-lg border text-sm"
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
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <GraduationCap className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum treinamento registrado.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Registre sessoes de treinamento e acompanhe o progresso.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
