"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PawPrint, ArrowLeft, ArrowRight } from "lucide-react";

interface Pet {
  id: number;
  name: string;
  species: string | null;
}

interface StepPlanReviewProps {
  pets: Pet[];
  onNext: () => void;
  onBack: () => void;
}

export function StepPlanReview({ pets, onNext, onBack }: StepPlanReviewProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Plano e servicos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            O plano de servicos para seus pets sera definido pela creche. Apos a
            conclusao do cadastro, a equipe entrara em contato para alinhar os
            detalhes do plano, horarios e valores.
          </p>

          <div className="space-y-3">
            {pets.map((pet) => (
              <div
                key={pet.id}
                className="flex items-center gap-3 rounded-md border p-3"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <PawPrint className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="text-sm font-medium">{pet.name}</p>
                  {pet.species && (
                    <p className="text-xs text-muted-foreground">
                      {pet.species}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>

          <div className="rounded-md bg-muted/50 p-4">
            <p className="text-xs text-muted-foreground">
              Os detalhes do plano, incluindo dias de frequencia, servicos
              adicionais e valores, serao apresentados pela creche em uma etapa
              posterior.
            </p>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button onClick={onNext}>
          <ArrowRight className="mr-2 h-4 w-4" />
          Proximo
        </Button>
      </div>
    </div>
  );
}
