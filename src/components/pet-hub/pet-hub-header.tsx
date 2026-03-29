"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  PawPrint,
  MessageCircle,
  Phone,
  Zap,
  Weight,
  Cake,
  Star,
  Pencil,
} from "lucide-react";

interface Tutor {
  id: number;
  name: string;
  email: string;
  phone?: string | null;
  isPrimary: boolean;
}

interface Pet {
  id: number;
  name: string;
  breed?: string | null;
  photoUrl?: string | null;
  weight?: number | null;
  status?: string | null;
  birthDate?: Date | string | null;
  energyLevel?: string | null;
  credits?: number | null;
  tutors: Tutor[];
}

interface PetHubHeaderProps {
  pet: Pet;
  role?: "admin" | "tutor";
}

function getStatusBadge(status?: string | null) {
  switch (status) {
    case "active":
      return <Badge variant="success">Ativo</Badge>;
    case "at_daycare":
      return <Badge variant="info">Na creche</Badge>;
    case "inactive":
      return <Badge variant="secondary">Inativo</Badge>;
    default:
      return <Badge variant="success">Ativo</Badge>;
  }
}

function formatWeight(weight: number | null | undefined): string {
  if (!weight) return "";
  const kg = weight > 100 ? weight / 1000 : weight;
  return `${kg.toFixed(1)} kg`;
}

function calculateAge(birthDate: Date | string | null | undefined): string {
  if (!birthDate) return "";
  const birth = new Date(birthDate);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  const totalMonths = years * 12 + months;

  if (totalMonths < 1) return "Filhote";
  if (totalMonths < 12) return `${totalMonths}m`;
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  return m > 0 ? `${y}a ${m}m` : `${y}a`;
}

const ENERGY_LABELS: Record<string, { label: string; color: string }> = {
  high: { label: "Alta", color: "text-emerald-400" },
  normal: { label: "Normal", color: "text-sky-400" },
  low: { label: "Baixa", color: "text-amber-400" },
};

export function PetHubHeader({ pet, role }: PetHubHeaderProps) {
  const primaryTutor = pet.tutors.find((t) => t.isPrimary) ?? pet.tutors[0];
  const weight = formatWeight(pet.weight);
  const age = calculateAge(pet.birthDate);
  const energyInfo = pet.energyLevel
    ? ENERGY_LABELS[pet.energyLevel] ?? { label: pet.energyLevel, color: "text-muted-foreground" }
    : null;

  const whatsappUrl = primaryTutor?.phone
    ? `https://wa.me/55${primaryTutor.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Ola ${primaryTutor.name}, sobre ${pet.name}...`
      )}`
    : null;

  const phoneUrl = primaryTutor?.phone
    ? `tel:+55${primaryTutor.phone.replace(/\D/g, "")}`
    : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Top row: Avatar + Info + Actions */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
        {/* Large Avatar */}
        <div className="relative shrink-0">
          <Avatar className="h-24 w-24 ring-2 ring-border ring-offset-2 ring-offset-background">
            <AvatarImage src={pet.photoUrl ?? undefined} alt={pet.name} />
            <AvatarFallback className="bg-muted">
              <PawPrint className="h-10 w-10 text-muted-foreground" />
            </AvatarFallback>
          </Avatar>
          <div className="absolute -bottom-1 -right-1">
            {getStatusBadge(pet.status)}
          </div>
        </div>

        {/* Name + breed */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <div className="flex items-center gap-2 flex-wrap justify-center sm:justify-start">
            <h1 className="text-2xl font-bold tracking-tight truncate">{pet.name}</h1>
            {role === "admin" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Editar pet</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
          {pet.breed && (
            <p className="text-sm text-muted-foreground mt-0.5">{pet.breed}</p>
          )}

          {/* Quick stats row */}
          <div className="flex items-center gap-2 mt-3 flex-wrap justify-center sm:justify-start">
            {age && (
              <div className="flex items-center gap-1.5 rounded-md bg-muted/50 border border-border/50 px-2.5 py-1 text-xs">
                <Cake className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">{age}</span>
              </div>
            )}
            {weight && (
              <div className="flex items-center gap-1.5 rounded-md bg-muted/50 border border-border/50 px-2.5 py-1 text-xs">
                <Weight className="h-3.5 w-3.5 text-muted-foreground" />
                <span className="font-medium">{weight}</span>
              </div>
            )}
            {energyInfo && (
              <div className="flex items-center gap-1.5 rounded-md bg-muted/50 border border-border/50 px-2.5 py-1 text-xs">
                <Zap className={`h-3.5 w-3.5 ${energyInfo.color}`} />
                <span className="font-medium">{energyInfo.label}</span>
              </div>
            )}
            {typeof pet.credits === "number" && (
              <div className="flex items-center gap-1.5 rounded-md bg-muted/50 border border-border/50 px-2.5 py-1 text-xs">
                <Star className="h-3.5 w-3.5 text-amber-400" />
                <span className="font-medium">{pet.credits}</span>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {phoneUrl && primaryTutor?.phone && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button asChild variant="outline" size="sm" className="h-9 w-9 p-0">
                    <a href={phoneUrl}>
                      <Phone className="h-4 w-4" />
                    </a>
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Ligar para {primaryTutor.name}</TooltipContent>
              </Tooltip>
            </TooltipProvider>
          )}
          {whatsappUrl && (
            <Button asChild size="sm" className="gap-2 bg-emerald-600 hover:bg-emerald-700 text-white">
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </Button>
          )}
        </div>
      </div>

      {/* Tutor section */}
      {primaryTutor && (
        <>
          <Separator />
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <span>Tutor:</span>
            <span className="font-medium text-foreground">{primaryTutor.name}</span>
            {primaryTutor.phone && (
              <a
                href={`tel:+55${primaryTutor.phone.replace(/\D/g, "")}`}
                className="hover:text-foreground transition-colors"
              >
                {primaryTutor.phone}
              </a>
            )}
            {pet.tutors.length > 1 && (
              <Badge variant="secondary" className="text-[10px]">
                +{pet.tutors.length - 1} tutor{pet.tutors.length > 2 ? "es" : ""}
              </Badge>
            )}
          </div>
        </>
      )}
    </div>
  );
}
