"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { SourceBadge } from "./source-badge";
import { Syringe, Pill, ShieldCheck, Plus, Trash2, Calendar } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PetHealthTabProps {
  petId: number;
  role: "admin" | "tutor";
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
              {vaccinations.data.map((item) => (
                <div
                  key={item.vaccination.id}
                  className="flex items-center justify-between p-3 rounded-lg border text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium truncate">
                        {item.vaccine?.name ?? "Vacina"}
                      </p>
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
                          · Proxima: {format(new Date(item.vaccination.nextDueDate), "dd/MM/yyyy", { locale: ptBR })}
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
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhuma vacina registrada.
            </p>
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
                          ate {format(new Date(item.medication.endDate), "dd/MM/yyyy", { locale: ptBR })}
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
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum medicamento registrado.
            </p>
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
                return (
                  <div
                    key={treatment.id}
                    className="flex items-center justify-between p-3 rounded-lg border text-sm"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-medium truncate">{treatment.productName}</p>
                        <Badge variant="secondary" className="text-[10px]">
                          {typeLabels[treatment.type] ?? treatment.type}
                        </Badge>
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
                            · Proxima: {format(new Date(treatment.nextDueDate), "dd/MM/yyyy", { locale: ptBR })}
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
            <p className="text-sm text-muted-foreground text-center py-4">
              Nenhum preventivo registrado.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
