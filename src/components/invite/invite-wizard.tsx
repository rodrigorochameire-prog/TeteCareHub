"use client";

import { useState } from "react";
import { CheckCircle2, PawPrint } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { StepTutorData } from "./step-tutor-data";
import { StepPetsData } from "./step-pets-data";
import { StepPlanReview } from "./step-plan-review";
import { StepConfirmation } from "./step-confirmation";

type InviteData = {
  invitation: {
    id: number;
    dashboardAccess: boolean;
    expiresAt: Date;
  };
  tutor: {
    id: number;
    name: string | null;
    email: string | null;
    phone: string | null;
  };
  pets: Array<{
    id: number;
    name: string;
    breed: string | null;
    species: string | null;
    birthDate: Date | null;
    weight: string | null;
    photoUrl: string | null;
    adminLockedFields: string[];
    emergencyVetName: string | null;
    emergencyVetPhone: string | null;
    fearTriggers: string[] | null;
    notes: string | null;
  }>;
};

interface InviteWizardProps {
  token: string;
  data: InviteData;
}

const STEPS = [
  { number: 1, label: "Seus dados" },
  { number: 2, label: "Pets" },
  { number: 3, label: "Plano" },
  { number: 4, label: "Confirmar" },
];

export function InviteWizard({ token, data }: InviteWizardProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [completed, setCompleted] = useState(false);
  const [dashboardAccess, setDashboardAccess] = useState(
    data.invitation.dashboardAccess
  );

  if (completed) {
    return (
      <Card className="mt-8">
        <CardContent className="flex flex-col items-center gap-4 py-12">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
            <CheckCircle2 className="h-8 w-8 text-green-600 dark:text-green-400" />
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold">Cadastro concluido!</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {dashboardAccess
                ? "Voce ja pode acessar o painel para acompanhar seus pets."
                : "A creche recebeu seus dados. Obrigado!"}
            </p>
          </div>
          {dashboardAccess && (
            <Button asChild className="mt-4">
              <a href="/sign-in">
                <PawPrint className="mr-2 h-4 w-4" />
                Acessar o painel
              </a>
            </Button>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      <nav aria-label="Progresso do cadastro">
        <ol className="flex items-center justify-between">
          {STEPS.map((step) => {
            const isActive = step.number === currentStep;
            const isDone = step.number < currentStep;
            return (
              <li key={step.number} className="flex flex-1 flex-col items-center gap-1">
                <div className="flex w-full items-center">
                  {step.number > 1 && (
                    <div
                      className={cn(
                        "h-0.5 flex-1",
                        isDone ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                  <div
                    className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-medium",
                      isActive && "bg-primary text-primary-foreground",
                      isDone && "bg-primary text-primary-foreground",
                      !isActive && !isDone && "border-2 border-muted bg-background text-muted-foreground"
                    )}
                  >
                    {isDone ? (
                      <CheckCircle2 className="h-4 w-4" />
                    ) : (
                      step.number
                    )}
                  </div>
                  {step.number < STEPS.length && (
                    <div
                      className={cn(
                        "h-0.5 flex-1",
                        isDone ? "bg-primary" : "bg-muted"
                      )}
                    />
                  )}
                </div>
                <span
                  className={cn(
                    "text-xs",
                    isActive || isDone
                      ? "font-medium text-foreground"
                      : "text-muted-foreground"
                  )}
                >
                  {step.label}
                </span>
              </li>
            );
          })}
        </ol>
      </nav>

      {/* Step content */}
      {currentStep === 1 && (
        <StepTutorData
          token={token}
          tutor={data.tutor}
          dashboardAccess={data.invitation.dashboardAccess}
          onNext={() => setCurrentStep(2)}
        />
      )}
      {currentStep === 2 && (
        <StepPetsData
          token={token}
          pets={data.pets}
          onNext={() => setCurrentStep(3)}
          onBack={() => setCurrentStep(1)}
        />
      )}
      {currentStep === 3 && (
        <StepPlanReview
          pets={data.pets}
          onNext={() => setCurrentStep(4)}
          onBack={() => setCurrentStep(2)}
        />
      )}
      {currentStep === 4 && (
        <StepConfirmation
          token={token}
          tutor={data.tutor}
          pets={data.pets}
          dashboardAccess={data.invitation.dashboardAccess}
          onBack={() => setCurrentStep(3)}
          onComplete={(hasDashboard) => {
            setDashboardAccess(hasDashboard);
            setCompleted(true);
          }}
        />
      )}
    </div>
  );
}
