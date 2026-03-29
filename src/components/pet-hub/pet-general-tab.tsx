"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Zap,
  Phone,
  Mail,
  MessageCircle,
  AlertTriangle,
  Stethoscope,
  ClipboardList,
  UserCircle,
  HeartPulse,
  Wallet,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  CreditCard,
  CalendarX,
  PlusCircle,
} from "lucide-react";
import { trpc } from "@/lib/trpc/client";
import { InlineEdit } from "./inline-edit";
import { AssignPlanDialog } from "./dialogs/assign-plan-dialog";
import { RegisterPaymentDialog } from "./dialogs/register-payment-dialog";
import { RequestCreditsDialog } from "./dialogs/request-credits-dialog";
import { MarkAbsenceDialog } from "./dialogs/mark-absence-dialog";

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
  credits: number;
  tutors: Tutor[];
}

interface PetGeneralTabProps {
  pet: Pet;
  role: "admin" | "tutor";
  isEditMode?: boolean;
}

const PLAN_TYPE_LABELS: Record<string, string> = {
  mensalista: "Mensalista",
  avulso: "Avulso",
  diaria: "Diária",
};

function formatPrice(cents: number): string {
  return `R$ ${(cents / 100).toFixed(2).replace(".", ",")}`;
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
  very_low: "Muito Baixo",
  low: "Baixo",
  moderate: "Moderado",
  high: "Alto",
  hyperactive: "Hiperativo",
  social: "Sociável",
  selective: "Seletivo",
  reactive: "Reativo",
  antisocial: "Antissocial",
  friendly: "Amigável",
  cautious: "Cauteloso",
  fearful: "Medroso",
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

// Info row with hover
function InfoRow({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-2 rounded-md px-2 py-2 transition-colors hover:bg-muted/50">
      {children}
    </div>
  );
}

// Tutor contact card
function TutorContactCard({ tutor }: { tutor: Tutor }) {
  const phoneDigits = tutor.phone?.replace(/\D/g, "") ?? "";
  const whatsappUrl = phoneDigits
    ? `https://wa.me/55${phoneDigits}?text=${encodeURIComponent(`Olá ${tutor.name}...`)}`
    : null;

  return (
    <div className="space-y-2">
      {/* Name + badge */}
      <div className="flex items-center gap-2">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
          <UserCircle className="h-5 w-5 text-muted-foreground" />
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-sm text-foreground truncate">{tutor.name}</span>
            {tutor.isPrimary && (
              <Badge variant="secondary" className="text-[10px] shrink-0">
                Principal
              </Badge>
            )}
          </div>
        </div>
      </div>

      {/* Contact actions */}
      <div className="ml-11 space-y-1">
        {tutor.phone && (
          <a
            href={`tel:+55${phoneDigits}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Phone className="h-3.5 w-3.5" />
            {formatPhone(tutor.phone)}
          </a>
        )}
        {whatsappUrl && (
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-md bg-emerald-600/10 px-2.5 py-1 text-xs font-medium text-emerald-700 hover:bg-emerald-600/20 transition-colors"
          >
            <MessageCircle className="h-3.5 w-3.5" />
            WhatsApp
          </a>
        )}
        {tutor.email && (
          <a
            href={`mailto:${tutor.email}`}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Mail className="h-3.5 w-3.5" />
            {tutor.email}
          </a>
        )}
      </div>
    </div>
  );
}

export function PetGeneralTab({ pet, role, isEditMode = false }: PetGeneralTabProps) {
  // Fetch real plan data
  const { data: petPlanData } = trpc.plansManagement.getPetPlan.useQuery(
    { petId: pet.id },
  );

  // Fear triggers
  const fearList = pet.fearTriggers
    ? Array.isArray(pet.fearTriggers)
      ? pet.fearTriggers
      : [pet.fearTriggers]
    : [];
  const activeFearTriggers = fearList.filter((t) => t.trim() !== "");

  // Check if behavior section has any data
  const hasBehaviorData =
    pet.energyLevel || pet.dogSociability || pet.humanSociability || pet.playStyle;

  // Sort tutors: primary first
  const sortedTutors = [...pet.tutors].sort((a, b) => (b.isPrimary ? 1 : 0) - (a.isPrimary ? 1 : 0));

  // Has any health/restriction data
  const hasHealthData =
    pet.hasFoodAllergy ||
    pet.hasMedicationAllergy ||
    pet.hasChronicCondition ||
    pet.emergencyVetName ||
    pet.emergencyVetPhone ||
    activeFearTriggers.length > 0;

  // Credit status helpers
  const credits = pet.credits;
  const creditStatus =
    credits <= 0 ? "empty" : credits <= 3 ? "low" : "ok";
  const creditStatusColor = {
    empty: "text-red-600",
    low: "text-amber-600",
    ok: "text-emerald-600",
  }[creditStatus];
  const creditBgColor = {
    empty: "bg-red-500/10",
    low: "bg-amber-500/10",
    ok: "bg-emerald-500/10",
  }[creditStatus];
  const creditBorderColor = {
    empty: "border-red-500/30",
    low: "border-amber-500/30",
    ok: "border-emerald-500/30",
  }[creditStatus];
  const creditLabel = {
    empty: "Sem créditos",
    low: "Créditos baixos",
    ok: "Créditos disponíveis",
  }[creditStatus];
  const CreditIcon = creditStatus === "ok" ? TrendingUp : TrendingDown;

  return (
    <div className="space-y-5">
      {/* ── Linha 1: Tutor + Saúde e Restrições ── */}
      <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
        {/* Tutor (primeiro — acesso rápido) */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <UserCircle className="h-4 w-4 text-muted-foreground" />
              Tutor
            </CardTitle>
          </CardHeader>
          <CardContent>
            {sortedTutors.length > 0 ? (
              <div className="space-y-4">
                {sortedTutors.map((tutor, i) => (
                  <div key={tutor.id}>
                    {i > 0 && <Separator className="mb-4" />}
                    <TutorContactCard tutor={tutor} />
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <UserCircle className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">Nenhum tutor associado</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Saúde e Restrições */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-base flex items-center gap-2">
              <HeartPulse className="h-4 w-4 text-muted-foreground" />
              Saúde e Restrições
            </CardTitle>
          </CardHeader>
          <CardContent>
            {hasHealthData ? (
              <div className="space-y-1">
                <InfoRow>
                  <span className="text-xs text-muted-foreground">Alergias alimentares</span>
                  {pet.hasFoodAllergy ? (
                    <div className="flex items-center gap-2 text-right">
                      <Badge variant="destructive" className="text-[10px]">Sim</Badge>
                      {pet.foodAllergyDetails && (
                        <span className="text-xs text-muted-foreground max-w-[180px] truncate">
                          {pet.foodAllergyDetails}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-foreground">Não</span>
                  )}
                </InfoRow>

                <InfoRow>
                  <span className="text-xs text-muted-foreground">Alergias a medicamentos</span>
                  {pet.hasMedicationAllergy ? (
                    <div className="flex items-center gap-2 text-right">
                      <Badge variant="destructive" className="text-[10px]">Sim</Badge>
                      {pet.medicationAllergyDetails && (
                        <span className="text-xs text-muted-foreground max-w-[180px] truncate">
                          {pet.medicationAllergyDetails}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-foreground">Não</span>
                  )}
                </InfoRow>

                <InfoRow>
                  <span className="text-xs text-muted-foreground">Condição crônica</span>
                  {pet.hasChronicCondition ? (
                    <div className="flex items-center gap-2 text-right">
                      <Badge variant="outline" className="text-[10px] border-amber-500 text-amber-700">Sim</Badge>
                      {pet.chronicConditionDetails && (
                        <span className="text-xs text-muted-foreground max-w-[180px] truncate">
                          {pet.chronicConditionDetails}
                        </span>
                      )}
                    </div>
                  ) : (
                    <span className="text-xs text-foreground">Não</span>
                  )}
                </InfoRow>

                {(pet.emergencyVetName || pet.emergencyVetPhone) && (
                  <>
                    <Separator className="my-2" />
                    <InfoRow>
                      <div className="flex items-center gap-1.5">
                        <Stethoscope className="h-3.5 w-3.5 text-red-500" />
                        <span className="text-xs text-muted-foreground">Vet. emergência</span>
                      </div>
                      <div className="text-right space-y-0.5">
                        {pet.emergencyVetName && (
                          <p className="text-xs font-medium text-foreground">{pet.emergencyVetName}</p>
                        )}
                        {pet.emergencyVetPhone && (
                          <a
                            href={`tel:+55${pet.emergencyVetPhone.replace(/\D/g, "")}`}
                            className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1 justify-end"
                          >
                            <Phone className="h-3 w-3" />
                            {formatPhone(pet.emergencyVetPhone)}
                          </a>
                        )}
                      </div>
                    </InfoRow>
                  </>
                )}

                {activeFearTriggers.length > 0 && (
                  <>
                    <Separator className="my-2" />
                    <div className="px-2 py-2 space-y-1.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1.5">
                        <AlertTriangle className="h-3.5 w-3.5 text-amber-500" />
                        Gatilhos de medo
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {activeFearTriggers.map((trigger, i) => (
                          <Badge
                            key={i}
                            variant="outline"
                            className="text-[10px] border-amber-400 bg-amber-500/10 text-amber-700"
                          >
                            {trigger}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <HeartPulse className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">Nenhum dado de saúde cadastrado.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Linha 2: Plano e Créditos (largura total) ── */}
      <Card className={`border ${creditBorderColor}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            {/* Left: icon + plan info */}
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${creditBgColor}`}>
                <Wallet className={`h-5 w-5 ${creditStatusColor}`} />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Plano e Créditos</h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <CreditIcon className={`h-3.5 w-3.5 ${creditStatusColor}`} />
                  <span className={`text-xs font-medium ${creditStatusColor}`}>
                    {creditLabel}
                  </span>
                </div>
              </div>
            </div>

            {/* Center: credits count */}
            <div className="flex items-baseline gap-1.5">
              {isEditMode && role === "admin" ? (
                <InlineEdit
                  petId={pet.id}
                  field="credits"
                  value={credits}
                  editable
                  type="number"
                  className={`text-3xl font-bold tabular-nums ${creditStatusColor}`}
                />
              ) : (
                <span className={`text-3xl font-bold tabular-nums ${creditStatusColor}`}>
                  {credits}
                </span>
              )}
              <span className="text-sm text-muted-foreground">
                {credits === 1 ? "diária" : "diárias"}
              </span>
            </div>

            {/* Right: plan badge + details */}
            <div className="text-right">
              {petPlanData ? (
                <>
                  <Badge
                    variant="outline"
                    className={`text-xs ${creditBorderColor} ${creditStatusColor}`}
                  >
                    {PLAN_TYPE_LABELS[petPlanData.plan.type] ?? petPlanData.plan.type}
                  </Badge>
                  <p className="text-xs font-medium text-foreground mt-1">
                    {petPlanData.petPlan.customName || petPlanData.plan.name}
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {formatPrice(petPlanData.petPlan.customPrice ?? petPlanData.plan.price)}
                    {" · "}
                    {petPlanData.petPlan.customDays ?? petPlanData.plan.includedDays} diárias incluídas
                  </p>
                  {petPlanData.plan.type === "mensalista" && (
                    <p className="text-[10px] text-muted-foreground mt-0.5">
                      {credits}/{petPlanData.petPlan.customDays ?? petPlanData.plan.includedDays} diárias usadas
                    </p>
                  )}
                </>
              ) : (
                <>
                  <Badge
                    variant="outline"
                    className={`text-xs ${creditBorderColor} ${creditStatusColor}`}
                  >
                    Sem plano
                  </Badge>
                  <p className="text-[10px] text-muted-foreground mt-1">
                    Sem plano atribuído
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Action buttons */}
          <Separator className="my-3" />
          <div className="flex flex-wrap gap-2">
            {role === "admin" ? (
              <>
                <AssignPlanDialog petId={pet.id}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    Alterar plano
                  </Button>
                </AssignPlanDialog>
                <RegisterPaymentDialog petId={pet.id}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                  >
                    <CreditCard className="h-3.5 w-3.5" />
                    Registrar pagamento
                  </Button>
                </RegisterPaymentDialog>
                <MarkAbsenceDialog petId={pet.id}>
                  <Button
                    variant="outline"
                    size="sm"
                    className="gap-1.5 text-xs"
                  >
                    <CalendarX className="h-3.5 w-3.5" />
                    Marcar falta
                  </Button>
                </MarkAbsenceDialog>
              </>
            ) : (
              <RequestCreditsDialog petId={pet.id}>
                <Button
                  variant="outline"
                  size="sm"
                  className="gap-1.5 text-xs"
                >
                  <PlusCircle className="h-3.5 w-3.5" />
                  Adicionar créditos
                </Button>
              </RequestCreditsDialog>
            )}
          </div>
        </CardContent>
      </Card>

      {/* ── Linha 3: Comportamento + Observações ── */}
      <div className="grid gap-5 grid-cols-1 md:grid-cols-2">
        {/* Comportamento */}
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

        {/* Observações */}
        {pet.notes ? (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                Observações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-md bg-muted/30 p-3">
                <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
                  {pet.notes}
                </p>
              </div>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-base flex items-center gap-2">
                <ClipboardList className="h-4 w-4 text-muted-foreground" />
                Observações
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col items-center justify-center py-6 text-center">
                <ClipboardList className="h-8 w-8 text-muted-foreground/30 mb-2" />
                <p className="text-xs text-muted-foreground">Nenhuma observação cadastrada.</p>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
