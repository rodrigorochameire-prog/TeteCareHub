"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Mail, Loader2, Send } from "lucide-react";
import { toast } from "sonner";

export default function NewInvitationPage() {
  const router = useRouter();
  const [selectedTutorId, setSelectedTutorId] = useState<number | null>(null);
  const [selectedPetIds, setSelectedPetIds] = useState<number[]>([]);
  const [dashboardAccess, setDashboardAccess] = useState(true);

  const { data: tutors, isLoading: loadingTutors } = trpc.tutors.list.useQuery();

  const selectedTutor = tutors?.find((t) => t.id === selectedTutorId);
  const tutorPets = selectedTutor?.pets ?? [];

  const createMutation = trpc.invitations.create.useMutation({
    onSuccess: (result) => {
      const url = result.inviteUrl;
      navigator.clipboard.writeText(url);
      toast.success("Convite criado! Link copiado para a area de transferencia.");
      router.push("/admin/invitations");
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao criar convite");
    },
  });

  function handleTutorChange(value: string) {
    const id = Number(value);
    setSelectedTutorId(id);
    setSelectedPetIds([]);
  }

  function handlePetToggle(petId: number, checked: boolean) {
    setSelectedPetIds((prev) =>
      checked ? [...prev, petId] : prev.filter((id) => id !== petId)
    );
  }

  function handleSelectAllPets() {
    if (selectedPetIds.length === tutorPets.length) {
      setSelectedPetIds([]);
    } else {
      setSelectedPetIds(tutorPets.map((p) => p.id));
    }
  }

  function handleSubmit() {
    if (!selectedTutorId) {
      toast.error("Selecione um tutor");
      return;
    }
    if (selectedPetIds.length === 0) {
      toast.error("Selecione pelo menos um pet");
      return;
    }

    createMutation.mutate({
      tutorId: selectedTutorId,
      petIds: selectedPetIds,
      dashboardAccess,
    });
  }

  const canSubmit =
    selectedTutorId !== null &&
    selectedPetIds.length > 0 &&
    !createMutation.isPending;

  return (
    <div className="page-container">
      <PageHeader
        title="Novo Convite"
        description="Envie um convite de onboarding para um tutor"
        icon={Mail}
        backHref="/admin/invitations"
      />

      <div className="max-w-2xl space-y-6">
        {/* Tutor Selection */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Selecionar Tutor</CardTitle>
          </CardHeader>
          <CardContent>
            <Select
              onValueChange={handleTutorChange}
              value={selectedTutorId?.toString() ?? ""}
            >
              <SelectTrigger>
                <SelectValue
                  placeholder={
                    loadingTutors ? "Carregando tutores..." : "Selecione um tutor"
                  }
                />
              </SelectTrigger>
              <SelectContent>
                {(tutors ?? []).map((tutor) => (
                  <SelectItem key={tutor.id} value={tutor.id.toString()}>
                    {tutor.name} ({tutor.email})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Pet Selection */}
        {selectedTutorId !== null && (
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">Pets do Tutor</CardTitle>
                {tutorPets.length > 1 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleSelectAllPets}
                  >
                    {selectedPetIds.length === tutorPets.length
                      ? "Desmarcar todos"
                      : "Selecionar todos"}
                  </Button>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {tutorPets.length === 0 ? (
                <p className="text-sm text-muted-foreground">
                  Este tutor nao possui pets vinculados.
                </p>
              ) : (
                <div className="space-y-3">
                  {tutorPets.map((pet) => (
                    <label
                      key={pet.id}
                      className="flex items-center gap-3 rounded-lg border p-3 cursor-pointer hover:bg-muted/50 transition-colors"
                    >
                      <Checkbox
                        checked={selectedPetIds.includes(pet.id)}
                        onCheckedChange={(checked) =>
                          handlePetToggle(pet.id, checked === true)
                        }
                      />
                      <div className="flex-1 min-w-0">
                        <span className="font-medium text-sm">{pet.name}</span>
                        {pet.breed && (
                          <span className="ml-2 text-xs text-muted-foreground">
                            {pet.breed}
                          </span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Options */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Opcoes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="dashboard-access">Acesso ao Dashboard</Label>
                <p className="text-xs text-muted-foreground">
                  Permite que o tutor visualize o dashboard com informacoes dos pets
                </p>
              </div>
              <Switch
                id="dashboard-access"
                checked={dashboardAccess}
                onCheckedChange={setDashboardAccess}
              />
            </div>
          </CardContent>
        </Card>

        {/* Submit */}
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => router.push("/admin/invitations")}
          >
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={!canSubmit}>
            {createMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Criar Convite
          </Button>
        </div>
      </div>
    </div>
  );
}
