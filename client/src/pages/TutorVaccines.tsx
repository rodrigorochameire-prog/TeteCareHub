import { useState } from "react";
import TutorLayout from "@/components/TutorLayout";
import { useRoute } from "wouter";
import { trpc } from "@/lib/trpc";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Plus, Syringe, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { Link } from "wouter";
import { RecentChangeIndicator } from "@/components/RecentChangeIndicator";

export default function TutorVaccines() {
  const [, params] = useRoute("/tutor/pets/:id/vaccines");
  const petId = params?.id ? parseInt(params.id) : 0;
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedVaccineId, setSelectedVaccineId] = useState<number | null>(null);

  const { data: pet } = trpc.pets.byId.useQuery({ id: petId });
  const { data: vaccinations, refetch } = trpc.vaccines.getPetVaccinations.useQuery({ petId });
  const { data: library } = trpc.vaccines.library.useQuery();
  const { data: petHistory } = trpc.changeHistory.getPetHistory.useQuery({ petId });
  
  // Helper to get recent changes for a specific vaccination
  const getRecentChanges = (vaccinationId: number) => {
    if (!petHistory) return [];
    return petHistory
      .filter((change: any) => 
        change.resourceType === "preventive" && 
        change.resourceId === vaccinationId
      )
      .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 3);
  };

  const addVaccination = trpc.vaccines.addVaccination.useMutation({
    onSuccess: () => {
      toast.success("Vacina registrada com sucesso!");
      setIsDialogOpen(false);
      refetch();
    },
    onError: (error: any) => {
      toast.error("Erro ao registrar vacina: " + error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    const vaccineId = parseInt(formData.get("vaccineId") as string);
    const applicationDate = formData.get("applicationDate") as string;
    const nextDueDate = formData.get("nextDueDate") as string;
    const doseNumber = formData.get("doseNumber") as string;
    const veterinarian = formData.get("veterinarian") as string;
    const clinic = formData.get("clinic") as string;
    const batchNumber = formData.get("batchNumber") as string;
    const notes = formData.get("notes") as string;

    addVaccination.mutate({
      petId,
      vaccineId,
      applicationDate: new Date(applicationDate),
      nextDueDate: nextDueDate ? new Date(nextDueDate) : undefined,
      doseNumber: doseNumber ? parseInt(doseNumber) : undefined,
      veterinarian: veterinarian || undefined,
      clinic: clinic || undefined,
      batchNumber: batchNumber || undefined,
      notes: notes || undefined,
    });
  };

  // Separate upcoming and past vaccinations
  const now = new Date();
  const upcomingVaccinations = vaccinations?.filter(
    v => v.vaccination.next_due_date && new Date(v.vaccination.next_due_date) > now
  ) || [];
  const pastVaccinations = vaccinations?.filter(
    v => !v.vaccination.next_due_date || new Date(v.vaccination.next_due_date) <= now
  ) || [];

  return (
    <TutorLayout>
      <div className="container max-w-7xl py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Link href={`/tutor/pets/${petId}`}>
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <div className="flex-1">
          <h1 className="text-3xl font-bold tracking-tight">Carteira de Vacinação</h1>
          <p className="text-muted-foreground">{pet?.name}</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Registrar Vacina
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Registrar Vacina</DialogTitle>
              <DialogDescription>
                Adicione uma vacina aplicada ao histórico do pet
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="vaccineId">Vacina *</Label>
                <Select
                  name="vaccineId"
                  value={selectedVaccineId?.toString() || ""}
                  onValueChange={(value) => setSelectedVaccineId(parseInt(value))}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a vacina" />
                  </SelectTrigger>
                  <SelectContent>
                    {library?.map((vac) => (
                      <SelectItem key={vac.id} value={vac.id.toString()}>
                        {vac.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {selectedVaccineId && (
                  <p className="text-xs text-muted-foreground">
                    {library?.find(v => v.id === selectedVaccineId)?.description}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="applicationDate">Data de Aplicação *</Label>
                  <Input
                    id="applicationDate"
                    name="applicationDate"
                    type="date"
                    defaultValue={new Date().toISOString().split("T")[0]}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="doseNumber">Número da Dose</Label>
                  <Input
                    id="doseNumber"
                    name="doseNumber"
                    type="number"
                    min="1"
                    placeholder="Ex: 1, 2, 3"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="nextDueDate">Próxima Dose</Label>
                <Input id="nextDueDate" name="nextDueDate" type="date" />
                <p className="text-xs text-muted-foreground">
                  Deixe em branco se for dose única
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="veterinarian">Veterinário</Label>
                  <Input
                    id="veterinarian"
                    name="veterinarian"
                    placeholder="Nome do veterinário"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="clinic">Clínica</Label>
                  <Input
                    id="clinic"
                    name="clinic"
                    placeholder="Nome da clínica"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="batchNumber">Lote da Vacina</Label>
                <Input
                  id="batchNumber"
                  name="batchNumber"
                  placeholder="Número do lote"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  name="notes"
                  rows={3}
                  placeholder="Reações, observações especiais, etc."
                />
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={addVaccination.isPending}>
                  {addVaccination.isPending ? "Salvando..." : "Salvar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Upcoming Vaccinations */}
      {upcomingVaccinations.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-orange-700">
              <AlertCircle className="h-5 w-5" />
              Vacinas Próximas
            </CardTitle>
            <CardDescription>
              Vacinas agendadas para os próximos dias
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {upcomingVaccinations.map((vacc) => {
                const daysUntil = Math.ceil(
                  (new Date(vacc.vaccination.next_due_date!).getTime() - now.getTime()) /
                    (1000 * 60 * 60 * 24)
                );
                return (
                  <div key={vacc.vaccination.id} className="p-4 border border-orange-200 rounded-lg bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{vacc.vaccine.name}</h3>
                          <RecentChangeIndicator 
                            changes={getRecentChanges(vacc.vaccination.id)}
                            resourceType="vaccine"
                          />
                        </div>
                        {vacc.vaccination.doseNumber && (
                          <Badge variant="outline">
                            Dose {vacc.vaccination.doseNumber}
                          </Badge>
                        )}
                      </div>
                      <Badge className="bg-orange-100 text-orange-700 border-orange-200">
                        {daysUntil === 0
                          ? "Hoje"
                          : daysUntil === 1
                          ? "Amanhã"
                          : `Em ${daysUntil} dias`}
                      </Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Agendada para:{" "}
                      {new Date(vacc.vaccination.next_due_date!).toLocaleDateString("pt-BR", {
                        weekday: "long",
                        year: "numeric",
                        month: "long",
                        day: "numeric",
                      })}
                    </p>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Vaccination History */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Syringe className="h-5 w-5" />
            Histórico de Vacinação
          </CardTitle>
          <CardDescription>
            Todas as vacinas aplicadas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {vaccinations?.length === 0 ? (
            <div className="empty-state">
              <Syringe className="empty-state-icon" />
              <p className="empty-state-title">Nenhuma vacina registrada</p>
              <p className="empty-state-description">
                Adicione as vacinas que o pet já recebeu
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {vaccinations?.map((vacc) => (
                <div key={vacc.vaccination.id} className="p-4 border rounded-lg">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-semibold text-lg">{vacc.vaccine.name}</h3>
                        <RecentChangeIndicator 
                          changes={getRecentChanges(vacc.vaccination.id)}
                          resourceType="vaccine"
                        />
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {vacc.vaccine.description}
                      </p>
                      {vacc.vaccination.doseNumber && (
                        <Badge variant="outline" className="mt-2">
                          Dose {vacc.vaccination.doseNumber}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mt-4">
                    <div>
                      <p className="text-muted-foreground">Aplicação</p>
                      <p className="font-medium">
                        {new Date(vacc.vaccination.application_date).toLocaleDateString("pt-BR")}
                      </p>
                    </div>
                    {vacc.vaccination.next_due_date && (
                      <div>
                        <p className="text-muted-foreground">Próxima Dose</p>
                        <p className="font-medium">
                          {new Date(vacc.vaccination.next_due_date).toLocaleDateString("pt-BR")}
                        </p>
                      </div>
                    )}
                    {vacc.vaccination.veterinarian && (
                      <div>
                        <p className="text-muted-foreground">Veterinário</p>
                        <p className="font-medium">{vacc.vaccination.veterinarian}</p>
                      </div>
                    )}
                    {vacc.vaccination.clinic && (
                      <div>
                        <p className="text-muted-foreground">Clínica</p>
                        <p className="font-medium">{vacc.vaccination.clinic}</p>
                      </div>
                    )}
                  </div>

                  {vacc.vaccination.batchNumber && (
                    <div className="mt-3 p-2 bg-muted/30 rounded text-xs">
                      <span className="font-medium">Lote:</span> {vacc.vaccination.batchNumber}
                    </div>
                  )}

                  {vacc.vaccination.notes && (
                    <div className="mt-3 p-3 bg-muted/30 rounded">
                      <p className="text-sm text-muted-foreground">{vacc.vaccination.notes}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tips Card */}
      <Card className="bg-blue-50/50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-base">💡 Dicas de Vacinação</CardTitle>
        </CardHeader>
        <CardContent className="text-sm space-y-2">
          <p>• Mantenha a carteira de vacinação sempre atualizada</p>
          <p>• Configure lembretes para as próximas doses</p>
          <p>• Guarde os comprovantes e certificados de vacinação</p>
          <p>• Observe o pet nas primeiras 24h após a vacinação</p>
          <p>• Consulte o veterinário sobre o calendário vacinal adequado</p>
        </CardContent>
      </Card>
      </div>
    </TutorLayout>
  );
}
