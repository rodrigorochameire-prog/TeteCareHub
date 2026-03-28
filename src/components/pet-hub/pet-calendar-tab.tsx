"use client";

import { trpc } from "@/lib/trpc/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Calendar, Plus, Trash2, Clock, MapPin } from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PetCalendarTabProps {
  petId: number;
  role: "admin" | "tutor";
}

const STATUS_LABELS: Record<string, { label: string; variant: "success" | "info" | "warning" | "secondary" | "destructive" }> = {
  scheduled: { label: "Agendado", variant: "info" },
  completed: { label: "Concluido", variant: "success" },
  cancelled: { label: "Cancelado", variant: "destructive" },
  pending: { label: "Pendente", variant: "warning" },
};

export function PetCalendarTab({ petId, role }: PetCalendarTabProps) {
  const { data, isLoading } = trpc.calendar.byPet.useQuery({ petId });

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <Skeleton className="h-6 w-32 mb-4" />
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            Eventos
          </CardTitle>
          <Button variant="outline" size="sm" className="gap-1">
            <Plus className="h-3.5 w-3.5" />
            Adicionar
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {data && data.length > 0 ? (
          <div className="space-y-3">
            {data.map((event) => {
              const statusInfo = STATUS_LABELS[event.status ?? "scheduled"] ?? STATUS_LABELS.scheduled;
              return (
                <div
                  key={event.id}
                  className="flex items-center justify-between p-3 rounded-lg border text-sm"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {event.color && (
                        <span
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: event.color }}
                        />
                      )}
                      <p className="font-medium truncate">{event.title}</p>
                      <Badge variant={statusInfo.variant} className="text-[10px]">
                        {statusInfo.label}
                      </Badge>
                      {event.typeInfo && (
                        <Badge variant="secondary" className="text-[10px]">
                          {event.typeInfo.label}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-muted-foreground text-xs mt-1">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {format(new Date(event.eventDate), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </span>
                      {event.location && (
                        <span className="flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          {event.location}
                        </span>
                      )}
                    </div>
                    {event.description && (
                      <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                        {event.description}
                      </p>
                    )}
                  </div>
                  {role === "admin" && (
                    <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive shrink-0">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground text-center py-4">
            Nenhum evento registrado.
          </p>
        )}
      </CardContent>
    </Card>
  );
}
