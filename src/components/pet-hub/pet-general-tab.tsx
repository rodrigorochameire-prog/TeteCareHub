"use client";

import { Badge } from "@/components/ui/badge";
import {
  Dog,
  Zap,
  Users,
  Heart,
  ShieldAlert,
  Phone,
  Mail,
  MessageCircle,
  AlertTriangle,
  CheckCircle2,
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
  species?: string | null;
  birthDate?: Date | string | null;
  weight?: number | null;
  sex?: string | null;
  size?: string | null;
  coatType?: string | null;
  notes?: string | null;
  energyLevel?: string | null;
  dogSociability?: string | null;
  humanSociability?: string | null;
  playStyle?: string | null;
  fearTriggers?: string[] | string | null;
  hasFoodAllergy?: boolean | null;
  foodAllergyDetails?: string | null;
  hasMedicationAllergy?: boolean | null;
  medicationAllergyDetails?: string | null;
  hasChronicCondition?: boolean | null;
  chronicConditionDetails?: string | null;
  emergencyVetName?: string | null;
  emergencyVetPhone?: string | null;
  tutors: Tutor[];
}

interface PetGeneralTabProps {
  pet: Pet;
  role: "admin" | "tutor";
}

function formatWeight(weight: number | null | undefined): string | null {
  if (!weight) return null;
  const kg = weight > 100 ? weight / 1000 : weight;
  return `${kg.toFixed(1)} kg`;
}

function formatBirthDate(birthDate: Date | string | null | undefined): string | null {
  if (!birthDate) return null;
  const date = new Date(birthDate);
  return date.toLocaleDateString("pt-BR");
}

function calculateAge(birthDate: Date | string | null | undefined): string | null {
  if (!birthDate) return null;
  const birth = new Date(birthDate);
  const now = new Date();
  const years = now.getFullYear() - birth.getFullYear();
  const months = now.getMonth() - birth.getMonth();
  const totalMonths = years * 12 + months;

  if (totalMonths < 12) return `${totalMonths} meses`;
  const y = Math.floor(totalMonths / 12);
  const m = totalMonths % 12;
  return m > 0 ? `${y} ano${y > 1 ? "s" : ""} e ${m} mes${m > 1 ? "es" : ""}` : `${y} ano${y > 1 ? "s" : ""}`;
}

const LABELS: Record<string, string> = {
  dog: "Cachorro",
  cat: "Gato",
  male: "Macho",
  female: "Femea",
  small: "Pequeno",
  medium: "Medio",
  large: "Grande",
  xlarge: "Extra grande",
  short: "Curto",
  medium_coat: "Medio",
  long: "Longo",
  wire: "Arame",
  curly: "Cacheado",
  very_low: "Muito Baixo",
  low: "Baixo",
  moderate: "Moderado",
  high: "Alto",
  hyperactive: "Hiperativo",
  normal: "Normal",
  medium_energy: "Moderado",
  very_high: "Muito Alto",
  social: "Sociavel",
  selective: "Seletivo",
  reactive: "Reativo",
  antisocial: "Antissocial",
  friendly: "Amigavel",
  cautious: "Cauteloso",
  fearful: "Medroso",
  excellent: "Excelente",
  good: "Bom",
  poor: "Ruim",
  wrestling: "Luta Romana",
  chase: "Perseguicao",
  fetch: "Buscar",
  tug: "Cabo de Guerra",
  independent: "Independente",
};

function label(value: string | null | undefined): string | null {
  if (!value) return null;
  return LABELS[value] ?? value;
}

// Visual level indicator bar
function LevelBar({ value, levels }: { value: string | null | undefined; levels: string[] }) {
  if (!value) return null;
  const idx = levels.indexOf(value);
  const total = levels.length;
  const filled = idx >= 0 ? idx + 1 : 0;

  if (filled === 0) return null;

  const ratio = filled / total;
  const barColor =
    ratio <= 0.25 ? "bg-red-500" : ratio <= 0.5 ? "bg-amber-500" : ratio <= 0.75 ? "bg-sky-500" : "bg-emerald-500";

  return (
    <div className="flex items-center gap-2">
      <div className="flex gap-0.5">
        {levels.map((_, i) => (
          <div
            key={i}
            className={`h-1.5 w-5 rounded-full ${i < filled ? barColor : "bg-zinc-800"}`}
          />
        ))}
      </div>
      <span className="text-xs text-foreground/80">{label(value)}</span>
    </div>
  );
}

