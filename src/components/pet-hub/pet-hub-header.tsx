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
  ArrowLeft,
  Cake,
  Weight,
  Star,
  UserX,
} from "lucide-react";
import { PetAvatar } from "@/components/pet-avatar";
import Link from "next/link";

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
  sex?: string | null;
  size?: string | null;
  neuteredStatus?: string | null;
}

interface PetHubHeaderProps {
  pet: Pet;
  role?: "admin" | "tutor";
}

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  active: { label: "Ativo", color: "bg-emerald-500" },
  at_daycare: { label: "Na creche", color: "bg-sky-500" },
  "checked-out": { label: "Fora da Creche", color: "bg-amber-500" },
  inactive: { label: "Inativo", color: "bg-muted-foreground" },
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
        `Olá ${primaryTutor.name}, sobre ${pet.name}...`
      )}`
    : null;

  const phoneUrl = primaryTutor?.phone
    ? `tel:+55${primaryTutor.phone.replace(/\D/g, "")}`
    : null;

  // Sex / size / neutered labels
  const SEX_LABELS: Record<string, string> = { male: "♂ Macho", female: "♀ Fêmea" };
  const SIZE_LABELS: Record<string, string> = { small: "Pequeno", medium: "Médio", large: "Grande", xlarge: "Extra grande" };
  const NEUTERED_LABELS: Record<string, string> = { yes: "Castrado", no: "Não castrado", scheduled: "Castração agendada" };

  // Build stats pills with icons
  const statPills: { icon: typeof Cake; label: string }[] = [];
  if (age) statPills.push({ icon: Cake, label: age });
  if (weight) statPills.push({ icon: Weight, label: weight });
  if (pet.sex && SEX_LABELS[pet.sex]) statPills.push({ icon: Cake, label: SEX_LABELS[pet.sex] });
  if (pet.size && SIZE_LABELS[pet.size]) statPills.push({ icon: Weight, label: SIZE_LABELS[pet.size] });
  if (pet.neuteredStatus && NEUTERED_LABELS[pet.neuteredStatus]) statPills.push({ icon: Star, label: NEUTERED_LABELS[pet.neuteredStatus] });
  if (typeof pet.credits === "number") statPills.push({ icon: Star, label: `${pet.credits} cred.` });

  return (
    <div className="flex flex-col gap-5">
      {/* Gradient accent strip */}
      <div className="absolute inset-x-0 top-0 h-1.5 rounded-t-lg bg-primary/10" />

      {/* Back button */}
      <div className="flex items-center gap-2 -mt-1">
        <Button asChild variant="ghost" size="sm" className="h-7 gap-1.5 text-muted-foreground hover:text-foreground -ml-2 transition-colors duration-200">
          <Link href={role === "admin" ? "/pets" : "/portal/pets"}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </Link>
        </Button>
      </div>

      {/* Top row: Avatar + Info + Actions */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5">
        {/* Avatar — overlaps the top accent strip */}
        <div className="shrink-0 -mt-3">
          <PetAvatar
            photoUrl={pet.photoUrl}
            breed={pet.breed}
            name={pet.name}
            size={80}
            rounded="xl"
            className="shadow-lg ring-2 ring-background"
          />
        </div>

        {/* Name + breed + stats */}
        <div className="flex-1 min-w-0 text-center sm:text-left">
          <div className="flex items-center gap-2.5 flex-wrap justify-center sm:justify-start">
            <h1 className="text-2xl font-bold tracking-tight truncate text-foreground">
              {pet.name}
            </h1>
            {role === "admin" && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground transition-colors duration-200"
                    >
                      <Pencil className="h-3.5 w-3.5" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Editar pet</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>

          {/* Breed + inline stat pills with icons */}
          <div className="flex items-center gap-2 mt-1 flex-wrap justify-center sm:justify-start">
            {pet.breed && (
              <span className="text-sm text-muted-foreground">{pet.breed}</span>
            )}
            {statPills.length > 0 && (
              <div className="flex items-center gap-1.5">
                {statPills.map((stat) => {
                  const PillIcon = stat.icon;
                  return (
                    <span
                      key={stat.label}
                      className="inline-flex items-center gap-1 rounded-md bg-muted text-foreground px-2 py-0.5 text-xs font-medium"
                    >
                      <PillIcon className="h-3 w-3 text-muted-foreground" />
                      {stat.label}
                    </span>
                  );
                })}
              </div>
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
          {primaryTutor ? (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground justify-center sm:justify-start">
              <span>Tutor:</span>
              <span className="text-foreground font-medium">
                {primaryTutor.name}
              </span>
              {primaryTutor.phone && (
                <>
                  <span className="text-muted-foreground">&middot;</span>
                  <a
                    href={`tel:+55${primaryTutor.phone.replace(/\D/g, "")}`}
                    className="hover:text-foreground transition-colors duration-200"
                  >
                    {formatPhone(primaryTutor.phone)}
                  </a>
                </>
              )}
              {pet.tutors.length > 1 && (
                <span className="text-muted-foreground">
                  +{pet.tutors.length - 1}
                </span>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-1.5 mt-2 text-xs text-muted-foreground justify-center sm:justify-start">
              <UserX className="h-3 w-3" />
              <span>Nenhum tutor associado</span>
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
                    className="h-9 w-9 p-0 transition-all duration-200"
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
              className="gap-2 bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 transition-all duration-200"
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
