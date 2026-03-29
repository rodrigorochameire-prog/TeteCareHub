"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Zap,
  Phone,
  MessageCircle,
  AlertTriangle,
  Stethoscope,
  ClipboardList,
  UserRound,
  PawPrint,
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
  neuteredStatus?: string | null;
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
  return m > 0 ? `${y} ano${y > 1 ? "s" : ""} e ${m} mês${m > 1 ? "es" : ""}` : `${y} ano${y > 1 ? "s" : ""}`;
}

function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 11) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }
  if (digits.length === 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return phone;
}

const LABELS: Record<string, string> = {
  dog: "Cachorro",
  cat: "Gato",
  male: "Macho",
  female: "Fêmea",
  small: "Pequeno",
  medium: "Médio",
  large: "Grande",
  xlarge: "Extra grande",
  short: "Curto",
  medium_coat: "Médio",
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
  social: "Sociável",
  selective: "Seletivo",
  reactive: "Reativo",
  antisocial: "Antissocial",
  friendly: "Amigável",
  cautious: "Cauteloso",
  fearful: "Medroso",
  excellent: "Excelente",
  good: "Bom",
  poor: "Ruim",
  wrestling: "Luta Romana",
  chase: "Perseguição",
  fetch: "Buscar",
  tug: "Cabo de Guerra",
  independent: "Independente",
  yes: "Sim",
  no: "Não",
  scheduled: "Agendado",
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
            className={`h-1.5 w-5 rounded-full ${i < filled ? barColor : "bg-muted"}`}
          />
        ))}
      </div>
      <span className="text-xs text-foreground">{label(value)}</span>
    </div>
  );
}

// Compact info row — only renders when value is truthy
function CompactRow({ label: rowLabel, value }: { label: string; value: string | null | undefined }) {
  if (!value) return null;
  return (
    <div className="flex justify-between items-center py-1 text-sm">
      <span className="text-muted-foreground text-xs">{rowLabel}</span>
      <span className="text-foreground font-medium text-xs">{value}</span>
    </div>
  );
}

// Tutor contact block
function TutorContact({ tutor, isPrimary }: { tutor: Tutor; isPrimary?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium text-sm text-foreground truncate">{tutor.name}</span>
          {isPrimary && (
            <Badge variant="secondary" className="text-[10px] shrink-0">
              Principal
            </Badge>
          )}
        </div>
        {tutor.phone && (
          <a
            href={`tel:+55${tutor.phone.replace(/\D/g, "")}`}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {formatPhone(tutor.phone)}
          </a>
        )}
      </div>
      {tutor.phone && (
        <a
          href={`https://wa.me/55${tutor.phone.replace(/\D/g, "")}`}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`WhatsApp de ${tutor.name}`}
          className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-emerald-600 hover:bg-emerald-600/10 transition-colors"
        >
          <MessageCircle className="h-4 w-4" />
        </a>
      )}
    </div>
  );
}