// Clean info row - only renders if value exists
function InfoRow({ label: rowLabel, value }: { label: string; value: string | null }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-2 border-b border-zinc-800/50 last:border-b-0">
      <span className="text-muted-foreground/70 text-sm">{rowLabel}</span>
      <span className="text-sm text-foreground/90">{value}</span>
    </div>
  );
}

// Card wrapper - minimal, no header border
function SectionCard({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-xl border border-zinc-800/50 bg-zinc-900/50 p-5">
      <div className="flex items-center gap-2 mb-4">
        <Icon className="h-4 w-4 text-muted-foreground/60" />
        <h3 className="text-sm font-semibold text-foreground/90">{title}</h3>
      </div>
      {children}
    </div>
  );
}

export function PetGeneralTab({ pet }: PetGeneralTabProps) {
  const age = calculateAge(pet.birthDate);
  const birthDateStr = formatBirthDate(pet.birthDate);
  const weightStr = formatWeight(pet.weight);

  // Build birth display string
  const birthDisplay = birthDateStr
    ? age
      ? `${birthDateStr} (${age})`
      : birthDateStr
    : null;

  // Check if behavior section has any data
  const hasBehaviorData =
    pet.energyLevel || pet.dogSociability || pet.humanSociability || pet.playStyle;

  // Fear triggers
  const fearList = pet.fearTriggers
    ? Array.isArray(pet.fearTriggers)
      ? pet.fearTriggers
      : [pet.fearTriggers]
    : [];
  const hasAnyFearTriggers = fearList.length > 0 && fearList.some((t) => t.trim() !== "");

  return (
    <div className="grid gap-5 md:grid-cols-2">
      {/* Basic Info */}
      <SectionCard icon={Dog} title="Informacoes Basicas">
        <div className="flex flex-col">
          <InfoRow label="Especie" value={label(pet.species)} />
          <InfoRow label="Raca" value={pet.breed || null} />
          <InfoRow label="Sexo" value={label(pet.sex)} />
          <InfoRow label="Nascimento" value={birthDisplay} />
          <InfoRow label="Peso" value={weightStr} />
          <InfoRow label="Porte" value={label(pet.size)} />
          <InfoRow label="Pelagem" value={label(pet.coatType)} />
        </div>
        {pet.notes && (
          <p className="mt-4 text-sm text-muted-foreground/60 italic leading-relaxed">
            {pet.notes}
          </p>
        )}
      </SectionCard>

      {/* Behavior Profile - only show if there is data */}
      {(hasBehaviorData || hasAnyFearTriggers) && (
        <SectionCard icon={Zap} title="Perfil Comportamental">
          <div className="space-y-4">
            {pet.energyLevel && (
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground/60">Energia</span>
                <LevelBar value={pet.energyLevel} levels={["very_low", "low", "moderate", "high", "hyperactive"]} />
              </div>
            )}
            {pet.dogSociability && (
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground/60">Sociabilidade (caes)</span>
                <LevelBar value={pet.dogSociability} levels={["antisocial", "reactive", "selective", "social"]} />
              </div>
            )}
            {pet.humanSociability && (
              <div className="space-y-1">
                <span className="text-xs text-muted-foreground/60">Sociabilidade (humanos)</span>
                <LevelBar value={pet.humanSociability} levels={["reactive", "fearful", "cautious", "friendly"]} />
              </div>
            )}
            {pet.playStyle && (
              <div className="flex justify-between items-center py-2 border-t border-zinc-800/50">
                <span className="text-sm text-muted-foreground/70">Estilo de brincadeira</span>
                <span className="text-sm text-foreground/90">{label(pet.playStyle)}</span>
              </div>
            )}
            {hasAnyFearTriggers && (
              <div className="pt-3 border-t border-zinc-800/50">
                <p className="text-xs text-muted-foreground/60 mb-2 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3 text-amber-500/80" />
                  Gatilhos de medo
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {fearList.filter((t) => t.trim() !== "").map((trigger, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center rounded-md bg-red-500/10 text-red-400 px-2 py-0.5 text-[11px] font-medium"
                    >
                      {trigger}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </SectionCard>
      )}

      {/* Tutors */}
      <SectionCard icon={Users} title="Tutores">
        {pet.tutors.length > 0 ? (
          <div className="space-y-3">
            {pet.tutors.map((tutor) => (
              <div
                key={tutor.id}
                className="p-3 rounded-lg border border-zinc-800/50 bg-zinc-800/20"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm text-foreground/90">
                      {tutor.name}
                    </span>
                    {tutor.isPrimary && (
                      <span className="text-[10px] text-muted-foreground/50 bg-zinc-800 rounded px-1.5 py-0.5">
                        Principal
                      </span>
                    )}
                  </div>
                  {tutor.phone && (
                    <a
                      href={`https://wa.me/55${tutor.phone.replace(/\D/g, "")}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="h-7 w-7 inline-flex items-center justify-center rounded-md bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600/20 transition-colors"
                    >
                      <MessageCircle className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                <div className="flex flex-col gap-1">
                  <a
                    href={`mailto:${tutor.email}`}
                    className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors flex items-center gap-1.5"
                  >
                    <Mail className="h-3 w-3" />
                    {tutor.email}
                  </a>
                  {tutor.phone && (
                    <a
                      href={`tel:+55${tutor.phone.replace(/\D/g, "")}`}
                      className="text-xs text-muted-foreground/60 hover:text-foreground transition-colors flex items-center gap-1.5"
                    >
                      <Phone className="h-3 w-3" />
                      {tutor.phone}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-8 w-8 text-muted-foreground/20 mx-auto mb-2" />
            <p className="text-sm text-muted-foreground/50">Nenhum tutor associado.</p>
          </div>
        )}
      </SectionCard>

      {/* Health Summary */}
      <SectionCard icon={Heart} title="Saude">
        <div className="flex flex-col">
          <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
            <span className="text-sm text-muted-foreground/70">Alergia alimentar</span>
            {pet.hasFoodAllergy ? (
              <Badge variant="destructive" className="gap-1 text-[11px]">
                <AlertTriangle className="h-3 w-3" />
                Sim
              </Badge>
            ) : (
              <span className="flex items-center gap-1 text-emerald-500/80 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Nao
              </span>
            )}
          </div>
          {pet.foodAllergyDetails && (
            <p className="text-xs text-muted-foreground/60 py-1.5 pl-3 border-l-2 border-red-500/20">
              {pet.foodAllergyDetails}
            </p>
          )}

          <div className="flex justify-between items-center py-2 border-b border-zinc-800/50">
            <span className="text-sm text-muted-foreground/70">Alergia a medicamentos</span>
            {pet.hasMedicationAllergy ? (
              <Badge variant="destructive" className="gap-1 text-[11px]">
                <AlertTriangle className="h-3 w-3" />
                Sim
              </Badge>
            ) : (
              <span className="flex items-center gap-1 text-emerald-500/80 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Nao
              </span>
            )}
          </div>
          {pet.medicationAllergyDetails && (
            <p className="text-xs text-muted-foreground/60 py-1.5 pl-3 border-l-2 border-red-500/20">
              {pet.medicationAllergyDetails}
            </p>
          )}

          <div className="flex justify-between items-center py-2 border-b border-zinc-800/50 last:border-b-0">
            <span className="text-sm text-muted-foreground/70">Condicao cronica</span>
            {pet.hasChronicCondition ? (
              <Badge variant="destructive" className="gap-1 text-[11px]">
                <AlertTriangle className="h-3 w-3" />
                Sim
              </Badge>
            ) : (
              <span className="flex items-center gap-1 text-emerald-500/80 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Nao
              </span>
            )}
          </div>
          {pet.chronicConditionDetails && (
            <p className="text-xs text-muted-foreground/60 py-1.5 pl-3 border-l-2 border-red-500/20">
              {pet.chronicConditionDetails}
            </p>
          )}
        </div>

        {(pet.emergencyVetName || pet.emergencyVetPhone) && (
          <div className="mt-4 pt-3 border-t border-zinc-800/50">
            <p className="text-xs text-muted-foreground/60 mb-1.5 flex items-center gap-1">
              <ShieldAlert className="h-3 w-3" /> Veterinario de emergencia
            </p>
            {pet.emergencyVetName && (
              <p className="text-sm text-foreground/90">{pet.emergencyVetName}</p>
            )}
            {pet.emergencyVetPhone && (
              <a
                href={`tel:+55${pet.emergencyVetPhone.replace(/\D/g, "")}`}
                className="text-sm text-muted-foreground/60 hover:text-foreground transition-colors"
              >
                {pet.emergencyVetPhone}
              </a>
            )}
          </div>
        )}
      </SectionCard>
    </div>
  );
}
