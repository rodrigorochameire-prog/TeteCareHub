"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
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

// Info row with hover effect
function InfoRow({ label: rowLabel, value }: { label: string; value: string | null }) {
  return (
    <div className="flex justify-between items-center py-2 px-2 -mx-2 rounded-md transition-colors duration-200 hover:bg-muted/50">
      <span className="text-muted-foreground text-sm">{rowLabel}</span>
      {value ? (
        <span className="text-sm text-foreground font-medium">{value}</span>
      ) : (
        <span className="text-sm text-muted-foreground italic">Não informado</span>
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
      {/* Informações Básicas */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Dog className="h-4 w-4 text-muted-foreground" />
            Informações Básicas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col divide-y divide-border">
            <InfoRow label="Espécie" value={label(pet.species)} />
            <InfoRow label="Raça" value={pet.breed || null} />
            <InfoRow label="Sexo" value={label(pet.sex)} />
            <InfoRow label="Nascimento" value={birthDisplay} />
            <InfoRow label="Peso" value={weightStr} />
            <InfoRow label="Porte" value={label(pet.size)} />
            <InfoRow label="Pelagem" value={label(pet.coatType)} />
          </div>
          {pet.notes && (
            <div className="mt-4 bg-muted/50 rounded-lg p-3">
              <p className="text-xs text-muted-foreground mb-1.5">Observações</p>
              <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                {pet.notes}
              </p>
            </div>
          )}
          {role === "admin" && (
            <div className="mt-3 pt-3 border-t">
              <Button variant="ghost" size="sm" className="gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200">
                <Pencil className="h-3 w-3" />
                Editar informações
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Perfil Comportamental - only show if there is data */}
      {(hasBehaviorData || hasAnyFearTriggers) && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-4 w-4 text-muted-foreground" />
              Perfil Comportamental
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
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
                    <span className="text-sm text-muted-foreground">Estilo de brincadeira</span>
                    <span className="text-sm text-foreground font-medium">{label(pet.playStyle)}</span>
                  </div>
                </>
              )}
              {hasAnyFearTriggers && (
                <>
                  <Separator />
                  <div>
                    <p className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3 text-amber-500" />
                      Gatilhos de medo
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {fearList.filter((t) => t.trim() !== "").map((trigger, i) => (
                        <Badge key={i} variant="destructive">
                          {trigger}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tutores */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4 text-muted-foreground" />
            Tutores
          </CardTitle>
        </CardHeader>
        <CardContent>
          {pet.tutors.length > 0 ? (
            <div className="space-y-3">
              {pet.tutors.map((tutor) => (
                <div
                  key={tutor.id}
                  className="p-3 rounded-lg border bg-muted/50 transition-all duration-200 hover:bg-muted/80"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm text-foreground">
                        {tutor.name}
                      </span>
                      {tutor.isPrimary && (
                        <Badge variant="secondary" className="text-[10px]">
                          Principal
                        </Badge>
                      )}
                    </div>
                    {tutor.phone && (
                      <a
                        href={`https://wa.me/55${tutor.phone.replace(/\D/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="h-7 w-7 inline-flex items-center justify-center rounded-md bg-emerald-600/10 text-emerald-600 hover:bg-emerald-600/20 transition-colors duration-200"
                      >
                        <MessageCircle className="h-3.5 w-3.5" />
                      </a>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <a
                      href={`mailto:${tutor.email}`}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1.5"
                    >
                      <Mail className="h-3 w-3" />
                      {tutor.email}
                    </a>
                    {tutor.phone && (
                      <a
                        href={`tel:+55${tutor.phone.replace(/\D/g, "")}`}
                        className="text-xs text-muted-foreground hover:text-foreground transition-colors duration-200 flex items-center gap-1.5"
                      >
                        <Phone className="h-3 w-3" />
                        {formatPhone(tutor.phone)}
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Users className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-sm font-medium text-muted-foreground">Nenhum tutor associado</p>
              <p className="text-xs text-muted-foreground/70 mt-1">Associe um tutor para contato e acompanhamento.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Saúde */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4 text-muted-foreground" />
            Saúde
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col divide-y divide-border">
            <div className="flex justify-between items-center py-2 px-2 -mx-2 rounded-md transition-colors duration-200 hover:bg-muted/50">
              <span className="text-sm text-muted-foreground">Alergia alimentar</span>
              {pet.hasFoodAllergy ? (
                <Badge variant="destructive" className="gap-1 text-[11px]">
                  <AlertTriangle className="h-3 w-3" />
                  Sim
                </Badge>
              ) : (
                <span className="flex items-center gap-1 text-emerald-600 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Não
                </span>
              )}
            </div>
            {pet.foodAllergyDetails && (
              <p className="text-xs text-muted-foreground py-1.5 pl-3 border-l-2 border-red-500/30">
                {pet.foodAllergyDetails}
              </p>
            )}

            <div className="flex justify-between items-center py-2 px-2 -mx-2 rounded-md transition-colors duration-200 hover:bg-muted/50">
              <span className="text-sm text-muted-foreground">Alergia a medicamentos</span>
              {pet.hasMedicationAllergy ? (
                <Badge variant="destructive" className="gap-1 text-[11px]">
                  <AlertTriangle className="h-3 w-3" />
                  Sim
                </Badge>
              ) : (
                <span className="flex items-center gap-1 text-emerald-600 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Não
                </span>
              )}
            </div>
            {pet.medicationAllergyDetails && (
              <p className="text-xs text-muted-foreground py-1.5 pl-3 border-l-2 border-red-500/30">
                {pet.medicationAllergyDetails}
              </p>
            )}

            <div className="flex justify-between items-center py-2 px-2 -mx-2 rounded-md transition-colors duration-200 hover:bg-muted/50">
              <span className="text-sm text-muted-foreground">Condição crônica</span>
              {pet.hasChronicCondition ? (
                <Badge variant="destructive" className="gap-1 text-[11px]">
                  <AlertTriangle className="h-3 w-3" />
                  Sim
                </Badge>
              ) : (
                <span className="flex items-center gap-1 text-emerald-600 text-xs">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  Não
                </span>
              )}
            </div>
            {pet.chronicConditionDetails && (
              <p className="text-xs text-muted-foreground py-1.5 pl-3 border-l-2 border-red-500/30">
                {pet.chronicConditionDetails}
              </p>
            )}
          </div>

          {(pet.emergencyVetName || pet.emergencyVetPhone) && (
            <div className="mt-4 pt-3 border-t">
              <p className="text-xs text-muted-foreground mb-1.5 flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" /> Veterinário de emergência
              </p>
              {pet.emergencyVetName && (
                <p className="text-sm text-foreground font-medium">{pet.emergencyVetName}</p>
              )}
              {pet.emergencyVetPhone && (
                <a
                  href={`tel:+55${pet.emergencyVetPhone.replace(/\D/g, "")}`}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors duration-200"
                >
                  {formatPhone(pet.emergencyVetPhone)}
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
