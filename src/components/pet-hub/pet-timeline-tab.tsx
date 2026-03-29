"use client";

import { trpc } from "@/lib/trpc/client";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Clock,
  FileText,
  Calendar,
  Weight,
  UtensilsCrossed,
  AlertTriangle,
  PawPrint,
} from "lucide-react";
import { formatDistanceToNow, format, isToday, isYesterday } from "date-fns";
import { ptBR } from "date-fns/locale";

interface PetTimelineTabProps {
  petId: number;
  role: "admin" | "tutor";
}

type TimelineEventType = "log" | "event" | "weight" | "feeding" | "alert";

const EVENT_CONFIG: Record<
  TimelineEventType,
  {
    dotColor: string;
    label: string;
    icon: typeof Clock;
    badgeVariant: "default" | "secondary" | "destructive" | "outline";
  }
> = {
  log: {
    dotColor: "bg-emerald-500",
    label: "Registro Diário",
    icon: FileText,
    badgeVariant: "default",
  },
  event: {
    dotColor: "bg-blue-500",
    label: "Evento",
    icon: Calendar,
    badgeVariant: "secondary",
  },
  weight: {
    dotColor: "bg-violet-500",
    label: "Pesagem",
    icon: Weight,
    badgeVariant: "outline",
  },
  feeding: {
    dotColor: "bg-amber-500",
    label: "Alimentação",
    icon: UtensilsCrossed,
    badgeVariant: "secondary",
  },
  alert: {
    dotColor: "bg-red-500",
    label: "Alerta",
    icon: AlertTriangle,
    badgeVariant: "destructive",
  },
};

function formatRelativeDate(date: Date | string): string {
  const d = new Date(date);
  if (isToday(d)) return `Hoje · ${format(d, "HH:mm")}`;
  if (isYesterday(d)) return `Ontem · ${format(d, "HH:mm")}`;
  const distance = formatDistanceToNow(d, { addSuffix: true, locale: ptBR });
  return `${format(d, "dd/MM/yyyy")} · ${distance}`;
}

function getEventDescription(
  type: TimelineEventType,
  data: Record<string, unknown>
): string {
  switch (type) {
    case "log": {
      const parts: string[] = [];
      if (data.mood) parts.push(`Humor: ${data.mood}`);
      if (data.energy) parts.push(`Energia: ${data.energy}`);
      if (data.appetite) parts.push(`Apetite: ${data.appetite}`);
      return parts.length > 0 ? parts.join(" · ") : "Registro diário";
    }
    case "event": {
      const title = data.title as string | undefined;
      const eventType = data.eventType as string | undefined;
      const status = data.status as string | undefined;
      const parts: string[] = [];
      if (title) parts.push(title);
      if (eventType) parts.push(eventType);
      if (status) parts.push(`(${status})`);
      return parts.length > 0 ? parts.join(" · ") : "Evento agendado";
    }
    case "weight": {
      const w = data.weightKg as number | undefined;
      return w ? `Peso registrado: ${w.toFixed(1)} kg` : "Pesagem registrada";
    }
    case "feeding": {
      const meal = data.mealType as string | undefined;
      const consumption = data.consumption as string | undefined;
      const grams = data.amountGrams as number | undefined;
      const parts: string[] = [];
      if (meal) parts.push(meal);
      if (grams) parts.push(`${grams}g`);
      if (consumption) parts.push(consumption);
      return parts.length > 0 ? parts.join(" · ") : "Alimentação registrada";
    }
    case "alert": {
      const title = data.title as string | undefined;
      const severity = data.severity as string | undefined;
      const parts: string[] = [];
      if (title) parts.push(title);
      if (severity) parts.push(`[${severity}]`);
      return parts.length > 0 ? parts.join(" ") : "Alerta";
    }
    default:
      return "Evento";
  }
}

export function PetTimelineTab({ petId }: PetTimelineTabProps) {
  const { data: timeline, isLoading } =
    trpc.petManagement.getUnifiedTimeline.useQuery({
      petId,
      limit: 50,
    });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex gap-4">
            <Skeleton className="h-3 w-3 rounded-full shrink-0 mt-1" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-32" />
              <Skeleton className="h-3 w-48" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!timeline || timeline.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="rounded-full bg-muted p-4 mb-4">
          <PawPrint className="h-8 w-8 text-muted-foreground/40" />
        </div>
        <p className="font-medium text-foreground">
          Nenhum evento registrado ainda
        </p>
        <p className="text-sm text-muted-foreground mt-1 max-w-xs">
          A timeline mostrará registros diários, eventos, pesagens, alimentação
          e alertas conforme forem criados.
        </p>
      </div>
    );
  }

  return (
    <div className="relative">
      {/* Vertical timeline line */}
      <div className="absolute left-[7px] top-2 bottom-2 w-px bg-border" />

      <div className="space-y-1">
        {timeline.map((item, index) => {
          const config = EVENT_CONFIG[item.type as TimelineEventType] ?? EVENT_CONFIG.log;
          const Icon = config.icon;
          const data = item.data as Record<string, unknown>;
          const notes =
            (data.notes as string | undefined) ||
            (data.description as string | undefined);

          return (
            <div key={`${item.type}-${index}`} className="relative flex gap-3 pl-0">
              {/* Dot */}
              <div
                className={`relative z-10 mt-1.5 h-3.5 w-3.5 shrink-0 rounded-full border-2 border-card ${config.dotColor}`}
              />

              {/* Card */}
              <div className="flex-1 rounded-lg bg-muted/30 p-3 mb-1 hover:bg-muted/50 transition-colors">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <Badge variant={config.badgeVariant} className="gap-1 text-xs h-5">
                    <Icon className="h-3 w-3" />
                    {config.label}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatRelativeDate(item.date)}
                  </span>
                </div>
                <p className="text-sm text-foreground">
                  {getEventDescription(item.type as TimelineEventType, data)}
                </p>
                {notes && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {notes}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
