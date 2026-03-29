"use client";

import { useState } from "react";

import { trpc } from "@/lib/trpc/client";
import { AddVaccineDialog } from "./dialogs/add-vaccine-dialog";
import { AddMedicationDialog } from "./dialogs/add-medication-dialog";
import { AddPreventiveDialog } from "./dialogs/add-preventive-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
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
  Activity,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";

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
  const utils = trpc.useUtils();

  const vaccinations = trpc.vaccines.getPetVaccinations.useQuery({ petId });
  const medications = trpc.medications.getPetMedications.useQuery({ petId });
  const preventives = trpc.preventives.byPet.useQuery({ petId });

  // Delete mutations
  const deleteVaccine = trpc.vaccines.delete.useMutation({
    onSuccess: () => {
      toast.success("Vacina removida com sucesso");
      utils.vaccines.getPetVaccinations.invalidate({ petId });
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteMedication = trpc.medications.delete.useMutation({
    onSuccess: () => {
      toast.success("Medicamento removido com sucesso");
      utils.medications.getPetMedications.invalidate({ petId });
    },
    onError: (err) => toast.error(err.message),
  });

  const deletePreventive = trpc.preventives.delete.useMutation({
    onSuccess: () => {
      toast.success("Preventivo removido com sucesso");
      utils.preventives.byPet.invalidate({ petId });
    },
    onError: (err) => toast.error(err.message),
  });

  // Confirm dialog state
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingDelete, setPendingDelete] = useState<{
    type: "vaccine" | "medication" | "preventive";
    id: number;
    label: string;
  } | null>(null);

  function handleDeleteClick(type: "vaccine" | "medication" | "preventive", id: number, label: string) {
    setPendingDelete({ type, id, label });
    setConfirmOpen(true);
  }

  function handleConfirmDelete() {
    if (!pendingDelete) return;
    switch (pendingDelete.type) {
      case "vaccine":
        deleteVaccine.mutate({ id: pendingDelete.id });
        break;
      case "medication":
        deleteMedication.mutate({ id: pendingDelete.id });
        break;
      case "preventive":
        deletePreventive.mutate({ id: pendingDelete.id });
        break;
    }
    setConfirmOpen(false);
    setPendingDelete(null);
  }

  const isDeleting = deleteVaccine.isPending || deleteMedication.isPending || deletePreventive.isPending;
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

  // Summary calculations
  const totalVaccines = vaccinations.data?.length ?? 0;
  const activeMedications = medications.data?.filter((m) => m.medication.isActive).length ?? 0;

  // Find next due date across all records
  const allDueDates: Date[] = [];
  vaccinations.data?.forEach((item) => {
    if (item.vaccination.nextDueDate) allDueDates.push(new Date(item.vaccination.nextDueDate));
  });
  preventives.data?.forEach((item) => {
    if (item.nextDueDate) allDueDates.push(new Date(item.nextDueDate));
  });
  const nextDue = allDueDates.length > 0
    ? allDueDates.sort((a, b) => a.getTime() - b.getTime()).find((d) => d > new Date())
    : null;

  function handleVaccineSuccess() {
    utils.vaccines.getPetVaccinations.invalidate({ petId });
  }

  function handleMedicationSuccess() {
    utils.medications.getPetMedications.invalidate({ petId });
  }

  function handlePreventiveSuccess() {
    utils.preventives.byPet.invalidate({ petId });
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

      {/* Summary Header */}
      <Card className="bg-muted/30">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium text-foreground">Resumo de Saúde</span>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{totalVaccines}</p>
              <p className="text-[11px] text-muted-foreground">Vacinas</p>
            </div>
            <div className="text-center">
              <p className="text-xl font-bold text-foreground">{activeMedications}</p>
              <p className="text-[11px] text-muted-foreground">Medicamentos ativos</p>
            </div>
            <div className="text-center">
              {nextDue ? (
                <>
                  <p className="text-xl font-bold text-foreground">
                    {format(nextDue, "dd/MM", { locale: ptBR })}
                  </p>
                  <p className="text-[11px] text-muted-foreground">Próximo vencimento</p>
                </>
              ) : (
                <>
                  <CheckCircle2 className="h-5 w-5 text-emerald-500 mx-auto" />
                  <p className="text-[11px] text-muted-foreground mt-0.5">Tudo em dia</p>
                </>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Vacinas */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Syringe className="h-4 w-4" />
              Vacinas
            </CardTitle>
            <AddVaccineDialog petId={petId} onSuccess={handleVaccineSuccess} />
          </div>
        </CardHeader>
        <CardContent>
          {vaccinations.data && vaccinations.data.length > 0 ? (
            <div className="relative">
              {/* Timeline vertical line */}
              <div className="absolute left-[11px] top-3 bottom-3 w-px bg-border" />
              <div className="space-y-3">
                {vaccinations.data.map((item) => {
                  const dueStatus = getDueDateStatus(item.vaccination.nextDueDate);
                  const DueIcon = dueStatus.icon;
                  const isOverdue = dueStatus.variant === "destructive";
                  return (
                    <div
                      key={item.vaccination.id}
                      className={`relative flex items-start gap-3 p-3 pl-8 rounded-lg border text-sm transition-all duration-200 hover:bg-muted/50 ${
                        isOverdue
                          ? "border-l-2 border-l-red-500 border-red-500/30 bg-red-500/5"
                          : dueStatus.variant === "warning"
                            ? "border-amber-500/30 bg-amber-500/5"
                            : ""
                      }`}
                    >
                      {/* Timeline dot */}
                      <div className={`absolute left-[7px] top-4 h-2.5 w-2.5 rounded-full border-2 border-background ${
                        isOverdue ? "bg-red-500" : dueStatus.variant === "warning" ? "bg-amber-500" : "bg-emerald-500"
                      }`} />
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
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive transition-colors duration-200"
                          onClick={() => handleDeleteClick("vaccine", item.vaccination.id, item.vaccine?.name ?? "Vacina")}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Syringe className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">Nenhuma vacina registrada</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Adicione vacinas para acompanhar o calendário vacinal.</p>
              <AddVaccineDialog petId={petId} onSuccess={handleVaccineSuccess}>
                <Button variant="outline" size="sm" className="mt-4 gap-1.5 transition-all duration-200">
                  <Plus className="h-3.5 w-3.5" /> Adicionar
                </Button>
              </AddVaccineDialog>
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
            <AddMedicationDialog petId={petId} onSuccess={handleMedicationSuccess} />
          </div>
        </CardHeader>
        <CardContent>
          {medications.data && medications.data.length > 0 ? (
            <div className="space-y-3">
              {medications.data.map((item) => (
                <div
                  key={item.medication.id}
                  className="flex items-center justify-between p-3 rounded-lg border text-sm transition-all duration-200 hover:bg-muted/50"
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
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive transition-colors duration-200"
                      onClick={() => handleDeleteClick("medication", item.medication.id, item.library?.name ?? "Medicamento")}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Pill className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">Nenhum medicamento registrado</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Registre medicamentos em uso para controle.</p>
              <AddMedicationDialog petId={petId} onSuccess={handleMedicationSuccess}>
                <Button variant="outline" size="sm" className="mt-4 gap-1.5 transition-all duration-200">
                  <Plus className="h-3.5 w-3.5" /> Adicionar
                </Button>
              </AddMedicationDialog>
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
            <AddPreventiveDialog petId={petId} onSuccess={handlePreventiveSuccess} />
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
                const isOverdue = dueStatus.variant === "destructive";
                return (
                  <div
                    key={treatment.id}
                    className={`flex items-center justify-between p-3 rounded-lg border text-sm transition-all duration-200 hover:bg-muted/50 ${
                      isOverdue
                        ? "border-l-2 border-l-red-500 border-red-500/30 bg-red-500/5"
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
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive transition-colors duration-200"
                        onClick={() => handleDeleteClick("preventive", treatment.id, treatment.productName)}
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
              <ShieldCheck className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">Nenhum preventivo registrado</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Controle antipulgas, vermifugos e outros preventivos.</p>
              <AddPreventiveDialog petId={petId} onSuccess={handlePreventiveSuccess}>
                <Button variant="outline" size="sm" className="mt-4 gap-1.5 transition-all duration-200">
                  <Plus className="h-3.5 w-3.5" /> Adicionar
                </Button>
              </AddPreventiveDialog>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
