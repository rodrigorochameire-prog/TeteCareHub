"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dog,
  Weight,
  Cake,
  Zap,
  Users,
  Heart,
  ShieldAlert,
  Phone,
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
  fearTriggers?: string | null;
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
        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Energia</span>
            <span>{label(pet.energyLevel)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sociabilidade (caes)</span>
            <span>{label(pet.dogSociability)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Sociabilidade (humanos)</span>
            <span>{label(pet.humanSociability)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Estilo de brincadeira</span>
            <span>{label(pet.playStyle)}</span>
          </div>
          {pet.fearTriggers && (
            <div className="pt-2 border-t">
              <p className="text-muted-foreground text-xs mb-1">Gatilhos de medo</p>
              <p>{pet.fearTriggers}</p>
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
            <div key={tutor.id} className="flex items-center justify-between text-sm">
              <div>
                <p className="font-medium">
                  {tutor.name}
                  {tutor.isPrimary && (
                    <Badge variant="secondary" className="ml-2 text-[10px]">
                      Principal
                    </Badge>
                  )}
                </p>
                <p className="text-muted-foreground text-xs">{tutor.email}</p>
              </div>
              {tutor.phone && (
                <span className="text-muted-foreground flex items-center gap-1 text-xs">
                  <Phone className="h-3 w-3" />
                  {tutor.phone}
                </span>
              )}
            </div>
          ))}
          {pet.tutors.length === 0 && (
            <p className="text-sm text-muted-foreground">Nenhum tutor associado.</p>
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
              <Badge variant="warning">Sim</Badge>
            ) : (
              <span>Nao</span>
            )}
          </div>
          {pet.foodAllergyDetails && (
            <p className="text-xs text-muted-foreground pl-2 border-l-2">
              {pet.foodAllergyDetails}
            </p>
          )}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Alergia a medicamentos</span>
            {pet.hasMedicationAllergy ? (
              <Badge variant="warning">Sim</Badge>
            ) : (
              <span>Nao</span>
            )}
          </div>
          {pet.medicationAllergyDetails && (
            <p className="text-xs text-muted-foreground pl-2 border-l-2">
              {pet.medicationAllergyDetails}
            </p>
          )}
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Condicao cronica</span>
            {pet.hasChronicCondition ? (
              <Badge variant="destructive">Sim</Badge>
            ) : (
              <span>Nao</span>
            )}
          </div>
          {pet.chronicConditionDetails && (
            <p className="text-xs text-muted-foreground pl-2 border-l-2">
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
                <p className="text-muted-foreground">{pet.emergencyVetPhone}</p>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
