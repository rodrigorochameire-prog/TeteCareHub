"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  Syringe,
  Pill,
  Shield,
  Plus,
  Search,
  Edit,
  Trash2,
  Calendar,
  Heart,
} from "lucide-react";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc/client";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function AdminHealthPage() {
  const [mainTab, setMainTab] = useState("vaccines");
  const [subTab, setSubTab] = useState("library");
  const [searchTerm, setSearchTerm] = useState("");
  const [petFilter, setPetFilter] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");

  // Queries
  const { data: vaccineLibrary, refetch: refetchVaccineLibrary } = trpc.vaccines.library.useQuery();
  const { data: medicationLibrary, refetch: refetchMedicationLibrary } = trpc.medications.library.useQuery();
  const { data: preventiveLibrary, refetch: refetchPreventiveLibrary } = trpc.preventives.library.useQuery();
  const { data: pets } = trpc.pets.list.useQuery();

  // Mutations
  const addVaccineToLibrary = trpc.vaccines.addToLibrary.useMutation({
    onSuccess: () => {
      toast.success("Vacina adicionada à biblioteca!");
      setIsAddDialogOpen(false);
      refetchVaccineLibrary();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao adicionar vacina");
    },
  });

  const addMedicationToLibrary = trpc.medications.addToLibrary.useMutation({
    onSuccess: () => {
      toast.success("Medicamento adicionado à biblioteca!");
      setIsAddDialogOpen(false);
      refetchMedicationLibrary();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao adicionar medicamento");
    },
  });

  const addPreventiveToLibrary = trpc.preventives.addToLibrary.useMutation({
    onSuccess: () => {
      toast.success("Preventivo adicionado à biblioteca!");
      setIsAddDialogOpen(false);
      refetchPreventiveLibrary();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao adicionar preventivo");
    },
  });

  const getLibrary = () => {
    if (mainTab === "vaccines") return vaccineLibrary || [];
    if (mainTab === "medications") return medicationLibrary || [];
    if (mainTab === "preventives") return preventiveLibrary || [];
    return [];
  };

  const getMainIcon = () => {
    if (mainTab === "vaccines") return Syringe;
    if (mainTab === "medications") return Pill;
    if (mainTab === "preventives") return Shield;
    return Heart;
  };

  const handleAddToLibrary = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (mainTab === "vaccines") {
      addVaccineToLibrary.mutate({
        name: formData.get("name") as string,
        description: formData.get("description") as string || undefined,
        intervalDays: formData.get("intervalDays") ? parseInt(formData.get("intervalDays") as string) : undefined,
        dosesRequired: 1,
      });
    } else if (mainTab === "medications") {
      addMedicationToLibrary.mutate({
        name: formData.get("name") as string,
        type: selectedType as "preventive" | "treatment" | "supplement",
        description: formData.get("description") as string || undefined,
        defaultDosage: formData.get("defaultDosage") as string || undefined,
      });
    } else if (mainTab === "preventives") {
      addPreventiveToLibrary.mutate({
        name: formData.get("name") as string,
        type: selectedType as "flea" | "deworming",
        description: formData.get("description") as string || undefined,
        intervalDays: formData.get("intervalDays") ? parseInt(formData.get("intervalDays") as string) : undefined,
      });
    }
  };

  const MainIcon = getMainIcon();

  const filteredLibrary = getLibrary().filter((item: any) =>
    item.name?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Heart className="h-8 w-8 text-red-500" />
            Central de Saúde
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie vacinas, medicamentos e preventivos dos pets
          </p>
        </div>
      </div>

      <Tabs value={mainTab} onValueChange={setMainTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto lg:inline-grid">
          <TabsTrigger value="vaccines" className="flex items-center gap-2">
            <Syringe className="h-4 w-4" />
            Vacinas
          </TabsTrigger>
          <TabsTrigger value="medications" className="flex items-center gap-2">
            <Pill className="h-4 w-4" />
            Medicamentos
          </TabsTrigger>
          <TabsTrigger value="preventives" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            Preventivos
          </TabsTrigger>
        </TabsList>

        <Tabs value={subTab} onValueChange={setSubTab} className="space-y-4">
          <TabsList>
            <TabsTrigger value="library">Biblioteca</TabsTrigger>
            <TabsTrigger value="applications">Aplicações</TabsTrigger>
            <TabsTrigger value="schedule">Cronograma</TabsTrigger>
          </TabsList>

          <TabsContent value="library" className="space-y-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <MainIcon className="h-5 w-5" />
                    Biblioteca de {
                      mainTab === "vaccines" ? "Vacinas" :
                      mainTab === "medications" ? "Medicamentos" : "Preventivos"
                    }
                  </CardTitle>
                  <CardDescription>
                    Gerencie os itens disponíveis para aplicação
                  </CardDescription>
                </div>
                <Button onClick={() => setIsAddDialogOpen(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Adicionar
                </Button>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Buscar..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>

                <div className="grid gap-3">
                  {filteredLibrary.length === 0 ? (
                    <div className="text-center py-12 text-muted-foreground">
                      <MainIcon className="h-12 w-12 mx-auto mb-4 opacity-30" />
                      <p>Nenhum item na biblioteca</p>
                      <Button
                        variant="link"
                        onClick={() => setIsAddDialogOpen(true)}
                      >
                        Adicionar primeiro item
                      </Button>
                    </div>
                  ) : (
                    filteredLibrary.map((item: any) => (
                      <div
                        key={item.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex-1">
                          <div className="font-medium">{item.name}</div>
                          {item.description && (
                            <div className="text-sm text-muted-foreground mt-1">
                              {item.description}
                            </div>
                          )}
                          <div className="flex gap-2 mt-2">
                            {item.type && (
                              <Badge variant="outline">{item.type}</Badge>
                            )}
                            {item.intervalDays && (
                              <Badge variant="secondary">
                                Reaplicar a cada {item.intervalDays} dias
                              </Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Button size="sm" variant="ghost">
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="ghost">
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="applications" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Histórico de Aplicações</CardTitle>
                <CardDescription>
                  Visualize todas as aplicações realizadas
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col sm:flex-row gap-4">
                  <div className="flex-1 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="Buscar por pet..."
                      className="pl-10"
                    />
                  </div>
                  <Select value={petFilter} onValueChange={setPetFilter}>
                    <SelectTrigger className="w-full sm:w-[200px]">
                      <SelectValue placeholder="Filtrar por pet" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos os pets</SelectItem>
                      {pets?.map((pet: any) => (
                        <SelectItem key={pet.id} value={pet.id.toString()}>
                          {pet.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="rounded-lg border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pet</TableHead>
                        <TableHead>Item</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          Selecione uma aba para ver as aplicações
                        </TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="schedule" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Cronograma de Aplicações</CardTitle>
                <CardDescription>
                  Próximas aplicações e alertas de vencimento
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <div className="text-center space-y-2">
                    <Calendar className="h-12 w-12 mx-auto opacity-50" />
                    <p>Visualização de cronograma integrada ao calendário</p>
                    <Button variant="link" asChild>
                      <a href="/admin/calendar">Ir para Calendário</a>
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </Tabs>

      {/* Add Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Adicionar {
                mainTab === "vaccines" ? "Vacina" :
                mainTab === "medications" ? "Medicamento" : "Preventivo"
              }
            </DialogTitle>
            <DialogDescription>
              Adicione um novo item à biblioteca
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleAddToLibrary} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome</Label>
              <Input id="name" name="name" required />
            </div>

            {(mainTab === "medications" || mainTab === "preventives") && (
              <div className="space-y-2">
                <Label htmlFor="type">Tipo</Label>
                <Select value={selectedType} onValueChange={setSelectedType} required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {mainTab === "medications" ? (
                      <>
                        <SelectItem value="preventive">Preventivo</SelectItem>
                        <SelectItem value="treatment">Tratamento</SelectItem>
                        <SelectItem value="supplement">Suplemento</SelectItem>
                      </>
                    ) : (
                      <>
                        <SelectItem value="flea">Antipulgas</SelectItem>
                        <SelectItem value="deworming">Vermífugo</SelectItem>
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="description">Descrição (opcional)</Label>
              <Textarea id="description" name="description" />
            </div>

            {(mainTab === "vaccines" || mainTab === "preventives") && (
              <div className="space-y-2">
                <Label htmlFor="intervalDays">Intervalo de Reaplicação (dias)</Label>
                <Input id="intervalDays" name="intervalDays" type="number" />
              </div>
            )}

            {mainTab === "medications" && (
              <div className="space-y-2">
                <Label htmlFor="defaultDosage">Dosagem Padrão (opcional)</Label>
                <Input id="defaultDosage" name="defaultDosage" />
              </div>
            )}

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Adicionar</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}

