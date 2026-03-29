"use client";

import { trpc } from "@/lib/trpc/client";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Mail,
  Plus,
  Copy,
  RefreshCw,
  XCircle,
  Loader2,
  Clock,
  CheckCircle2,
  LayoutDashboard,
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { toast } from "sonner";
import Link from "next/link";

const STATUS_CONFIG: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "Pendente", variant: "secondary" },
  completed: { label: "Concluido", variant: "default" },
  expired: { label: "Expirado", variant: "destructive" },
};

export default function AdminInvitationsPage() {
  const { data, isLoading } = trpc.invitations.list.useQuery();
  const utils = trpc.useUtils();

  const revokeMutation = trpc.invitations.revoke.useMutation({
    onSuccess: () => {
      toast.success("Convite revogado com sucesso");
      utils.invitations.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao revogar convite");
    },
  });

  const resendMutation = trpc.invitations.resend.useMutation({
    onSuccess: (result) => {
      const url = result.inviteUrl;
      navigator.clipboard.writeText(url);
      toast.success("Convite reenviado! Link copiado.");
      utils.invitations.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message || "Erro ao reenviar convite");
    },
  });

  function handleCopyLink(token: string) {
    const url = `${window.location.origin}/invite/${token}`;
    navigator.clipboard.writeText(url);
    toast.success("Link copiado!");
  }

  function handleRevoke(id: number) {
    revokeMutation.mutate({ id });
  }

  function handleResend(id: number) {
    resendMutation.mutate({ id });
  }

  const invitations = data ?? [];

  return (
    <div className="page-container">
      <PageHeader
        title="Convites"
        description="Gerencie convites de onboarding para tutores"
        icon={Mail}
        actions={
          <Button asChild>
            <Link href="/admin/invitations/new">
              <Plus className="mr-2 h-4 w-4" />
              Novo Convite
            </Link>
          </Button>
        }
      />

      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : invitations.length === 0 ? (
        <EmptyState
          icon={Mail}
          title="Nenhum convite encontrado"
          description="Crie um convite para que tutores completem o onboarding e acessem a plataforma."
          action={{
            label: "Criar Convite",
            href: "/admin/invitations/new",
          }}
        />
      ) : (
        <div className="grid gap-4">
          {invitations.map(({ invitation, tutor }) => {
            const statusConfig = STATUS_CONFIG[invitation.status] ?? {
              label: invitation.status,
              variant: "outline" as const,
            };
            const isPending = invitation.status === "pending";
            const isExpired = invitation.status === "expired";

            return (
              <Card key={invitation.id}>
                <CardContent className="flex flex-col sm:flex-row sm:items-center gap-4 p-5">
                  {/* Tutor info */}
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground truncate">
                        {tutor.name}
                      </span>
                      <Badge variant={statusConfig.variant}>
                        {statusConfig.label}
                      </Badge>
                      {invitation.dashboardAccess && (
                        <Badge variant="outline" className="gap-1">
                          <LayoutDashboard className="h-3 w-3" />
                          Dashboard
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{tutor.email}</span>
                      {tutor.phone && <span>{tutor.phone}</span>}
                    </div>
                    {invitation.expiresAt && (
                      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <span>
                          Expira em{" "}
                          {format(new Date(invitation.expiresAt), "dd/MM/yyyy 'as' HH:mm", {
                            locale: ptBR,
                          })}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2 shrink-0">
                    {isPending && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyLink(invitation.token)}
                        >
                          <Copy className="mr-1.5 h-3.5 w-3.5" />
                          Copiar Link
                        </Button>
                        <Button
                          variant="destructive"
                          size="sm"
                          onClick={() => handleRevoke(invitation.id)}
                          disabled={revokeMutation.isPending}
                        >
                          {revokeMutation.isPending ? (
                            <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          ) : (
                            <XCircle className="mr-1.5 h-3.5 w-3.5" />
                          )}
                          Revogar
                        </Button>
                      </>
                    )}
                    {isExpired && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleResend(invitation.id)}
                        disabled={resendMutation.isPending}
                      >
                        {resendMutation.isPending ? (
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                        ) : (
                          <RefreshCw className="mr-1.5 h-3.5 w-3.5" />
                        )}
                        Reenviar
                      </Button>
                    )}
                    {invitation.status === "completed" && (
                      <Badge variant="outline" className="gap-1 text-green-600">
                        <CheckCircle2 className="h-3 w-3" />
                        Concluido
                      </Badge>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
