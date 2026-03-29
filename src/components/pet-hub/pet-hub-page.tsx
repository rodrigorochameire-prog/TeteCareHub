"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Info,
  Heart,
  UtensilsCrossed,
  Brain,
  GraduationCap,
  Calendar,
  FileText,
  PawPrint,
} from "lucide-react";
import { PetHubHeader } from "./pet-hub-header";
import { PetGeneralTab } from "./pet-general-tab";
import { PetHealthTab } from "./pet-health-tab";
import { PetFoodTab } from "./pet-food-tab";
import { PetBehaviorTab } from "./pet-behavior-tab";
import { PetTrainingTab } from "./pet-training-tab";
import { PetCalendarTab } from "./pet-calendar-tab";
import { PetDocumentsTab } from "./pet-documents-tab";

interface PetHubPageProps {
  petId: number;
  role: "admin" | "tutor";
}

export function PetHubPage({ petId, role }: PetHubPageProps) {
  const { data: pet, isLoading, error } = trpc.pets.byId.useQuery({ id: petId });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {/* Header skeleton */}
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
              <Skeleton className="h-24 w-24 rounded-full" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-7 w-48" />
                <Skeleton className="h-4 w-32" />
                <div className="flex gap-2">
                  <Skeleton className="h-7 w-16 rounded-md" />
                  <Skeleton className="h-7 w-20 rounded-md" />
                  <Skeleton className="h-7 w-16 rounded-md" />
                </div>
              </div>
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
            <Skeleton className="h-px w-full mt-4" />
            <div className="flex items-center gap-2 mt-4">
              <Skeleton className="h-4 w-12" />
              <Skeleton className="h-4 w-32" />
            </div>
          </CardContent>
        </Card>
        {/* Tabs skeleton */}
        <Skeleton className="h-10 w-full rounded-md" />
        {/* Content skeleton */}
        <div className="grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-64 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
          <Skeleton className="h-48 w-full rounded-lg" />
        </div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <PawPrint className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Pet não encontrado.</p>
          <p className="text-sm text-muted-foreground/60 mt-1">
            Verifique se o link está correto ou tente novamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <PetHubHeader pet={pet} role={role} />
        </CardContent>
      </Card>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="w-full flex overflow-x-auto scrollbar-none">
          <TabsTrigger value="geral" className="gap-1.5 flex-1 min-w-0">
            <Info className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline truncate">Geral</span>
          </TabsTrigger>
          <TabsTrigger value="saude" className="gap-1.5 flex-1 min-w-0">
            <Heart className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline truncate">Saúde</span>
          </TabsTrigger>
          <TabsTrigger value="alimentacao" className="gap-1.5 flex-1 min-w-0">
            <UtensilsCrossed className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline truncate">Alimentação</span>
          </TabsTrigger>
          <TabsTrigger value="comportamento" className="gap-1.5 flex-1 min-w-0">
            <Brain className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline truncate">Comportamento</span>
          </TabsTrigger>
          <TabsTrigger value="treinamento" className="gap-1.5 flex-1 min-w-0">
            <GraduationCap className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline truncate">Treinamento</span>
          </TabsTrigger>
          <TabsTrigger value="calendario" className="gap-1.5 flex-1 min-w-0">
            <Calendar className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline truncate">Calendário</span>
          </TabsTrigger>
          <TabsTrigger value="documentos" className="gap-1.5 flex-1 min-w-0">
            <FileText className="h-4 w-4 shrink-0" />
            <span className="hidden sm:inline truncate">Documentos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral" className="mt-4 animate-in fade-in-0 duration-200">
          <PetGeneralTab pet={pet} role={role} />
        </TabsContent>
        <TabsContent value="saude" className="mt-4 animate-in fade-in-0 duration-200">
          <PetHealthTab petId={petId} role={role} />
        </TabsContent>
        <TabsContent value="alimentacao" className="mt-4 animate-in fade-in-0 duration-200">
          <PetFoodTab petId={petId} role={role} />
        </TabsContent>
        <TabsContent value="comportamento" className="mt-4 animate-in fade-in-0 duration-200">
          <PetBehaviorTab petId={petId} role={role} />
        </TabsContent>
        <TabsContent value="treinamento" className="mt-4 animate-in fade-in-0 duration-200">
          <PetTrainingTab petId={petId} role={role} />
        </TabsContent>
        <TabsContent value="calendario" className="mt-4 animate-in fade-in-0 duration-200">
          <PetCalendarTab petId={petId} role={role} />
        </TabsContent>
        <TabsContent value="documentos" className="mt-4 animate-in fade-in-0 duration-200">
          <PetDocumentsTab petId={petId} role={role} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
