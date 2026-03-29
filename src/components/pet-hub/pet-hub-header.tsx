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

  // Labels
  const SEX_LABELS: Record<string, string> = { male: "Macho", female: "Fêmea" };
  const SIZE_LABELS: Record<string, string> = { small: "Pequeno", medium: "Médio", large: "Grande", xlarge: "Extra grande" };

  // Format birth date
  const birthDateFormatted = pet.birthDate
    ? new Date(pet.birthDate).toLocaleDateString("pt-BR")
    : null;

  return (
    <div className="flex flex-col gap-4">
      {/* Back button */}
      <div className="flex items-center justify-between">
        <Button asChild variant="ghost" size="sm" className="h-7 gap-1.5 text-muted-foreground hover:text-foreground -ml-2">
          <Link href={role === "admin" ? "/admin/pets" : "/tutor/pets"}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </Link>
        </Button>
        <div className="flex items-center gap-1.5">
          <span className={`h-2 w-2 rounded-full ${statusInfo.color}`} />
          <span className="text-xs text-muted-foreground">{statusInfo.label}</span>
        </div>
      </div>

      {/* Main: Avatar + Info + Details + Actions */}
      <div className="flex flex-col sm:flex-row gap-5">
        {/* Avatar */}
        <div className="shrink-0 self-center sm:self-start">
          <PetAvatar
            photoUrl={pet.photoUrl}
            breed={pet.breed}
            name={pet.name}
            size={88}
            rounded="xl"
            className="shadow-md ring-2 ring-border"
          />
        </div>

        {/* Info + Details — 2 sub-columns on larger screens */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            {/* Left: Name + breed + actions */}
            <div className="text-center sm:text-left">
              <div className="flex items-center gap-2 justify-center sm:justify-start">
                <h1 className="text-2xl font-bold tracking-tight text-foreground">{pet.name}</h1>
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

              {/* Actions */}
              <div className="flex items-center gap-2 mt-3 justify-center sm:justify-start">
                {phoneUrl && primaryTutor?.phone && (
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button asChild variant="outline" size="sm" className="h-8 w-8 p-0">
                          <a href={phoneUrl}>
                            <Phone className="h-3.5 w-3.5" />
                          </a>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>Ligar para {primaryTutor.name}</TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                )}
                {whatsappUrl && (
                  <Button asChild size="sm" className="gap-1.5 h-8 bg-emerald-600 hover:bg-emerald-500 text-white">
                    <a href={whatsappUrl} target="_blank" rel="noopener noreferrer">
                      <MessageCircle className="h-3.5 w-3.5" />
                      WhatsApp
                    </a>
                  </Button>
                )}
              </div>
            </div>

            {/* Right: Pet details grid */}
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-xs">
              {birthDateFormatted && (
                <DetailItem icon={Cake} label="Nascimento" value={`${birthDateFormatted} (${age})`} />
              )}
              {weight && (
                <DetailItem icon={Weight} label="Peso" value={weight} />
              )}
              {pet.sex && SEX_LABELS[pet.sex] && (
                <DetailItem label="Sexo" value={SEX_LABELS[pet.sex]} />
              )}
              {pet.size && SIZE_LABELS[pet.size] && (
                <DetailItem label="Porte" value={SIZE_LABELS[pet.size]} />
              )}
              {typeof pet.credits === "number" && (
                <DetailItem icon={Star} label="Créditos" value={String(pet.credits)} />
              )}
              {typeof pet.credits === "number" && (
                <DetailItem label="Plano" value={pet.credits >= 20 ? "Mensalista" : pet.credits > 0 ? "Avulso" : "Sem plano"} />
              )}
              {primaryTutor && (
                <DetailItem label="Tutor" value={primaryTutor.name} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailItem({ icon: Icon, label, value }: { icon?: typeof Cake; label: string; value: string }) {
  return (
    <div className="flex items-start gap-1.5">
      {Icon && <Icon className="h-3 w-3 text-muted-foreground mt-0.5" />}
      <div>
        <p className="text-muted-foreground leading-none">{label}</p>
        <p className="font-medium text-foreground mt-0.5 leading-none">{value}</p>
      </div>
    </div>
  );
}
