"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
  Package,
  Plus,
  ToggleLeft,
  ToggleRight,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import { toast } from "sonner";
import { LoadingPage } from "@/components/shared/loading";

const planTypeLabels: Record<string, string> = {
  mensalista: "Mensalista",
  avulso: "Avulso",
  diaria: "Diária",
};

const planTypeBadge: Record<string, string> = {
  mensalista: "badge-blue",
  avulso: "badge-green",
  diaria: "badge-neutral",
};

function formatPrice(cents: number) {
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

export default function AdminPlansPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedType, setSelectedType] = useState<string>("");

  const { data: plans, isLoading } = trpc.plansManagement.listPlans.useQuery();
  const utils = trpc.useUtils();

  const createPlan = trpc.plansManagement.createPlan.useMutation({
    onSuccess: () => {
      toast.success("Plano criado com sucesso!");
      utils.plansManagement.listPlans.invalidate();
      setIsCreateDialogOpen(false);
      setSelectedType("");
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });

  const togglePlan = trpc.plansManagement.togglePlan.useMutation({
    onSuccess: (data) => {
      toast.success(
        data.isActive ? "Plano ativado!" : "Plano desativado!"
      );
      utils.plansManagement.listPlans.invalidate();
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });

  const handleCreatePlan = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!selectedType) {
      toast.error("Selecione o tipo do plano");
      return;
    }

    createPlan.mutate({
      name: formData.get("name") as string,
      type: selectedType as "mensalista" | "avulso" | "diaria",
      includedDays: parseInt(formData.get("includedDays") as string) || 0,
      price: Math.round(parseFloat(formData.get("price") as string) * 100) || 0,
      description: (formData.get("description") as string) || undefined,
    });
  };

  const activePlans = plans?.filter((p) => p.isActive).length || 0;

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-icon">
            <Package />
          </div>
          <div className="page-header-info">
            <h1>Planos e Serviços</h1>
            <p>Gerencie os planos oferecidos pela creche</p>
          </div>
        </div>
        <div className="page-header-actions">
          <Button
            size="sm"
            className="btn-primary"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Criar Plano
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid grid-cols-3">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="title">Total de Planos</span>
            <Package className="icon text-primary" />
          </div>
          <div className="stat-card-value">{plans?.length || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="title">Planos Ativos</span>
            <TrendingUp className="icon text-green-500" />
          </div>
          <div className="stat-card-value">{activePlans}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="title">Planos Inativos</span>
            <ToggleLeft className="icon text-muted-foreground" />
          </div>
          <div className="stat-card-value">
            {(plans?.length || 0) - activePlans}
          </div>
        </div>
      </div>

      {/* Plans Grid */}
      <Card className="section-card">
        <CardHeader className="section-card-header">
          <CardTitle className="section-card-title">
            <Package className="icon" />
            Planos Cadastrados
          </CardTitle>
        </CardHeader>
        <CardContent className="section-card-content">
          {!plans || plans.length === 0 ? (
            <div className="empty-state">
              <Package className="empty-state-icon" />
              <p className="empty-state-text">Nenhum plano cadastrado</p>
              <Button
                className="mt-4 btn-primary"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                Criar Plano
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className="p-5 rounded-xl border bg-card hover:border-primary/30 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-lg">{plan.name}</span>
                    <Badge
                      className={
                        plan.isActive ? "badge-green" : "badge-neutral"
                      }
                    >
                      {plan.isActive ? "Ativo" : "Inativo"}
                    </Badge>
                  </div>

                  <div className="flex items-center gap-2 mb-3">
                    <Badge
                      className={
                        planTypeBadge[plan.type] || "badge-neutral"
                      }
                    >
                      {planTypeLabels[plan.type] || plan.type}
                    </Badge>
                  </div>

                  {plan.description && (
                    <p className="text-sm text-muted-foreground mb-4">
                      {plan.description}
                    </p>
                  )}

                  <div className="text-3xl font-bold text-primary mb-3">
                    {formatPrice(plan.price)}
                  </div>

                  <div className="flex items-center text-sm text-muted-foreground mb-4 gap-1.5">
                    <CalendarDays className="h-4 w-4" />
                    {plan.includedDays} diária(s) incluída(s)
                  </div>

                  <Button
                    size="sm"
                    variant="outline"
                    className="w-full"
                    disabled={togglePlan.isPending}
                    onClick={() => togglePlan.mutate({ id: plan.id })}
                  >
                    {plan.isActive ? (
                      <>
                        <ToggleRight className="h-3.5 w-3.5 mr-1.5 text-green-500" />
                        Desativar
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
                        Ativar
                      </>
                    )}
                  </Button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Plan Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Plano</DialogTitle>
            <DialogDescription>
              Configure um novo plano de serviço para a creche
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreatePlan} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome do Plano</Label>
              <Input id="name" name="name" placeholder="Ex: Mensalista Integral" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Tipo</Label>
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mensalista">Mensalista</SelectItem>
                  <SelectItem value="avulso">Avulso</SelectItem>
                  <SelectItem value="diaria">Diária</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="includedDays">Diárias Incluídas</Label>
                <Input
                  id="includedDays"
                  name="includedDays"
                  type="number"
                  min="0"
                  placeholder="0"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price">Preço (R$)</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Descrição opcional do plano"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateDialogOpen(false)}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="btn-primary"
                disabled={createPlan.isPending}
              >
                {createPlan.isPending ? "Criando..." : "Criar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
