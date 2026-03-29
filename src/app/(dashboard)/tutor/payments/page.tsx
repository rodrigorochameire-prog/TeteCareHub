"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Receipt,
  Plus,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  FileText,
} from "lucide-react";
import { toast } from "sonner";
import { LoadingPage } from "@/components/shared/loading";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

function formatPrice(cents: number) {
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
}

const statusLabels: Record<string, string> = {
  pending: "Pendente",
  approved: "Aprovado",
  rejected: "Rejeitado",
};

const statusBadge: Record<string, string> = {
  pending: "badge-yellow",
  approved: "badge-green",
  rejected: "badge-rose",
};

const statusIcon: Record<string, React.ElementType> = {
  pending: Clock,
  approved: CheckCircle,
  rejected: XCircle,
};

const methodLabels: Record<string, string> = {
  pix: "PIX",
  cartao: "Cartão",
  dinheiro: "Dinheiro",
  transferencia: "Transferência",
};

export default function TutorPaymentsPage() {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedPetId, setSelectedPetId] = useState<string>("");
  const [selectedMethod, setSelectedMethod] = useState<string>("");

  const { data: requests, isLoading: requestsLoading } =
    trpc.paymentRequests.listByTutor.useQuery();
  const { data: myPets, isLoading: petsLoading } =
    trpc.pets.myPets.useQuery();
  const utils = trpc.useUtils();

  const createRequest = trpc.paymentRequests.create.useMutation({
    onSuccess: () => {
      toast.success("Solicitação enviada com sucesso!");
      utils.paymentRequests.listByTutor.invalidate();
      setIsCreateDialogOpen(false);
      setSelectedPetId("");
      setSelectedMethod("");
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    if (!selectedPetId) {
      toast.error("Selecione um pet");
      return;
    }
    if (!selectedMethod) {
      toast.error("Selecione o método de pagamento");
      return;
    }

    createRequest.mutate({
      petId: parseInt(selectedPetId),
      amount: Math.round(parseFloat(formData.get("amount") as string) * 100) || 0,
      daysRequested: parseInt(formData.get("daysRequested") as string) || 1,
      method: selectedMethod as "pix" | "cartao" | "dinheiro" | "transferencia",
      proofUrl: (formData.get("proofUrl") as string) || undefined,
    });
  };

  const isLoading = requestsLoading || petsLoading;

  if (isLoading) {
    return <LoadingPage />;
  }

  const pendingCount = requests?.filter((r) => r.request.status === "pending").length || 0;
  const approvedCount = requests?.filter((r) => r.request.status === "approved").length || 0;

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-icon">
            <Receipt />
          </div>
          <div className="page-header-info">
            <h1>Meus Pagamentos</h1>
            <p>Acompanhe suas solicitações de pagamento</p>
          </div>
        </div>
        <div className="page-header-actions">
          <Button
            size="sm"
            className="btn-primary"
            onClick={() => setIsCreateDialogOpen(true)}
          >
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Nova Solicitação
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid grid-cols-3">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="title">Total</span>
            <Receipt className="icon text-primary" />
          </div>
          <div className="stat-card-value">{requests?.length || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="title">Pendentes</span>
            <Clock className="icon text-amber-500" />
          </div>
          <div className="stat-card-value">{pendingCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="title">Aprovados</span>
            <CheckCircle className="icon text-green-500" />
          </div>
          <div className="stat-card-value">{approvedCount}</div>
        </div>
      </div>

      {/* Requests List */}
      <Card className="section-card">
        <CardHeader className="section-card-header">
          <CardTitle className="section-card-title">
            <FileText className="icon" />
            Solicitações
          </CardTitle>
        </CardHeader>
        <CardContent className="section-card-content">
          {!requests || requests.length === 0 ? (
            <div className="empty-state">
              <Receipt className="empty-state-icon" />
              <p className="empty-state-text">
                Você ainda não fez nenhuma solicitação de pagamento
              </p>
              <Button
                className="mt-4 btn-primary"
                onClick={() => setIsCreateDialogOpen(true)}
              >
                Nova Solicitação
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {requests.map((item) => {
                const StatusIcon = statusIcon[item.request.status] || Clock;
                return (
                  <div
                    key={item.request.id}
                    className="p-5 rounded-xl border bg-card hover:border-primary/30 hover:shadow-sm transition-all"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold">{item.pet.name}</span>
                      <Badge
                        className={
                          statusBadge[item.request.status] || "badge-neutral"
                        }
                      >
                        <StatusIcon className="h-3 w-3 mr-1" />
                        {statusLabels[item.request.status] || item.request.status}
                      </Badge>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Valor</span>
                        <span className="font-semibold text-primary">
                          {formatPrice(item.request.amount)}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Diárias</span>
                        <span className="font-medium">
                          {item.request.daysRequested} dia(s)
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Método</span>
                        <span className="font-medium">
                          {methodLabels[item.request.method] || item.request.method}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Data</span>
                        <span className="font-medium">
                          {format(
                            new Date(item.request.createdAt),
                            "dd/MM/yyyy 'às' HH:mm",
                            { locale: ptBR }
                          )}
                        </span>
                      </div>
                    </div>

                    {item.request.proofUrl && (
                      <a
                        href={item.request.proofUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                        Ver comprovante
                      </a>
                    )}

                    {item.request.status === "rejected" && item.request.adminNotes && (
                      <div className="mt-3 p-3 rounded-lg bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-800/30">
                        <p className="text-sm text-rose-700 dark:text-rose-400">
                          <strong>Motivo:</strong> {item.request.adminNotes}
                        </p>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create Request Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nova Solicitação de Pagamento</DialogTitle>
            <DialogDescription>
              Envie um comprovante de pagamento para adicionar diárias ao seu pet
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleCreate} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="petId">Pet</Label>
              <Select value={selectedPetId} onValueChange={setSelectedPetId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um pet" />
                </SelectTrigger>
                <SelectContent>
                  {myPets?.map((pet) => (
                    <SelectItem key={pet.id} value={pet.id.toString()}>
                      {pet.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Valor (R$)</Label>
                <Input
                  id="amount"
                  name="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  placeholder="0,00"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="daysRequested">Diárias</Label>
                <Input
                  id="daysRequested"
                  name="daysRequested"
                  type="number"
                  min="1"
                  placeholder="1"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">Método de Pagamento</Label>
              <Select value={selectedMethod} onValueChange={setSelectedMethod}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">PIX</SelectItem>
                  <SelectItem value="cartao">Cartão</SelectItem>
                  <SelectItem value="dinheiro">Dinheiro</SelectItem>
                  <SelectItem value="transferencia">Transferência</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="proofUrl">Link do Comprovante</Label>
              <Input
                id="proofUrl"
                name="proofUrl"
                type="url"
                placeholder="https://..."
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
                disabled={createRequest.isPending}
              >
                {createRequest.isPending ? "Enviando..." : "Enviar"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
