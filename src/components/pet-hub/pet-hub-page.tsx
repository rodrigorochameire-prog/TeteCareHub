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
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <Skeleton className="h-16 w-16 rounded-full" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-48" />
                <Skeleton className="h-4 w-32" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  if (error || !pet) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          Pet nao encontrado.
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardContent className="p-6">
          <PetHubHeader pet={pet} />
        </CardContent>
      </Card>

      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="w-full flex overflow-x-auto">
          <TabsTrigger value="geral" className="gap-1.5 flex-1">
            <Info className="h-4 w-4" />
            <span className="hidden sm:inline">Geral</span>
          </TabsTrigger>
          <TabsTrigger value="saude" className="gap-1.5 flex-1">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Saude</span>
          </TabsTrigger>
          <TabsTrigger value="alimentacao" className="gap-1.5 flex-1">
            <UtensilsCrossed className="h-4 w-4" />
            <span className="hidden sm:inline">Alimentacao</span>
          </TabsTrigger>
          <TabsTrigger value="comportamento" className="gap-1.5 flex-1">
            <Brain className="h-4 w-4" />
            <span className="hidden sm:inline">Comportamento</span>
          </TabsTrigger>
          <TabsTrigger value="treinamento" className="gap-1.5 flex-1">
            <GraduationCap className="h-4 w-4" />
            <span className="hidden sm:inline">Treinamento</span>
          </TabsTrigger>
          <TabsTrigger value="calendario" className="gap-1.5 flex-1">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Calendario</span>
          </TabsTrigger>
          <TabsTrigger value="documentos" className="gap-1.5 flex-1">
            <FileText className="h-4 w-4" />
            <span className="hidden sm:inline">Documentos</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="geral">
          <PetGeneralTab pet={pet} role={role} />
        </TabsContent>
        <TabsContent value="saude">
          <PetHealthTab petId={petId} role={role} />
        </TabsContent>
        <TabsContent value="alimentacao">
          <PetFoodTab petId={petId} role={role} />
        </TabsContent>
        <TabsContent value="comportamento">
          <PetBehaviorTab petId={petId} role={role} />
        </TabsContent>
        <TabsContent value="treinamento">
          <PetTrainingTab petId={petId} role={role} />
        </TabsContent>
        <TabsContent value="calendario">
          <PetCalendarTab petId={petId} role={role} />
        </TabsContent>
        <TabsContent value="documentos">
          <PetDocumentsTab petId={petId} role={role} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
