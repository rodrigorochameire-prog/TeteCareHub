"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bell, Check, Trash2, Info, AlertTriangle, CheckCircle, XCircle } from "lucide-react";
import { PageHeader } from "@/components/shared/page-header";
import { EmptyState } from "@/components/shared/empty-state";
import { LoadingPage } from "@/components/shared/loading";
import { toast } from "sonner";
import { formatDateTime } from "@/lib/utils";
import { cn } from "@/lib/utils";

const iconMap = {
  info: Info,
  warning: AlertTriangle,
  success: CheckCircle,
  error: XCircle,
};

const colorMap = {
  info: "text-blue-500 bg-blue-50",
  warning: "text-yellow-500 bg-yellow-50",
  success: "text-green-500 bg-green-50",
  error: "text-red-500 bg-red-50",
};

export default function TutorNotificationsPage() {
  const utils = trpc.useUtils();
  
  const { data: notifications, isLoading } = trpc.notifications.list.useQuery({});
  const { data: unreadCount } = trpc.notifications.unreadCount.useQuery();

  const markAsReadMutation = trpc.notifications.markAsRead.useMutation({
    onSuccess: () => {
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const markAllAsReadMutation = trpc.notifications.markAllAsRead.useMutation({
    onSuccess: () => {
      toast.success("Todas notificações marcadas como lidas");
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const deleteMutation = trpc.notifications.delete.useMutation({
    onSuccess: () => {
      toast.success("Notificação removida");
      utils.notifications.list.invalidate();
      utils.notifications.unreadCount.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  const clearReadMutation = trpc.notifications.clearRead.useMutation({
    onSuccess: () => {
      toast.success("Notificações lidas removidas");
      utils.notifications.list.invalidate();
    },
    onError: (error) => {
      toast.error(error.message);
    },
  });

  if (isLoading) {
    return <LoadingPage />;
  }

  const hasUnread = (unreadCount ?? 0) > 0;
  const hasRead = notifications?.some(n => n.isRead);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notificações"
        description="Acompanhe as atualizações dos seus pets"
        actions={
          <div className="flex gap-2">
            {hasRead && (
              <Button 
                variant="outline" 
                size="sm"
                onClick={() => clearReadMutation.mutate()}
                disabled={clearReadMutation.isPending}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Limpar lidas
              </Button>
            )}
            {hasUnread && (
              <Button 
                variant="outline"
                onClick={() => markAllAsReadMutation.mutate()}
                disabled={markAllAsReadMutation.isPending}
              >
                <Check className="h-4 w-4 mr-2" />
                Marcar todas como lidas
              </Button>
            )}
          </div>
        }
      />

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Não lidas</CardTitle>
            <Bell className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{unreadCount ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Bell className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{notifications?.length ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Todas as Notificações
          </CardTitle>
        </CardHeader>
        <CardContent>
          {!notifications || notifications.length === 0 ? (
            <EmptyState
              icon={Bell}
              title="Nenhuma notificação"
              description="Você não tem notificações no momento. Quando houver atualizações sobre seus pets, elas aparecerão aqui."
            />
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const Icon = iconMap[notification.type as keyof typeof iconMap] || Info;
                const colorClass = colorMap[notification.type as keyof typeof colorMap] || colorMap.info;

                return (
                  <div
                    key={notification.id}
                    className={cn(
                      "flex items-start gap-4 p-4 border rounded-lg transition-colors",
                      !notification.isRead && "bg-primary/5 border-primary/20"
                    )}
                  >
                    <div className={cn("p-2 rounded-full", colorClass)}>
                      <Icon className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium text-sm">{notification.title}</h4>
                        {!notification.isRead && (
                          <span className="w-2 h-2 bg-primary rounded-full" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDateTime(notification.createdAt)}
                      </p>
                    </div>
                    <div className="flex gap-1">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => markAsReadMutation.mutate({ id: notification.id })}
                          disabled={markAsReadMutation.isPending}
                          title="Marcar como lida"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => deleteMutation.mutate({ id: notification.id })}
                        disabled={deleteMutation.isPending}
                        title="Remover"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