export function PetGeneralTab({ pet, role }: PetGeneralTabProps) {
  const age = calculateAge(pet.birthDate);
  const birthDateStr = formatBirthDate(pet.birthDate);
  const weightStr = formatWeight(pet.weight);

  // Build birth display string
  const birthDisplay = birthDateStr
    ? age
      ? `${birthDateStr} (${age})`
      : birthDateStr
    : null;

  // Neutered display
  const neuteredDisplay = pet.neuteredStatus === "yes"
    ? "Sim"
    : pet.neuteredStatus === "scheduled"
      ? "Agendado"
      : pet.neuteredStatus === "no"
        ? "Não"
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
  const activeFearTriggers = fearList.filter((t) => t.trim() !== "");

  // Allergy flags
  const hasAnyAllergy = pet.hasFoodAllergy || pet.hasMedicationAllergy;
  const hasChronicCondition = pet.hasChronicCondition;

  // Sort tutors: primary first
  const sortedTutors = [...pet.tutors].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

  // Has emergency vet
  const hasEmergencyVet = pet.emergencyVetName || pet.emergencyVetPhone;

  // Has quick-access content
  const hasQuickAccessContent =
    sortedTutors.length > 0 ||
    hasEmergencyVet ||
    hasAnyAllergy ||
    hasChronicCondition ||
    activeFearTriggers.length > 0 ||
    pet.notes;

  return (
    <div className="space-y-5">
      {/* 3-column grid */}
      <div className="grid gap-5 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {/* Column 1 — Perfil (compact) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <PawPrint className="h-4 w-4 text-muted-foreground" />
              Perfil
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col divide-y divide-border">
              <CompactRow label="Raça" value={pet.breed} />
              <CompactRow label="Sexo" value={label(pet.sex)} />
              <CompactRow label="Nascimento" value={birthDisplay} />
              <CompactRow label="Peso" value={weightStr} />
              <CompactRow label="Porte" value={label(pet.size)} />
              <CompactRow label="Pelagem" value={label(pet.coatType)} />
              <CompactRow label="Castrado" value={neuteredDisplay} />
            </div>
          </CardContent>
        </Card>

        {/* Column 2 — Acesso Rápido (KEY card) */}
        <Card className="border-l-4 border-l-primary bg-primary/[0.02]">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Phone className="h-4 w-4 text-primary" />
              Acesso Rápido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Tutores */}
            {sortedTutors.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                  Tutores
                </span>
                <div className="space-y-2">
                  {sortedTutors.map((tutor) => (
                    <TutorContact key={tutor.id} tutor={tutor} isPrimary={tutor.isPrimary} />
                  ))}
                </div>
              </div>
            )}

            {/* Veterinário de emergência */}
            {hasEmergencyVet && (
              <>
                <Separator />
                <div className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <Stethoscope className="h-3 w-3 text-red-500" />
                    Veterinário de emergência
                  </span>
                  {pet.emergencyVetName && (
                    <p className="text-sm font-medium text-foreground">{pet.emergencyVetName}</p>
                  )}
                  {pet.emergencyVetPhone && (
                    <a
                      href={`tel:+55${pet.emergencyVetPhone.replace(/\D/g, "")}`}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                    >
                      <Phone className="h-3 w-3" />
                      {formatPhone(pet.emergencyVetPhone)}
                    </a>
                  )}
                </div>
              </>
            )}

            {/* Alergias */}
            {(hasAnyAllergy || hasChronicCondition) && (
              <>
                <Separator />
                <div className="space-y-2">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Saúde &amp; Alergias
                  </span>
                  {pet.hasFoodAllergy && (
                    <div className="flex items-start gap-2">
                      <Badge variant="destructive" className="text-[10px] shrink-0 mt-0.5">
                        Alergia alimentar
                      </Badge>
                      {pet.foodAllergyDetails && (
                        <span className="text-xs text-muted-foreground">{pet.foodAllergyDetails}</span>
                      )}
                    </div>
                  )}
                  {pet.hasMedicationAllergy && (
                    <div className="flex items-start gap-2">
                      <Badge variant="destructive" className="text-[10px] shrink-0 mt-0.5">
                        Alergia a medicamentos
                      </Badge>
                      {pet.medicationAllergyDetails && (
                        <span className="text-xs text-muted-foreground">{pet.medicationAllergyDetails}</span>
                      )}
                    </div>
                  )}
                  {pet.hasChronicCondition && (
                    <div className="flex items-start gap-2">
                      <Badge variant="outline" className="text-[10px] shrink-0 mt-0.5 border-amber-500 text-amber-700">
                        Condição crônica
                      </Badge>
                      {pet.chronicConditionDetails && (
                        <span className="text-xs text-muted-foreground">{pet.chronicConditionDetails}</span>
                      )}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Gatilhos de medo */}
            {activeFearTriggers.length > 0 && (
              <>
                <Separator />
                <div className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="h-3 w-3 text-amber-500" />
                    Gatilhos de medo
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {activeFearTriggers.map((trigger, i) => (
                      <Badge key={i} variant="outline" className="text-[10px] border-amber-400 bg-amber-500/10 text-amber-700">
                        {trigger}
                      </Badge>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Empty state */}
            {!hasQuickAccessContent && (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <UserRound className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">Nenhum dado de contato ou restrição cadastrado.</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Column 3 — Comportamento */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              Comportamento
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasBehaviorData ? (
              <div className="space-y-3">
                {pet.energyLevel && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Energia</span>
                    <LevelBar value={pet.energyLevel} levels={["very_low", "low", "moderate", "high", "hyperactive"]} />
                  </div>
                )}
                {pet.dogSociability && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Sociabilidade (cães)</span>
                    <LevelBar value={pet.dogSociability} levels={["antisocial", "reactive", "selective", "social"]} />
                  </div>
                )}
                {pet.humanSociability && (
                  <div className="space-y-1">
                    <span className="text-xs text-muted-foreground">Sociabilidade (humanos)</span>
                    <LevelBar value={pet.humanSociability} levels={["reactive", "fearful", "cautious", "friendly"]} />
                  </div>
                )}
                {pet.playStyle && (
                  <>
                    <Separator />
                    <div className="flex justify-between items-center">
                      <span className="text-xs text-muted-foreground">Estilo de brincadeira</span>
                      <span className="text-xs text-foreground font-medium">{label(pet.playStyle)}</span>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <Zap className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">Perfil comportamental ainda não preenchido.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Full-width observations */}
      {pet.notes && (
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <ClipboardList className="h-4 w-4 text-amber-600" />
              Observações
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
              {pet.notes}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
