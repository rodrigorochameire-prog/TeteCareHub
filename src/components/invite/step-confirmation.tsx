"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Loader2, ArrowLeft, CheckCircle2, PawPrint } from "lucide-react";
import { toast } from "sonner";

interface StepConfirmationProps {
  token: string;
  tutor: {
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  pets: Array<{
    id: number;
    name: string;
    species: string | null;
    breed: string | null;
  }>;
  dashboardAccess: boolean;
  onBack: () => void;
  onComplete: (dashboardAccess: boolean) => void;
}

export function StepConfirmation({
  token,
  tutor,
  pets,
  dashboardAccess,
  onBack,
  onComplete,
}: StepConfirmationProps) {
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  const complete = trpc.invitePublic.complete.useMutation({
    onSuccess: (result) => {
      toast.success("Cadastro concluido com sucesso!");
      onComplete(result.dashboardAccess ?? dashboardAccess);
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao concluir cadastro.");
    },
  });

  function handleConfirm() {
    if (!acceptedTerms) {
      toast.error("Voce deve aceitar os termos para continuar.");
      return;
    }
    complete.mutate({ token, acceptedTerms: true });
  }

  return (
    <div className="space-y-6">
      {/* Tutor summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Resumo do tutor</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md bg-muted/50 p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Nome</span>
              <span className="font-medium">{tutor.name || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Email</span>
              <span className="font-medium">{tutor.email || "—"}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Telefone</span>
              <span className="font-medium">{tutor.phone || "—"}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Pets summary */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pets cadastrados</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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
                <p className="text-xs text-muted-foreground">
                  {[pet.species, pet.breed].filter(Boolean).join(" - ") || "—"}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Terms */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-start gap-3">
            <Checkbox
              id="terms"
              checked={acceptedTerms}
              onCheckedChange={(checked) =>
                setAcceptedTerms(checked === true)
              }
            />
            <Label
              htmlFor="terms"
              className="text-sm leading-relaxed cursor-pointer"
            >
              Declaro que as informacoes fornecidas sao verdadeiras e autorizo a
              creche a utilizar esses dados para o cuidado dos meus pets. Estou
              ciente dos termos de servico e politica de privacidade.
            </Label>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button
          onClick={handleConfirm}
          disabled={!acceptedTerms || complete.isPending}
        >
          {complete.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="mr-2 h-4 w-4" />
          )}
          Confirmar cadastro
        </Button>
      </div>
    </div>
  );
}
