/**
 * Daycare Service - Cérebro Central para Operações de Creche
 * 
 * Este serviço implementa o padrão "Cérebro Central" (Service Pattern) para garantir:
 * 1. Operações atômicas com transações de banco
 * 2. Reação em cadeia (calcular tempo, debitar crédito, registrar transação, verificar alertas)
 * 3. Inteligência preditiva (alertas de crédito baixo, estoque de ração)
 * 4. Consistência de dados entre todas as entidades relacionadas
 */

import { db } from "@/lib/db";
import { 
  pets, 
  calendarEvents, 
  dailyLogs, 
  transactions, 
  notifications, 
  users, 
  petTutors,
  petFeedingLogs,
} from "@/lib/db/schema";
import { eq, and, desc, sql } from "drizzle-orm";
import { FoodService } from "./food.service";

// ==========================================
// TIPOS
// ==========================================

export interface CheckInResult {
  success: boolean;
  pet: {
    id: number;
    name: string;
    credits: number;
    status: string;
  };
  eventId: number;
  message: string;
  alerts: Array<{
    type: string;
    severity: "info" | "warning" | "critical";
    message: string;
  }>;
}

export interface CheckOutResult {
  success: boolean;
  pet: {
    id: number;
    name: string;
    credits: number;
    status: string;
  };
  eventId: number;
  stayDurationMinutes: number;
  creditsDeducted: number;
  creditType: "half_day" | "full_day";
  message: string;
  alerts: Array<{
    type: string;
    severity: "info" | "warning" | "critical";
    message: string;
  }>;
}

export interface CheckInOptions {
  petId: number;
  userId: number;
  skipCreditCheck?: boolean;
  bypassReason?: string;
  notes?: string;
}

export interface CheckOutOptions {
  petId: number;
  userId: number;
  notes?: string;
  forceCreditType?: "half_day" | "full_day"; // Forçar tipo de crédito
}

// ==========================================
// CONSTANTES DE NEGÓCIO
// ==========================================

const HALF_DAY_THRESHOLD_HOURS = 5; // Mais de 5 horas = dia integral
const LOW_CREDITS_THRESHOLD = 3;    // Alertar quando créditos <= 3
const CRITICAL_CREDITS_THRESHOLD = 1; // Alerta crítico quando créditos <= 1

// ==========================================
// SERVIÇO PRINCIPAL
// ==========================================

