"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SourceBadge } from "./source-badge";
import {
  Syringe,
  Pill,
  ShieldCheck,
  Plus,
  Trash2,
  Calendar,
  AlertTriangle,
  Clock,
  CheckCircle2,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PetHealthTabProps {
  petId: number;
  role: "admin" | "tutor";
}

function getDueDateStatus(nextDueDate: Date | string | null | undefined): {
  variant: "success" | "warning" | "destructive";
  label: string;
  icon: typeof CheckCircle2;
} {
  if (!nextDueDate) return { variant: "success", label: "Em dia", icon: CheckCircle2 };
  const due = new Date(nextDueDate);
  const now = new Date();
  const diffDays = Math.floor((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return { variant: "destructive", label: "Atrasado", icon: AlertTriangle };
  if (diffDays <= 30) return { variant: "warning", label: `${diffDays}d`, icon: Clock };
  return { variant: "success", label: "Em dia", icon: CheckCircle2 };
}

export function PetHealthTab({ petId, role }: PetHealthTabProps) {
  const vaccinations = trpc.vaccines.getPetVaccinations.useQuery({ petId });
  const medications = trpc.medications.getPetMedications.useQuery({ petId });
  const preventives = trpc.preventives.byPet.useQuery({ petId });

  const isLoading = vaccinations.isLoading || medications.isLoading || preventives.isLoading;

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
              <div className="space-y-3">
                <Skeleton className="h-20 w-full rounded-lg" />
                <Skeleton className="h-20 w-full rounded-lg" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Vacinas */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Syringe className="h-4 w-4" />
              Vacinas
            </CardTitle>
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="h-3.5 w-3.5" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {vaccinations.data && vaccinations.data.length > 0 ? (
            <div className="space-y-3">
              {vaccinations.data.map((item) => {
                const dueStatus = getDueDateStatus(item.vaccination.nextDueDate);
                const DueIcon = dueStatus.icon;
                return (
                  <div
                    key={item.vaccination.id}
                    className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-colors ${
                      dueStatus.variant === "destructive"
                        ? "border-red-500/30 bg-red-500/5"
                        : dueStatus.variant === "warning"
                          ? "border-amber-500/30 bg-amber-500/5"
                          : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">
                          {item.vaccine?.name ?? "Vacina"}
                        </p>
                        {item.vaccination.nextDueDate && (
                          <Badge variant={dueStatus.variant} className="text-[10px] gap-1">
                            <DueIcon className="h-3 w-3" />
                            {dueStatus.label}
                          </Badge>
                        )}
                        {String((item.vaccination as Record<string, unknown>).source || "") !== "" && (
                          <SourceBadge
                            source={(item.vaccination as Record<string, unknown>).source as "admin" | "tutor"}
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mt-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(item.vaccination.applicationDate), "dd/MM/yyyy", { locale: ptBR })}
                        {item.vaccination.nextDueDate && (
                          <span>
                            · Próxima: {format(new Date(item.vaccination.nextDueDate), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        )}
                      </div>
                      {item.vaccination.veterinarian && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Vet: {item.vaccination.veterinarian}
                          {item.vaccination.clinic && ` - ${item.vaccination.clinic}`}
                        </p>
                      )}
                    </div>
                    {(role === "admin" || (item.vaccination as Record<string, unknown>).source === "tutor") && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <Syringe className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhuma vacina registrada.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Adicione vacinas para acompanhar o calendário vacinal.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Medicamentos */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Pill className="h-4 w-4" />
              Medicamentos
            </CardTitle>
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="h-3.5 w-3.5" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {medications.data && medications.data.length > 0 ? (
            <div className="space-y-3">
              {medications.data.map((item) => (
                <div
                  key={item.medication.id}
                  className="flex items-center justify-between p-3 rounded-lg border text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {item.library?.name ?? "Medicamento"}
                      </p>
                      {item.medication.isActive ? (
                        <Badge variant="success" className="text-[10px]">Ativo</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-[10px]">Encerrado</Badge>
                      )}
                      {String((item.medication as Record<string, unknown>).source || "") !== "" && (
                        <SourceBadge
                          source={(item.medication as Record<string, unknown>).source as "admin" | "tutor"}
                        />
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      Dosagem: {item.medication.dosage}
                      {item.medication.frequency && ` · ${item.medication.frequency}`}
                    </p>
                    <div className="flex items-center gap-2 text-muted-foreground text-xs mt-0.5">
                      <Calendar className="h-3 w-3" />
                      {format(new Date(item.medication.startDate), "dd/MM/yyyy", { locale: ptBR })}
                      {item.medication.endDate && (
                        <span>
                          até {format(new Date(item.medication.endDate), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      )}
                    </div>
                  </div>
                  {(role === "admin" || (item.medication as Record<string, unknown>).source === "tutor") && (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Pill className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum medicamento registrado.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Registre medicamentos em uso para controle.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Preventivos */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <ShieldCheck className="h-4 w-4" />
              Preventivos
            </CardTitle>
            <Button variant="outline" size="sm" className="gap-1">
              <Plus className="h-3.5 w-3.5" />
              Adicionar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {preventives.data && preventives.data.length > 0 ? (
            <div className="space-y-3">
              {preventives.data.map((treatment) => {
                const typeLabels: Record<string, string> = {
                  flea: "Antipulgas",
                  deworming: "Vermifugo",
                  heartworm: "Dirofilariose",
                  tick: "Carrapaticida",
                };
                const dueStatus = getDueDateStatus(treatment.nextDueDate);
                const DueIcon = dueStatus.icon;
                return (
                  <div
                    key={treatment.id}
                    className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-colors ${
                      dueStatus.variant === "destructive"
                        ? "border-red-500/30 bg-red-500/5"
                        : dueStatus.variant === "warning"
                          ? "border-amber-500/30 bg-amber-500/5"
                          : ""
                    }`}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{treatment.productName}</p>
                        <Badge variant="secondary" className="text-[10px]">
                          {typeLabels[treatment.type] ?? treatment.type}
                        </Badge>
                        {treatment.nextDueDate && (
                          <Badge variant={dueStatus.variant} className="text-[10px] gap-1">
                            <DueIcon className="h-3 w-3" />
                            {dueStatus.label}
                          </Badge>
                        )}
                        {String((treatment as Record<string, unknown>).source || "") !== "" && (
                          <SourceBadge
                            source={(treatment as Record<string, unknown>).source as "admin" | "tutor"}
                          />
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground text-xs mt-1">
                        <Calendar className="h-3 w-3" />
                        {format(new Date(treatment.applicationDate), "dd/MM/yyyy", { locale: ptBR })}
                        {treatment.nextDueDate && (
                          <span>
                            · Próxima: {format(new Date(treatment.nextDueDate), "dd/MM/yyyy", { locale: ptBR })}
                          </span>
                        )}
                      </div>
                      {treatment.dosage && (
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Dosagem: {treatment.dosage}
                        </p>
                      )}
                    </div>
                    {(role === "admin" || (treatment as Record<string, unknown>).source === "tutor") && (
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8">
              <ShieldCheck className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum preventivo registrado.</p>
              <p className="text-xs text-muted-foreground/60 mt-1">
                Controle antipulgas, vermifugos e outros preventivos.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
