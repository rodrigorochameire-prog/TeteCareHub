"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Wallet,
  Package,
  CreditCard,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  DollarSign,
  Calendar,
  Users,
  AlertCircle,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
} from "lucide-react";
import { toast } from "sonner";

export default function AdminPackagesPage() {
  const [activeTab, setActiveTab] = useState("packages");

  // Dialog states
  const [isCreatePackageDialogOpen, setIsCreatePackageDialogOpen] = useState(false);
  const [isAddCreditDialogOpen, setIsAddCreditDialogOpen] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState("");

  // Queries
  const { data: packages, isLoading: packagesLoading } = trpc.packages.list.useQuery();
  const { data: pets, isLoading: petsLoading } = trpc.pets.list.useQuery();
  const utils = trpc.useUtils();

  // Mutations
  const createPackage = trpc.packages.create.useMutation({
    onSuccess: () => {
      toast.success("Pacote criado com sucesso!");
      utils.packages.list.invalidate();
      setIsCreatePackageDialogOpen(false);
    },
    onError: (error) => {
      toast.error("Erro ao criar pacote: " + error.message);
    },
  });

  const deletePackage = trpc.packages.delete.useMutation({
    onSuccess: () => {
      toast.success("Pacote removido com sucesso!");
      utils.packages.list.invalidate();
    },
    onError: (error) => {
      toast.error("Erro ao remover pacote: " + error.message);
    },
  });

  // Handlers
  const handleCreatePackage = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    createPackage.mutate({
      name: formData.get("name") as string,
      credits: parseInt(formData.get("credits") as string),
      priceInCents: parseInt(formData.get("price") as string) * 100,
      description: formData.get("description") as string || undefined,
      isActive: true,
    });
  };

  const handleDeletePackage = (id: number) => {
    if (confirm("Tem certeza que deseja remover este pacote?")) {
      deletePackage.mutate({ id });
    }
  };

  const filteredPets = pets?.filter(pet =>
    pet.name.toLowerCase().includes(searchQuery.toLowerCase())
  ) || [];

  const totalCredits = pets?.reduce((sum, pet) => sum + (pet.credits || 0), 0) || 0;
  const petsWithLowCredits = pets?.filter(pet => (pet.credits || 0) < 5).length || 0;

  if (packagesLoading || petsLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Wallet className="h-8 w-8 text-primary" />
            Pacotes & Financeiro
          </h1>
          <p className="text-muted-foreground mt-1">
            Gerencie planos de créditos e finanças da creche
          </p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3 lg:w-auto">
          <TabsTrigger value="packages" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Pacotes
          </TabsTrigger>
          <TabsTrigger value="credits" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            Créditos
          </TabsTrigger>
          <TabsTrigger value="finances" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Financeiro
          </TabsTrigger>
        </TabsList>

        {/* Packages Tab */}
        <TabsContent value="packages" className="space-y-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Pacotes de Créditos</CardTitle>
                <CardDescription>
                  Configure e gerencie os pacotes disponíveis para os tutores
                </CardDescription>
              </div>
              <Button onClick={() => setIsCreatePackageDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Novo Pacote
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {packages?.map((pkg) => (
                  <Card key={pkg.id} className="relative">
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-xl">{pkg.name}</CardTitle>
                        {pkg.isActive ? (
                          <Badge>Ativo</Badge>
                        ) : (
                          <Badge variant="secondary">Inativo</Badge>
                        )}
                      </div>
                      <CardDescription>{pkg.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="text-3xl font-bold">
                        R$ {(pkg.priceInCents / 100).toFixed(2)}
                      </div>
                      <div className="space-y-2 text-sm">
                        <div className="flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-muted-foreground" />
                          <span>{pkg.credits} créditos</span>
                        </div>
                        {pkg.discountPercent > 0 && (
                          <div className="flex items-center gap-2">
                            <DollarSign className="h-4 w-4 text-green-600" />
                            <span className="text-green-600">{pkg.discountPercent}% de desconto</span>
                          </div>
                        )}
                      </div>
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeletePackage(pkg.id)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Credits Tab */}
        <TabsContent value="credits" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-3">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Créditos</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{totalCredits}</div>
                <p className="text-xs text-muted-foreground">Em todos os pets ativos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Créditos Baixos</CardTitle>
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{petsWithLowCredits}</div>
                <p className="text-xs text-muted-foreground">Pets com menos de 5 créditos</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pets Ativos</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{pets?.length || 0}</div>
                <p className="text-xs text-muted-foreground">Total de pets cadastrados</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Gerenciar Créditos</CardTitle>
                <CardDescription>
                  Visualize e gerencie os créditos dos pets
                </CardDescription>
              </div>
              <Button onClick={() => setIsAddCreditDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Adicionar Créditos
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                placeholder="Buscar pet..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <div className="rounded-lg border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Pet</TableHead>
                      <TableHead>Tutor</TableHead>
                      <TableHead>Créditos</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                      {filteredPets.map((pet) => (
                      <TableRow key={pet.id}>
                        <TableCell className="font-medium">{pet.name}</TableCell>
                        <TableCell>{"Tutor"}</TableCell>
                        <TableCell>
                          <Badge variant={(pet.credits || 0) > 10 ? "default" : (pet.credits || 0) > 5 ? "secondary" : "destructive"}>
                            {pet.credits || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {(pet.credits || 0) < 5 ? (
                            <Badge variant="outline" className="text-yellow-600">
                              <AlertCircle className="h-3 w-3 mr-1" />
                              Baixo
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-green-600">
                              OK
                            </Badge>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Finances Tab */}
        <TabsContent value="finances" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Receita Mensal</CardTitle>
                <TrendingUp className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 0,00</div>
                <p className="text-xs text-green-600 flex items-center gap-1">
                  <ArrowUpRight className="h-3 w-3" />
                  Em desenvolvimento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Despesas</CardTitle>
                <ArrowDownRight className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 0,00</div>
                <p className="text-xs text-red-600 flex items-center gap-1">
                  <ArrowDownRight className="h-3 w-3" />
                  Em desenvolvimento
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Lucro Líquido</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">R$ 0,00</div>
                <p className="text-xs text-muted-foreground">Em desenvolvimento</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Transações</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">0</div>
                <p className="text-xs text-muted-foreground">Este mês</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Histórico de Transações</CardTitle>
              <CardDescription>
                Esta funcionalidade está em desenvolvimento
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-12 text-muted-foreground">
                <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Em breve você poderá visualizar todas as transações financeiras aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Create Package Dialog */}
      <Dialog open={isCreatePackageDialogOpen} onOpenChange={setIsCreatePackageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Pacote</DialogTitle>
            <DialogDescription>
              Configure um novo pacote de créditos
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePackage} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Pacote</Label>
              <Input id="name" name="name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea id="description" name="description" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input id="price" name="price" type="number" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="credits">Créditos</Label>
                <Input id="credits" name="credits" type="number" required />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsCreatePackageDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" disabled={createPackage.isPending}>
                {createPackage.isPending ? "Criando..." : "Criar Pacote"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Add Credits Dialog */}
      <Dialog open={isAddCreditDialogOpen} onOpenChange={setIsAddCreditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Créditos</DialogTitle>
            <DialogDescription>
              Adicione créditos para um pet específico
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="petId">Pet</Label>
              <Select value={selectedPetId} onValueChange={setSelectedPetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um pet" />
                </SelectTrigger>
                <SelectContent>
                  {pets?.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id.toString()}>
                      {pet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="days">Quantidade de Créditos</Label>
              <Input id="days" name="days" type="number" />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsAddCreditDialogOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Adicionar</Button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
