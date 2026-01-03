"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ScrollArea } from "@/components/ui/scroll-area";
import { FileText, User, Trash2, UserPlus, UserMinus, AlertCircle, Loader2, Shield } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

const ACTION_CONFIG: Record<string, { label: string; icon: typeof FileText; color: string }> = {
  promote_admin: {
    label: "Promover Admin",
    icon: UserPlus,
    color: "text-green-600",
  },
  demote_admin: {
    label: "Remover Admin",
    icon: UserMinus,
    color: "text-orange-600",
  },
  delete_user: {
    label: "Deletar Usuário",
    icon: Trash2,
    color: "text-red-600",
  },
  login: {
    label: "Login",
    icon: User,
    color: "text-blue-600",
  },
  logout: {
    label: "Logout",
    icon: User,
    color: "text-gray-600",
  },
};

export default function AdminAuditLogsPage() {
  const { data: logsData, isLoading } = trpc.auditLogs.list.useQuery({ limit: 100 });
  const { data: stats } = trpc.auditLogs.stats.useQuery();

  const logs = logsData?.logs || [];

  return (
    <div className="container max-w-7xl py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3">
          <Shield className="h-8 w-8 text-primary" />
          Logs de Auditoria
        </h1>
        <p className="text-muted-foreground mt-2">
          Auditoria de ações críticas realizadas por administradores
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total de Logs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.total || 0}</div>
            <p className="text-xs text-muted-foreground">Últimos 30 dias</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ações Bem-sucedidas</CardTitle>
            <UserPlus className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.successful || 0}</div>
            <p className="text-xs text-muted-foreground">Concluídas com sucesso</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ações com Erro</CardTitle>
            <AlertCircle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.failed || 0}</div>
            <p className="text-xs text-muted-foreground">Com falha ou negadas</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Usuários Únicos</CardTitle>
            <User className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.uniqueUsers || 0}</div>
            <p className="text-xs text-muted-foreground">Administradores ativos</p>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Histórico de Ações Administrativas
          </CardTitle>
          <CardDescription>
            {logs.length} ações registradas
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Nenhum log registrado ainda</p>
              <p className="text-sm text-muted-foreground mt-2">
                Os logs de auditoria aparecerão aqui quando ações administrativas forem realizadas
              </p>
            </div>
          ) : (
            <ScrollArea className="h-[600px]">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Data/Hora</TableHead>
                    <TableHead>Administrador</TableHead>
                    <TableHead>Ação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>IP</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {logs.map((log: any, index: number) => {
                    const config = ACTION_CONFIG[log.action] || {
                      label: log.action,
                      icon: FileText,
                      color: "text-gray-600",
                    };
                    const Icon = config.icon;

                    return (
                      <TableRow key={log.id || index}>
                        <TableCell className="font-mono text-xs">
                          {log.created_at 
                            ? format(new Date(log.created_at), "dd/MM/yyyy HH:mm:ss", { locale: ptBR })
                            : "-"
                          }
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">
                              Usuário #{log.user_id || "?"}
                            </span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className={config.color}>
                            <Icon className="h-3 w-3 mr-1" />
                            {config.label}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {log.success ? (
                            <Badge variant="outline" className="text-green-600">
                              Sucesso
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="text-red-600">
                              {log.error_code || "Erro"}
                            </Badge>
                          )}
                        </TableCell>
                        <TableCell className="font-mono text-xs text-muted-foreground">
                          {log.ip_address || "-"}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </ScrollArea>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
