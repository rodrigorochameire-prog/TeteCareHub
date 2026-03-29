"use client";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  MessageCircle,
  Phone,
  Pencil,
} from "lucide-react";
import { PetAvatar } from "@/components/pet-avatar";

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
  species?: string | null;
}

interface PetHubHeaderProps {
  pet: Pet;
  role?: "admin" | "tutor";
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: "Ativo", color: "bg-emerald-500" },
  at_daycare: { label: "Na creche", color: "bg-sky-500" },
  "checked-out": { label: "Fora da Creche", color: "bg-amber-500" },
  inactive: { label: "Inativo", color: "bg-zinc-500" },
};

function formatWeight(weight: number | null | undefined): string {
  if (!weight) return "";
  const kg = weight > 100 ? weight / 1000 : weight;
  return `${kg.toFixed(1)}kg`;
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

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

export function PetHubHeader({ pet, role }: PetHubHeaderProps) {
  const primaryTutor = pet.tutors.find((t) => t.isPrimary) ?? pet.tutors[0];
  const weight = formatWeight(pet.weight);
  const age = calculateAge(pet.birthDate);
  const statusInfo = STATUS_MAP[pet.status ?? "active"] ?? STATUS_MAP.active;

  const whatsappUrl = primaryTutor?.phone
    ? `https://wa.me/55${primaryTutor.phone.replace(/\D/g, "")}?text=${encodeURIComponent(
        `Ola ${primaryTutor.name}, sobre ${pet.name}...`
      )}`
    : null;

  const phoneUrl = primaryTutor?.phone
    ? `tel:+55${primaryTutor.phone.replace(/\D/g, "")}`
    : null;

  // Build stats string: "1a 2m · 12.0kg · 10 creditos"
  const statParts: string[] = [];
  if (age) statParts.push(age);
  if (weight) statParts.push(weight);
  if (typeof pet.credits === "number") statParts.push(`${pet.credits} cred.`);

  return (
    <div className="flex flex-col gap-5">
      {/* Top row: Avatar + Info + Actions */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* Avatar */}
        <div className="shrink-0">
          <PetAvatar
            photoUrl={pet.photoUrl}
            breed={pet.breed}
            name={pet.name}
            size={80}
            rounded="xl"
            className="shadow-lg shadow-black/20 ring-1 ring-white/10"
          />
        </div>

        {/* Name + breed + stats */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
            <h1 className="text-3xl font-bold tracking-tight truncate">
              {pet.name}
            </h1>
            {role === "admin" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground/50 hover:text-foreground"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Editar pet</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Breed + inline stats */}
          <div className="flex items-center gap-2 mt-1 flex-wrap justify-center sm:justify-start">
            {pet.breed && (
              <span className="text-sm text-muted-foreground">{pet.breed}</span>
            )}
            {pet.breed && statParts.length > 0 && (
              <span className="text-muted-foreground/40">|</span>
            )}
            {statParts.length > 0 && (
              <span className="text-sm text-muted-foreground/70">
                {statParts.join(" \u00b7 ")}
              </span>
            )}
          </div>

          {/* Status dot + text */}
          <div className="flex items-center gap-1.5 mt-2.5 justify-center sm:justify-start">
            <span className={`h-2 w-2 rounded-full ${statusInfo.color}`} />
            <span className="text-xs text-muted-foreground">
              {statusInfo.label}
            </span>
          </div>

          {/* Tutor inline */}
          {primaryTutor && (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground/70 justify-center sm:justify-start">
              <span>Tutor:</span>
              <span className="text-foreground/80 font-medium">
                {primaryTutor.name}
              </span>
              {primaryTutor.phone && (
                <>
                  <span className="text-muted-foreground/30">&middot;</span>
                  <a
                    href={`tel:+55${primaryTutor.phone.replace(/\D/g, "")}`}
                    className="hover:text-foreground transition-colors"
                  >
                    {formatPhone(primaryTutor.phone)}
                  </a>
                </>
              )}
              {pet.tutors.length > 1 && (
                <span className="text-muted-foreground/40">
                  +{pet.tutors.length - 1}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2 shrink-0">
          {phoneUrl && primaryTutor?.phone && (
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    asChild
                    variant="outline"
                    size="sm"
                    className="h-9 w-9 p-0 border-zinc-700 hover:border-zinc-600"
                  >
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
            <Button
              asChild
              size="sm"
              className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-900/30"
            >
              <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                <MessageCircle className="h-4 w-4" />
                WhatsApp
              </a>
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
