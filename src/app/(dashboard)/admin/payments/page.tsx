"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
  Receipt,
  Clock,
  History,
  CheckCircle,
  XCircle,
  ExternalLink,
  AlertCircle,
  DollarSign,
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

const methodLabels: Record<string, string> = {
  pix: "PIX",
  cartao: "Cartão",
  dinheiro: "Dinheiro",
  transferencia: "Transferência",
};

export default function AdminPaymentsPage() {
  const [activeTab, setActiveTab] = useState("pending");
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectingId, setRejectingId] = useState<number | null>(null);
  const [adminNotes, setAdminNotes] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const { data: pending, isLoading: pendingLoading } =
    trpc.paymentRequests.listPending.useQuery();
  const { data: allRequests, isLoading: allLoading } =
    trpc.paymentRequests.listAll.useQuery();
  const utils = trpc.useUtils();

  const review = trpc.paymentRequests.review.useMutation({
    onSuccess: (data) => {
      const action = data.status === "approved" ? "aprovada" : "rejeitada";
      toast.success(`Solicitação ${action} com sucesso!`);
      utils.paymentRequests.listPending.invalidate();
      utils.paymentRequests.listAll.invalidate();
      setRejectDialogOpen(false);
      setRejectingId(null);
      setAdminNotes("");
    },
    onError: (error) => toast.error("Erro: " + error.message),
  });

  const handleApprove = (id: number) => {
    review.mutate({ id, action: "approve" });
  };

  const handleOpenReject = (id: number) => {
    setRejectingId(id);
    setAdminNotes("");
    setRejectDialogOpen(true);
  };

  const handleReject = () => {
    if (rejectingId === null) return;
    review.mutate({
      id: rejectingId,
      action: "reject",
      adminNotes: adminNotes || undefined,
    });
  };

  const filteredHistory =
    allRequests?.filter((item) => {
      if (statusFilter === "all") return true;
      return item.request.status === statusFilter;
    }) || [];

  const isLoading = pendingLoading || allLoading;

  if (isLoading) {
    return <LoadingPage />;
  }

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-icon">
            <Receipt />
          </div>
          <div className="page-header-info">
            <h1>Pagamentos</h1>
            <p>Gerencie solicitações de pagamento dos tutores</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid grid-cols-3">
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="title">Pendentes</span>
            <Clock className="icon text-amber-500" />
          </div>
          <div className="stat-card-value">{pending?.length || 0}</div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="title">Aprovados</span>
            <CheckCircle className="icon text-green-500" />
          </div>
          <div className="stat-card-value">
            {allRequests?.filter((r) => r.request.status === "approved").length || 0}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-card-header">
            <span className="title">Rejeitados</span>
            <XCircle className="icon text-rose-500" />
          </div>
          <div className="stat-card-value">
            {allRequests?.filter((r) => r.request.status === "rejected").length || 0}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 lg:w-auto lg:inline-grid">
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Pendentes
            {(pending?.length || 0) > 0 && (
              <Badge className="badge-yellow ml-1">{pending?.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="history" className="flex items-center gap-2">
            <History className="h-4 w-4" />
            Histórico
          </TabsTrigger>
        </TabsList>

        {/* Pending Tab */}
        <TabsContent value="pending" className="space-y-6">
          <Card className="section-card">
            <CardHeader className="section-card-header">
              <CardTitle className="section-card-title">
                <Clock className="icon" />
                Solicitações Pendentes
              </CardTitle>
            </CardHeader>
            <CardContent className="section-card-content">
              {!pending || pending.length === 0 ? (
                <div className="empty-state">
                  <CheckCircle className="empty-state-icon" />
                  <p className="empty-state-text">
                    Nenhuma solicitação pendente
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {pending.map((item) => (
                    <div
                      key={item.request.id}
                      className="p-5 rounded-xl border bg-card hover:border-primary/30 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <span className="font-semibold">{item.tutor.name}</span>
                          <span className="text-sm text-muted-foreground ml-2">
                            &middot; {item.pet.name}
                          </span>
                        </div>
                        <Badge className="badge-yellow">Pendente</Badge>
                      </div>

                      <div className="space-y-2 mb-4">
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
                          className="inline-flex items-center gap-1.5 text-sm text-primary hover:underline mb-4"
                        >
                          <ExternalLink className="h-3.5 w-3.5" />
                          Ver comprovante
                        </a>
                      )}

                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                          disabled={review.isPending}
                          onClick={() => handleApprove(item.request.id)}
                        >
                          <CheckCircle className="h-3.5 w-3.5 mr-1.5" />
                          Aprovar
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="flex-1 border-rose-300 text-rose-600 hover:bg-rose-50"
                          disabled={review.isPending}
                          onClick={() => handleOpenReject(item.request.id)}
                        >
                          <XCircle className="h-3.5 w-3.5 mr-1.5" />
                          Rejeitar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history" className="space-y-6">
          <Card className="section-card">
            <CardHeader className="section-card-header">
              <CardTitle className="section-card-title">
                <History className="icon" />
                Histórico de Pagamentos
              </CardTitle>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Filtrar por status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="approved">Aprovado</SelectItem>
                  <SelectItem value="rejected">Rejeitado</SelectItem>
                </SelectContent>
              </Select>
            </CardHeader>
            <CardContent className="section-card-content">
              {filteredHistory.length === 0 ? (
                <div className="empty-state">
                  <History className="empty-state-icon" />
                  <p className="empty-state-text">
                    Nenhum registro encontrado
                  </p>
                </div>
              ) : (
                <div className="rounded-xl border overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tutor</TableHead>
                        <TableHead>Pet</TableHead>
                        <TableHead>Valor</TableHead>
                        <TableHead>Diárias</TableHead>
                        <TableHead>Método</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead>Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredHistory.map((item) => (
                        <TableRow key={item.request.id}>
                          <TableCell className="font-medium">
                            {item.tutor.name}
                          </TableCell>
                          <TableCell>{item.pet.name}</TableCell>
                          <TableCell>
                            {formatPrice(item.request.amount)}
                          </TableCell>
                          <TableCell>{item.request.daysRequested}</TableCell>
                          <TableCell>
                            {methodLabels[item.request.method] || item.request.method}
                          </TableCell>
                          <TableCell>
                            {format(
                              new Date(item.request.createdAt),
                              "dd/MM/yyyy",
                              { locale: ptBR }
                            )}
                          </TableCell>
                          <TableCell>
                            <Badge
                              className={
                                statusBadge[item.request.status] || "badge-neutral"
                              }
                            >
                              {statusLabels[item.request.status] || item.request.status}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rejeitar Solicitação</DialogTitle>
            <DialogDescription>
              Informe o motivo da rejeição (opcional). O tutor será notificado.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="adminNotes">Motivo</Label>
              <Textarea
                id="adminNotes"
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Ex: Comprovante ilegível, valor incorreto..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setRejectDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              className="bg-rose-600 hover:bg-rose-700 text-white"
              disabled={review.isPending}
              onClick={handleReject}
            >
              {review.isPending ? "Rejeitando..." : "Confirmar Rejeição"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
