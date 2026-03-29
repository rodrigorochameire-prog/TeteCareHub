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
  Tag,
  User,
} from "lucide-react";
import { PetAvatar } from "@/components/pet-avatar";
import { InlineEdit } from "./inline-edit";
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
  isEditMode?: boolean;
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
  return m > 0 ? `${y} ano${y > 1 ? "s" : ""} ${m}m` : `${y} ano${y > 1 ? "s" : ""}`;
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  return phone;
}

function getPlanLabel(credits: number | null | undefined): string {
  if (typeof credits !== "number") return "—";
  if (credits >= 20) return "Mensalista";
  if (credits > 0) return "Avulso";
  return "Sem plano";
}

export function PetHubHeader({ pet, role, isEditMode = false }: PetHubHeaderProps) {
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

  const birthDateFormatted = pet.birthDate
    ? new Date(pet.birthDate).toLocaleDateString("pt-BR")
    : null;

  // Stat items — icon color neutral
  const stats: { icon: typeof Weight; label: string; value: string; editableField?: string; rawValue?: number | null }[] = [];
  if (weight || isEditMode) stats.push({ icon: Weight, label: "Peso", value: weight || "—", editableField: "weight", rawValue: pet.weight });
  if (birthDateFormatted) stats.push({ icon: Cake, label: "Nascimento", value: `${birthDateFormatted} (${age})` });
  if (typeof pet.credits === "number") stats.push({ icon: Star, label: "Créditos", value: `${pet.credits} diária${pet.credits !== 1 ? "s" : ""}` });
  stats.push({ icon: Tag, label: "Plano", value: getPlanLabel(pet.credits) });
  if (primaryTutor) stats.push({ icon: User, label: "Tutor", value: primaryTutor.phone ? `${primaryTutor.name} · ${formatPhone(primaryTutor.phone)}` : primaryTutor.name });

  return (
    <div className="flex flex-col gap-4">
      {/* Row 1: Back + Status */}
      <div className="flex items-center justify-between">
        <Button
          asChild
          variant="ghost"
          size="sm"
          className="h-7 gap-1.5 text-muted-foreground hover:text-foreground -ml-2"
        >
          <Link href={role === "admin" ? "/admin/pets" : "/tutor/pets"}>
            <ArrowLeft className="h-3.5 w-3.5" />
            Voltar
          </Link>
        </Button>
        <div className="flex items-center gap-1.5 rounded-full bg-muted/50 px-2.5 py-1">
          <span className={`h-2 w-2 rounded-full ${statusInfo.color}`} />
          <span className="text-xs font-medium text-muted-foreground">
            {statusInfo.label}
          </span>
        </div>
      </div>

      {/* Row 2: Avatar + Name/Actions (left) + Stats grid (right) */}
      <div className="flex flex-col lg:flex-row gap-5">
        {/* Left: Avatar + Name + Actions */}
        <div className="flex items-center gap-4 shrink-0">
          <PetAvatar
            photoUrl={pet.photoUrl}
            breed={pet.breed}
            name={pet.name}
            size={72}
            rounded="xl"
            className="shadow-md ring-2 ring-border"
          />
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground truncate">
                <InlineEdit
                  petId={pet.id}
                  field="name"
                  value={pet.name}
                  editable={isEditMode}
                />
              </h1>
              {role === "admin" && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant="ghost" size="sm" className="h-7 w-7 p-0 text-muted-foreground hover:text-foreground">
                        <Link href={`/admin/pets/${pet.id}/edit`}>
                          <Pencil className="h-3.5 w-3.5" />
                        </Link>
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
            <div className="flex items-center gap-2 mt-2">
              {phoneUrl && primaryTutor?.phone && (
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button asChild variant="outline" size="sm" className="h-8 w-8 p-0">
                        <a href={phoneUrl}><Phone className="h-3.5 w-3.5" /></a>
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
        </div>

        {/* Right: Stats — vertical aligned list */}
        <div className="hidden sm:flex flex-col gap-1.5 text-xs ml-auto border-l border-border pl-5">
          {stats.map((stat) => (
            <div key={stat.label} className="flex items-center gap-2">
              <stat.icon className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
              <span className="text-muted-foreground w-20">{stat.label}</span>
              {stat.editableField === "weight" ? (
                <span className="font-medium text-foreground">
                  <InlineEdit
                    petId={pet.id}
                    field="weight"
                    value={stat.rawValue}
                    editable={isEditMode}
                    type="number"
                    format={(v) => formatWeight(v as number | null | undefined)}
                  />
                </span>
              ) : (
                <span className="font-medium text-foreground">{stat.value}</span>
              )}
            </div>
          ))}
        </div>
        {/* Mobile: horizontal pills */}
        <div className="flex sm:hidden flex-wrap gap-1.5 text-xs mt-2">
          {stats.map((stat) => (
            <span key={stat.label} className="inline-flex items-center gap-1 bg-muted/50 rounded px-2 py-1">
              <stat.icon className="h-3 w-3 text-muted-foreground" />
              {stat.editableField === "weight" ? (
                <span className="font-medium text-foreground">
                  <InlineEdit
                    petId={pet.id}
                    field="weight"
                    value={stat.rawValue}
                    editable={isEditMode}
                    type="number"
                    format={(v) => formatWeight(v as number | null | undefined)}
                  />
                </span>
              ) : (
                <span className="font-medium text-foreground">{stat.value}</span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
