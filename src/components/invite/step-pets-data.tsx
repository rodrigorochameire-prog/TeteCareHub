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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Loader2, ArrowLeft, ArrowRight, PawPrint } from "lucide-react";
import { toast } from "sonner";

interface Pet {
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
}

interface PetFormData {
  vetName: string;
  vetPhone: string;
  vetAddress: string;
  fearTriggers: string;
  notes: string;
}

interface StepPetsDataProps {
  token: string;
  pets: Pet[];
  onNext: () => void;
  onBack: () => void;
}

export function StepPetsData({ token, pets, onNext, onBack }: StepPetsDataProps) {
  const [petForms, setPetForms] = useState<Record<number, PetFormData>>(() => {
    const initial: Record<number, PetFormData> = {};
    for (const pet of pets) {
      initial[pet.id] = {
        vetName: pet.emergencyVetName || "",
        vetPhone: pet.emergencyVetPhone || "",
        vetAddress: "",
        fearTriggers: pet.fearTriggers?.join(", ") || "",
        notes: pet.notes || "",
      };
    }
    return initial;
  });

  const saveStep2 = trpc.invitePublic.saveStep2.useMutation({
    onSuccess: () => {
      toast.success("Dados dos pets salvos!");
      onNext();
    },
    onError: (err) => {
      toast.error(err.message || "Erro ao salvar dados dos pets.");
    },
  });

  function updatePetForm(petId: number, field: keyof PetFormData, value: string) {
    setPetForms((prev) => ({
      ...prev,
      [petId]: { ...prev[petId], [field]: value },
    }));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const petsPayload = pets.map((pet) => {
      const form = petForms[pet.id];
      const fearTriggersArray = form.fearTriggers
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      return {
        petId: pet.id,
        vetName: form.vetName || undefined,
        vetPhone: form.vetPhone || undefined,
        vetAddress: form.vetAddress || undefined,
        fearTriggers: fearTriggersArray.length > 0 ? fearTriggersArray : undefined,
        notes: form.notes || undefined,
      };
    });

    saveStep2.mutate({ token, pets: petsPayload });
  }

  function renderPetForm(pet: Pet) {
    const form = petForms[pet.id];
    return (
      <div className="space-y-6">
        {/* Admin data (read-only) */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <CardTitle className="text-base">Dados do pet</CardTitle>
              <Badge variant="secondary" className="text-xs">
                Cadastrado pela creche
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="rounded-md bg-muted/50 p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Nome</span>
                <span className="font-medium">{pet.name}</span>
              </div>
              {pet.species && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Especie</span>
                  <span className="font-medium">{pet.species}</span>
                </div>
              )}
              {pet.breed && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Raca</span>
                  <span className="font-medium">{pet.breed}</span>
                </div>
              )}
              {pet.weight && (
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Peso</span>
                  <span className="font-medium">{pet.weight} kg</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Editable complement */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">
              Dados complementares
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor={`vetName-${pet.id}`}>Nome do veterinario</Label>
                <Input
                  id={`vetName-${pet.id}`}
                  placeholder="Dr. Fulano"
                  value={form.vetName}
                  onChange={(e) =>
                    updatePetForm(pet.id, "vetName", e.target.value)
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor={`vetPhone-${pet.id}`}>
                  Telefone do veterinario
                </Label>
                <Input
                  id={`vetPhone-${pet.id}`}
                  placeholder="(00) 00000-0000"
                  value={form.vetPhone}
                  onChange={(e) =>
                    updatePetForm(pet.id, "vetPhone", e.target.value)
                  }
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`vetAddress-${pet.id}`}>
                Endereco da clinica veterinaria
              </Label>
              <Input
                id={`vetAddress-${pet.id}`}
                placeholder="Endereco completo da clinica"
                value={form.vetAddress}
                onChange={(e) =>
                  updatePetForm(pet.id, "vetAddress", e.target.value)
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor={`fearTriggers-${pet.id}`}>
                Gatilhos de medo ou estresse
              </Label>
              <Input
                id={`fearTriggers-${pet.id}`}
                placeholder="Ex: fogos, aspirador, gatos (separados por virgula)"
                value={form.fearTriggers}
                onChange={(e) =>
                  updatePetForm(pet.id, "fearTriggers", e.target.value)
                }
              />
              <p className="text-xs text-muted-foreground">
                Separe cada gatilho por virgula.
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor={`notes-${pet.id}`}>Observacoes</Label>
              <Textarea
                id={`notes-${pet.id}`}
                placeholder="Informacoes importantes sobre o pet..."
                value={form.notes}
                onChange={(e) =>
                  updatePetForm(pet.id, "notes", e.target.value)
                }
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {pets.length === 1 ? (
        renderPetForm(pets[0])
      ) : (
        <Tabs defaultValue={String(pets[0].id)}>
          <TabsList className="w-full">
            {pets.map((pet) => (
              <TabsTrigger
                key={pet.id}
                value={String(pet.id)}
                className="flex items-center gap-1.5"
              >
                <PawPrint className="h-3.5 w-3.5" />
                {pet.name}
              </TabsTrigger>
            ))}
          </TabsList>
          {pets.map((pet) => (
            <TabsContent key={pet.id} value={String(pet.id)}>
              {renderPetForm(pet)}
            </TabsContent>
          ))}
        </Tabs>
      )}

      <div className="flex justify-between">
        <Button type="button" variant="outline" onClick={onBack}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar
        </Button>
        <Button type="submit" disabled={saveStep2.isPending}>
          {saveStep2.isPending ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <ArrowRight className="mr-2 h-4 w-4" />
          )}
          Proximo
        </Button>
      </div>
    </form>
  );
}
