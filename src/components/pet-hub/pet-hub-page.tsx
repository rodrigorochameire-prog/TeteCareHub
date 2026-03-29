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

const TAB_ITEMS = [
  { value: "geral", label: "Geral", icon: Info },
  { value: "saude", label: "Saúde", icon: Heart },
  { value: "alimentacao", label: "Alimentação", icon: UtensilsCrossed },
  { value: "comportamento", label: "Comportamento", icon: Brain },
  { value: "treinamento", label: "Treinamento", icon: GraduationCap },
  { value: "calendario", label: "Calendário", icon: Calendar },
  { value: "documentos", label: "Documentos", icon: FileText },
] as const;

export function PetHubPage({ petId, role }: PetHubPageProps) {
  const { data: pet, isLoading, error } = trpc.pets.byId.useQuery({ id: petId });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
              <Skeleton className="h-20 w-20 rounded-xl" />
              <div className="flex-1 space-y-3">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-4 w-64" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-9 w-28 rounded-md" />
            </div>
          </CardContent>
        </Card>
        <Skeleton className="h-10 w-full rounded-none" />
        <div className="grid gap-5 md:grid-cols-2">
          <Skeleton className="h-64 w-full rounded-xl" />
          <Skeleton className="h-64 w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (error || !pet) {
    return (
      <Card>
        <CardContent className="p-12 text-center">
          <PawPrint className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium">Pet não encontrado.</p>
          <p className="text-sm text-muted-foreground/50 mt-1">
            Verifique se o link está correto ou tente novamente.
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Card */}
      <Card className="relative overflow-hidden">
        <CardContent className="p-6 pt-4">
          <PetHubHeader pet={pet} role={role} />
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="geral" className="w-full">
        <TabsList className="w-full h-auto p-1 flex overflow-x-auto scrollbar-none gap-0">
          {TAB_ITEMS.map(({ value, label, icon: Icon }) => (
            <TabsTrigger
              key={value}
              value={value}
              className="flex-1 min-w-0 gap-1.5 px-3 py-2 text-sm"
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span className="truncate">{label}</span>
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="geral" className="mt-5 animate-in fade-in-50 duration-300">
          <PetGeneralTab pet={pet} role={role} />
        </TabsContent>
        <TabsContent value="saude" className="mt-5 animate-in fade-in-50 duration-300">
          <PetHealthTab petId={petId} role={role} />
        </TabsContent>
        <TabsContent value="alimentacao" className="mt-5 animate-in fade-in-50 duration-300">
          <PetFoodTab petId={petId} role={role} />
        </TabsContent>
        <TabsContent value="comportamento" className="mt-5 animate-in fade-in-50 duration-300">
          <PetBehaviorTab petId={petId} role={role} />
        </TabsContent>
        <TabsContent value="treinamento" className="mt-5 animate-in fade-in-50 duration-300">
          <PetTrainingTab petId={petId} role={role} />
        </TabsContent>
        <TabsContent value="calendario" className="mt-5 animate-in fade-in-50 duration-300">
          <PetCalendarTab petId={petId} role={role} />
        </TabsContent>
        <TabsContent value="documentos" className="mt-5 animate-in fade-in-50 duration-300">
          <PetDocumentsTab petId={petId} role={role} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
