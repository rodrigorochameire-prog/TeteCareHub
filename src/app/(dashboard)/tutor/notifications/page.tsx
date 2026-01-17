"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Bell, 
  BellOff,
  Check,
  CheckCheck,
  Calendar,
  FileText,
  MessageSquare,
  Heart,
  Sparkles
} from "lucide-react";
import { useState } from "react";

const mockNotifications = [
  {
    id: 1,
    type: "health",
    title: "Lembrete de vacina",
    message: "A vacina V10 do Max está próxima do vencimento",
    time: "Há 2 horas",
    read: false,
    icon: Heart,
    color: "text-rose-500 bg-rose-500/10",
  },
  {
    id: 2,
    type: "booking",
    title: "Reserva confirmada",
    message: "Sua reserva para o dia 20/01 foi confirmada",
    time: "Há 5 horas",
    read: false,
    icon: Calendar,
    color: "text-blue-500 bg-blue-500/10",
  },
  {
    id: 3,
    type: "document",
    title: "Novo relatório disponível",
    message: "Relatório de comportamento do Max está pronto",
    time: "Ontem",
    read: true,
    icon: FileText,
    color: "text-green-500 bg-green-500/10",
  },
  {
    id: 4,
    type: "message",
    title: "Mensagem da creche",
    message: "A equipe TeteCare enviou uma atualização",
    time: "2 dias atrás",
    read: true,
    icon: MessageSquare,
    color: "text-purple-500 bg-purple-500/10",
  },
];

export default function TutorNotificationsPage() {
  const [notifications, setNotifications] = useState(mockNotifications);
  
  const unreadCount = notifications.filter(n => !n.read).length;

  const markAsRead = (id: number) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  };

  const markAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div className="page-header-content">
          <div className="page-header-icon">
            <Bell />
          </div>
          <div className="page-header-info">
            <div className="flex items-center gap-3">
              <h1>Notificações</h1>
              {unreadCount > 0 && (
                <Badge className="badge-rose">
                  {unreadCount} novas
                </Badge>
              )}
            </div>
            <p>Atualizações sobre seus pets</p>
          </div>
        </div>
        {unreadCount > 0 && (
          <div className="page-header-actions">
            <Button variant="outline" onClick={markAllAsRead} size="sm" className="btn-sm btn-outline gap-2">
              <CheckCheck className="h-4 w-4" />
              Marcar todas como lidas
            </Button>
          </div>
        )}
      </div>

      {/* Notifications List */}
      <div className="section-card">
        <div className="section-card-header">
          <div className="section-card-title">
            <Sparkles />
            Atividades Recentes
          </div>
          <span className="section-card-subtitle">Novidades sobre seus pets e reservas</span>
        </div>
        <div className="section-card-content">
          {notifications.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon"><BellOff /></div>
              <p className="empty-state-text">Nenhuma notificação</p>
            </div>
          ) : (
            <div className="space-y-3">
              {notifications.map((notification) => {
                const Icon = notification.icon;
                return (
                  <div
                    key={notification.id}
                    className={`flex items-start gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                      !notification.read 
                        ? "bg-primary/5 border-primary/20" 
                        : "bg-muted/30 border-transparent hover:border-border"
                    }`}
                    onClick={() => markAsRead(notification.id)}
                  >
                    <div className={`p-2 rounded-lg ${notification.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold">{notification.title}</p>
                        {!notification.read && (
                          <span className="w-2 h-2 rounded-full bg-primary animate-pulse" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground/70 mt-2">
                        {notification.time}
                      </p>
                    </div>
                    {!notification.read && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          markAsRead(notification.id);
                        }}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
