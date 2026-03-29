"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dog,
  Weight,
  Cake,
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

function formatWeight(weight: number | null | undefined): string {
  if (!weight) return "Nao informado";
  const kg = weight > 100 ? weight / 1000 : weight;
  return `${kg.toFixed(1)} kg`;
}

function formatBirthDate(birthDate: Date | string | null | undefined): string {
  if (!birthDate) return "Nao informada";
  const date = new Date(birthDate);
  return date.toLocaleDateString("pt-BR");
}

function calculateAge(birthDate: Date | string | null | undefined): string {
  if (!birthDate) return "";
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
  high: "Alto",
  normal: "Normal",
  low: "Baixo",
  excellent: "Excelente",
  good: "Bom",
  moderate: "Moderado",
  poor: "Ruim",
};

function label(value: string | null | undefined): string {
  if (!value) return "Nao informado";
  return LABELS[value] ?? value;
}

// Visual level indicator bar
function LevelBar({ value, levels }: { value: string | null | undefined; levels: string[] }) {
  if (!value) return <span className="text-muted-foreground text-xs">-</span>;
  const idx = levels.indexOf(value);
  const total = levels.length;
  const filled = idx >= 0 ? idx + 1 : 0;
  const colors = ["bg-red-500", "bg-amber-500", "bg-sky-500", "bg-emerald-500"];

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex gap-0.5">
        {levels.map((_, i) => (
          <div
            key={i}
            className={`h-2 w-5 rounded-sm ${
              i < filled
                ? colors[Math.min(Math.floor((filled / total) * (colors.length - 1)), colors.length - 1)] ?? "bg-muted"
                : "bg-muted/40"
            }`}
          />
        ))}
      </div>
      <span className="text-xs font-medium">{label(value)}</span>
    </div>
  );
}

export function PetGeneralTab({ pet, role }: PetGeneralTabProps) {
  const age = calculateAge(pet.birthDate);

  return (
    <div className="grid gap-4 md:grid-cols-2">
      {/* Informacoes Basicas */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Dog className="h-4 w-4" />
            Informacoes Basicas
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Especie</span>
            <span>{label(pet.species)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Raca</span>
            <span>{pet.breed || "SRD"}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sexo</span>
            <span>{label(pet.sex)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground flex items-center gap-1">
              <Cake className="h-3.5 w-3.5" /> Nascimento
            </span>
            <span>
              {formatBirthDate(pet.birthDate)}
              {age && <span className="text-muted-foreground ml-1">({age})</span>}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground flex items-center gap-1">
              <Weight className="h-3.5 w-3.5" /> Peso
            </span>
            <span>{formatWeight(pet.weight)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Porte</span>
            <span>{label(pet.size)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Pelagem</span>
            <span>{label(pet.coatType)}</span>
          </div>
          {pet.notes && (
            <div className="pt-2 border-t">
              <p className="text-muted-foreground text-xs mb-1">Observacoes</p>
              <p>{pet.notes}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Perfil Comportamental */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Perfil Comportamental
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-sm">
          <div className="space-y-1">
            <span className="text-muted-foreground text-xs">Energia</span>
            <LevelBar value={pet.energyLevel} levels={["low", "normal", "high"]} />
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground text-xs">Sociabilidade (caes)</span>
            <LevelBar value={pet.dogSociability} levels={["poor", "moderate", "good", "excellent"]} />
          </div>
          <div className="space-y-1">
            <span className="text-muted-foreground text-xs">Sociabilidade (humanos)</span>
            <LevelBar value={pet.humanSociability} levels={["poor", "moderate", "good", "excellent"]} />
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estilo de brincadeira</span>
            <span>{label(pet.playStyle)}</span>
          </div>
          {pet.fearTriggers && (
            <div className="pt-2 border-t">
              <p className="text-muted-foreground text-xs mb-1.5 flex items-center gap-1">
                <AlertTriangle className="h-3 w-3 text-amber-500" />
                Gatilhos de medo
              </p>
              <div className="flex flex-wrap gap-1">
                {(Array.isArray(pet.fearTriggers) ? pet.fearTriggers : [pet.fearTriggers]).map(
                  (trigger, i) => (
                    <Badge key={i} variant="warning" className="text-[10px]">
                      {trigger}
                    </Badge>
                  )
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tutores */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            Tutores
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {pet.tutors.map((tutor) => (
            <div key={tutor.id} className="p-3 rounded-lg border text-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <p className="font-medium">{tutor.name}</p>
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
                    className="h-7 w-7 inline-flex items-center justify-center rounded-md bg-emerald-600/10 text-emerald-500 hover:bg-emerald-600/20 transition-colors"
                  >
                    <MessageCircle className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
              <div className="flex flex-col gap-1">
                <a
                  href={`mailto:${tutor.email}`}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                >
                  <Mail className="h-3 w-3" />
                  {tutor.email}
                </a>
                {tutor.phone && (
                  <a
                    href={`tel:+55${tutor.phone.replace(/\D/g, "")}`}
                    className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5"
                  >
                    <Phone className="h-3 w-3" />
                    {tutor.phone}
                  </a>
                )}
              </div>
            </div>
          ))}
          {pet.tutors.length === 0 && (
            <div className="text-center py-6">
              <Users className="h-8 w-8 text-muted-foreground/30 mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum tutor associado.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Resumo de Saude */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <Heart className="h-4 w-4" />
            Saude
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Alergia alimentar</span>
            {pet.hasFoodAllergy ? (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Sim
              </Badge>
            ) : (
              <span className="flex items-center gap-1 text-emerald-500 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Nao
              </span>
            )}
          </div>
          {pet.foodAllergyDetails && (
            <p className="text-xs text-muted-foreground pl-2 border-l-2 border-red-500/30">
              {pet.foodAllergyDetails}
            </p>
          )}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Alergia a medicamentos</span>
            {pet.hasMedicationAllergy ? (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Sim
              </Badge>
            ) : (
              <span className="flex items-center gap-1 text-emerald-500 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Nao
              </span>
            )}
          </div>
          {pet.medicationAllergyDetails && (
            <p className="text-xs text-muted-foreground pl-2 border-l-2 border-red-500/30">
              {pet.medicationAllergyDetails}
            </p>
          )}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Condicao cronica</span>
            {pet.hasChronicCondition ? (
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle className="h-3 w-3" />
                Sim
              </Badge>
            ) : (
              <span className="flex items-center gap-1 text-emerald-500 text-xs">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Nao
              </span>
            )}
          </div>
          {pet.chronicConditionDetails && (
            <p className="text-xs text-muted-foreground pl-2 border-l-2 border-red-500/30">
              {pet.chronicConditionDetails}
            </p>
          )}
          {(pet.emergencyVetName || pet.emergencyVetPhone) && (
            <div className="pt-2 border-t">
              <p className="text-muted-foreground text-xs mb-1 flex items-center gap-1">
                <ShieldAlert className="h-3 w-3" /> Veterinario de emergencia
              </p>
              {pet.emergencyVetName && <p>{pet.emergencyVetName}</p>}
              {pet.emergencyVetPhone && (
                <a
                  href={`tel:+55${pet.emergencyVetPhone.replace(/\D/g, "")}`}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {pet.emergencyVetPhone}
                </a>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