export const DaycareService = {
  /**
   * Check-in Inteligente
   * 
   * Fluxo:
   * 1. Valida pet e status
   * 2. Verifica créditos (ou bypass)
   * 3. Cria evento de calendário
   * 4. Atualiza status do pet
   * 5. Gera alertas se necessário
   */
  async processCheckIn(options: CheckInOptions): Promise<CheckInResult> {
    const { petId, userId, skipCreditCheck, bypassReason, notes } = options;
    const alerts: CheckInResult["alerts"] = [];

    return await db.transaction(async (tx) => {
      // 1. Buscar pet
      const [pet] = await tx
        .select()
        .from(pets)
        .where(eq(pets.id, petId))
        .limit(1);

      if (!pet) {
        throw new Error("Pet não encontrado");
      }

      if (pet.status === "checked-in") {
        throw new Error("Pet já está na creche");
      }

      // 2. Verificar créditos
      const currentCredits = pet.credits || 0;
      
      if (currentCredits <= 0 && !skipCreditCheck) {
        throw new Error("Pet sem créditos disponíveis");
      }

      // Alertas de créditos
      if (currentCredits <= CRITICAL_CREDITS_THRESHOLD) {
        alerts.push({
          type: "credits",
          severity: "critical",
          message: `Crédito muito baixo! Apenas ${currentCredits} crédito(s) restante(s).`,
        });
      } else if (currentCredits <= LOW_CREDITS_THRESHOLD) {
        alerts.push({
          type: "credits",
          severity: "warning",
          message: `Crédito baixo: ${currentCredits} crédito(s) restante(s).`,
        });
      }

      // Verificar estoque de ração
      if (pet.foodAmount && pet.foodStockGrams) {
        const daysRemaining = pet.foodStockGrams / pet.foodAmount;
        if (daysRemaining <= 3) {
          alerts.push({
            type: "food_stock",
            severity: daysRemaining <= 1 ? "critical" : "warning",
            message: `Estoque de ração baixo! Restam aproximadamente ${Math.floor(daysRemaining)} dia(s).`,
          });
        }
      }

      // 3. Criar evento de calendário
      const eventDescription = bypassReason 
        ? `BYPASS: ${bypassReason}${notes ? `. Obs: ${notes}` : ""}`
        : notes;

      const [event] = await tx
        .insert(calendarEvents)
        .values({
          title: `Check-in: ${pet.name}`,
          eventDate: new Date(),
          eventType: "checkin",
          petId: petId,
          isAllDay: false,
          status: "completed",
          description: eventDescription,
          createdById: userId,
        })
        .returning();

      // 4. Atualizar status do pet (NÃO debita crédito no check-in, só no check-out)
      const [updatedPet] = await tx
        .update(pets)
        .set({
          status: "checked-in",
          updatedAt: new Date(),
        })
        .where(eq(pets.id, petId))
        .returning();

      // 5. Log se houve bypass
      if (bypassReason) {
        await tx.insert(dailyLogs).values({
          petId: petId,
          logDate: new Date(),
          source: "daycare",
          logType: "general",
          notes: `[CHECK-IN COM BYPASS] Motivo: ${bypassReason}${notes ? `. Obs: ${notes}` : ""}`,
          createdById: userId,
        });
      }

      return {
        success: true,
        pet: {
          id: updatedPet.id,
          name: updatedPet.name,
          credits: updatedPet.credits,
          status: updatedPet.status,
        },
        eventId: event.id,
        message: `${pet.name} fez check-in com sucesso!`,
        alerts,
      };
    });
  },

  /**
   * Check-out Inteligente
   * 
   * Fluxo:
   * 1. Buscar pet e evento de check-in
   * 2. Calcular tempo de estadia
   * 3. Determinar tipo de crédito (meio período vs integral)
   * 4. Debitar crédito correto
   * 5. Registrar transação financeira
   * 6. Deduzir porção de ração do estoque
   * 7. Verificar saldo e gerar alertas
   * 8. Atualizar status do pet
   */
  async processCheckOut(options: CheckOutOptions): Promise<CheckOutResult> {
    const { petId, userId, notes, forceCreditType } = options;
    const alerts: CheckOutResult["alerts"] = [];

    return await db.transaction(async (tx) => {
      // 1. Buscar pet
      const [pet] = await tx
        .select()
        .from(pets)
        .where(eq(pets.id, petId))
        .limit(1);

      if (!pet) {
        throw new Error("Pet não encontrado");
      }

      if (pet.status !== "checked-in") {
        throw new Error("Pet não está na creche");
      }

      // 2. Buscar evento de check-in correspondente
      const [lastCheckin] = await tx
        .select()
        .from(calendarEvents)
        .where(
          and(
            eq(calendarEvents.petId, petId),
            eq(calendarEvents.eventType, "checkin"),
            eq(calendarEvents.status, "completed")
          )
        )
        .orderBy(desc(calendarEvents.eventDate))
        .limit(1);

      // 3. Calcular tempo de estadia
      const checkOutTime = new Date();
      let stayDurationMinutes = 0;
      
      if (lastCheckin) {
        const checkinTime = new Date(lastCheckin.eventDate);
        stayDurationMinutes = Math.round(
          (checkOutTime.getTime() - checkinTime.getTime()) / (1000 * 60)
        );
      }

      const stayDurationHours = stayDurationMinutes / 60;

      // 4. Determinar tipo de crédito
      let creditType: "half_day" | "full_day";
      let creditsToDeduct: number;

      if (forceCreditType) {
        creditType = forceCreditType;
        creditsToDeduct = forceCreditType === "full_day" ? 1 : 0.5;
      } else {
        // Regra de negócio: > 5 horas = dia integral
        if (stayDurationHours > HALF_DAY_THRESHOLD_HOURS) {
          creditType = "full_day";
          creditsToDeduct = 1;
        } else {
          creditType = "half_day";
          creditsToDeduct = 0.5;
        }
      }

      // 5. Verificar saldo e debitar
      const currentCredits = pet.credits || 0;
      const newCredits = Math.max(currentCredits - creditsToDeduct, 0);
      
      // Alerta se saldo insuficiente
      if (currentCredits < creditsToDeduct) {
        alerts.push({
          type: "credits",
          severity: "critical",
          message: `Pet fez check-out sem saldo suficiente! Saldo: ${currentCredits}, Necessário: ${creditsToDeduct}`,
        });

        // Notificar admins
        const admins = await tx.select().from(users).where(eq(users.role, "admin"));
        for (const admin of admins) {
          await tx.insert(notifications).values({
            userId: admin.id,
            petId: petId,
            type: "warning",
            title: "Check-out sem saldo",
            message: `O pet ${pet.name} fez check-out com saldo insuficiente (${currentCredits} créditos).`,
            actionUrl: `/admin/pets/${petId}`,
          });
        }
      }

      // 6. Registrar transação financeira
      const durationText = `${Math.floor(stayDurationHours)}h${Math.round(stayDurationMinutes % 60)}min`;
      const creditTypeText = creditType === "full_day" ? "Dia Integral" : "Meio Período";

      await tx.insert(transactions).values({
        petId: petId,
        userId: userId,
        type: "credit_use",
        amount: 0, // Valor monetário é 0 pois usou crédito
        credits: creditsToDeduct * 100, // Armazenamos como centésimos para suportar 0.5
        description: `Check-out: ${durationText} de permanência (${creditTypeText})`,
      });

      // 7. Atualizar créditos do pet
      await tx
        .update(pets)
        .set({
          credits: newCredits,
          status: "active",
          updatedAt: new Date(),
        })
        .where(eq(pets.id, petId));

      // 8. Criar evento de check-out
      const [checkoutEvent] = await tx
        .insert(calendarEvents)
        .values({
          title: `Check-out: ${pet.name}`,
          eventDate: checkOutTime,
          eventType: "checkout",
          petId: petId,
          isAllDay: false,
          status: "completed",
          description: `${creditTypeText} - ${durationText}${notes ? `. ${notes}` : ""}`,
          createdById: userId,
        })
        .returning();

      // 9. Deduzir porção de ração do estoque (se configurado)
      if (pet.foodAmount && pet.foodStockGrams) {
        await FoodService.deductDailyPortion(petId, userId, tx);
      }

      // 10. Alertas de crédito baixo após débito
      if (newCredits <= CRITICAL_CREDITS_THRESHOLD) {
        alerts.push({
          type: "credits",
          severity: "critical",
          message: `Créditos muito baixos após check-out! Restam apenas ${newCredits} crédito(s).`,
        });

        // Notificar tutores
        const tutorRelations = await tx
          .select({ tutorId: petTutors.tutorId })
          .from(petTutors)
          .where(eq(petTutors.petId, petId));

        for (const relation of tutorRelations) {
          await tx.insert(notifications).values({
            userId: relation.tutorId,
            petId: petId,
            type: newCredits === 0 ? "error" : "warning",
            title: newCredits === 0 ? "Créditos esgotados" : "Créditos baixos",
            message: newCredits === 0
              ? `${pet.name} ficou sem créditos. Adquira mais créditos para continuar utilizando a creche.`
              : `${pet.name} tem apenas ${newCredits} crédito(s) restante(s). Considere adquirir mais créditos.`,
            actionUrl: "/tutor/credits",
          });
        }
      } else if (newCredits <= LOW_CREDITS_THRESHOLD) {
        alerts.push({
          type: "credits",
          severity: "warning",
          message: `Créditos baixos após check-out: ${newCredits} crédito(s) restante(s).`,
        });
      }

      return {
        success: true,
        pet: {
          id: pet.id,
          name: pet.name,
          credits: newCredits,
          status: "active",
        },
        eventId: checkoutEvent.id,
        stayDurationMinutes,
        creditsDeducted: creditsToDeduct,
        creditType,
        message: `${pet.name} fez check-out com sucesso! (${creditTypeText})`,
        alerts,
      };
    });
  },

  /**
   * Valida se um pet pode fazer check-in
   * Retorna lista de alertas e bloqueios
   */
  async validateCheckIn(petId: number): Promise<{
    canCheckIn: boolean;
    alerts: Array<{
      type: string;
      severity: "info" | "warning" | "critical";
      message: string;
      blocking: boolean;
    }>;
  }> {
    const [pet] = await db
      .select()
      .from(pets)
      .where(eq(pets.id, petId))
      .limit(1);

    if (!pet) {
      return {
        canCheckIn: false,
        alerts: [{ type: "error", severity: "critical", message: "Pet não encontrado", blocking: true }],
      };
    }

    const alerts: Array<{ type: string; severity: "info" | "warning" | "critical"; message: string; blocking: boolean }> = [];

    // Verificar status
    if (pet.status === "checked-in") {
      alerts.push({
        type: "status",
        severity: "critical",
        message: "Pet já está na creche",
        blocking: true,
      });
    }

    // Verificar créditos
    const credits = pet.credits || 0;
    if (credits <= 0) {
      alerts.push({
        type: "credits",
        severity: "critical",
        message: "Sem créditos disponíveis",
        blocking: true,
      });
    } else if (credits <= CRITICAL_CREDITS_THRESHOLD) {
      alerts.push({
        type: "credits",
        severity: "warning",
        message: `Crédito muito baixo: ${credits}`,
        blocking: false,
      });
    } else if (credits <= LOW_CREDITS_THRESHOLD) {
      alerts.push({
        type: "credits",
        severity: "info",
        message: `Poucos créditos: ${credits}`,
        blocking: false,
      });
    }

    // Verificar estoque de ração
    if (pet.foodAmount && pet.foodStockGrams) {
      const daysRemaining = pet.foodStockGrams / pet.foodAmount;
      if (daysRemaining <= 0) {
        alerts.push({
          type: "food_stock",
          severity: "critical",
          message: "Sem estoque de ração",
          blocking: false, // Não bloqueia, mas alerta
        });
      } else if (daysRemaining <= 3) {
        alerts.push({
          type: "food_stock",
          severity: "warning",
          message: `Estoque de ração baixo: ~${Math.floor(daysRemaining)} dia(s)`,
          blocking: false,
        });
      }
    }

    // TODO: Adicionar verificação de vacinas vencidas
    // TODO: Adicionar verificação de preventivos vencidos
    // TODO: Adicionar verificação de incompatibilidade com outros pets na creche

    const hasBlockingAlert = alerts.some(a => a.blocking);

    return {
      canCheckIn: !hasBlockingAlert,
      alerts,
    };
  },

  /**
   * Calcula estatísticas de um pet na creche
   */
  async getPetStats(petId: number): Promise<{
    totalVisits: number;
    totalCreditsUsed: number;
    averageStayMinutes: number;
    lastVisit: Date | null;
    currentStatus: string;
  }> {
    const [pet] = await db
      .select()
      .from(pets)
      .where(eq(pets.id, petId))
      .limit(1);

    if (!pet) {
      throw new Error("Pet não encontrado");
    }

    // Buscar eventos de check-in
    const checkins = await db
      .select()
      .from(calendarEvents)
      .where(
        and(
          eq(calendarEvents.petId, petId),
          eq(calendarEvents.eventType, "checkin"),
          eq(calendarEvents.status, "completed")
        )
      )
      .orderBy(desc(calendarEvents.eventDate));

    // Buscar transações de uso de crédito
    const creditUsage = await db
      .select()
      .from(transactions)
      .where(
        and(
          eq(transactions.petId, petId),
          eq(transactions.type, "credit_use")
        )
      );

    const totalCreditsUsed = creditUsage.reduce((sum, t) => sum + ((t.credits || 0) / 100), 0);

    return {
      totalVisits: checkins.length,
      totalCreditsUsed,
      averageStayMinutes: 0, // TODO: Calcular média real
      lastVisit: checkins.length > 0 ? new Date(checkins[0].eventDate) : null,
      currentStatus: pet.status,
    };
  },
};
