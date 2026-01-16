/**
 * Food Service - Smart Stock (Gestão Inteligente de Ração)
 * 
 * Este serviço implementa:
 * 1. Dedução automática de ração do estoque
 * 2. Alertas proativos de estoque baixo
 * 3. Notificações para tutores via sistema (e futuramente WhatsApp)
 * 4. Previsão de quando o estoque vai acabar
 */

import { db } from "@/lib/db";
import { 
  pets, 
  petFeedingLogs,
  notifications,
  petTutors,
  users,
} from "@/lib/db/schema";
import { eq, and, desc, sql, gte } from "drizzle-orm";
import type { PgTransaction } from "drizzle-orm/pg-core";

// ==========================================
// TIPOS
// ==========================================

export interface FeedingResult {
  success: boolean;
  petId: number;
  amountDeducted: number;
  remainingStock: number;
  daysRemaining: number;
  alertLevel: "ok" | "warning" | "critical" | "empty";
  message: string;
}

export interface StockForecast {
  currentStock: number;
  dailyConsumption: number;
  daysRemaining: number;
  alertLevel: "ok" | "warning" | "critical" | "empty";
  estimatedEmptyDate: Date | null;
  lastUpdate: Date | null;
}

export interface FeedingLogOptions {
  petId: number;
  userId: number;
  mealType: "breakfast" | "lunch" | "dinner" | "snack";
  amountGrams: number;
  consumption: "all" | "most" | "half" | "little" | "none";
  notes?: string;
}

// ==========================================
// CONSTANTES DE NEGÓCIO
// ==========================================

const LOW_STOCK_DAYS = 5;      // Alerta quando restam <= 5 dias
const CRITICAL_STOCK_DAYS = 3; // Alerta crítico quando restam <= 3 dias
const NOTIFY_TUTOR_DAYS = 3;   // Notificar tutor quando restam <= 3 dias

// ==========================================
// SERVIÇO PRINCIPAL
// ==========================================

export const FoodService = {
  /**
   * Registra uma alimentação e deduz do estoque
   */
  async registerMeal(options: FeedingLogOptions): Promise<FeedingResult> {
    const { petId, userId, mealType, amountGrams, consumption, notes } = options;

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

      // 2. Calcular quantidade consumida baseada no nível de consumo
      const consumptionRates: Record<typeof consumption, number> = {
        all: 1,
        most: 0.8,
        half: 0.5,
        little: 0.2,
        none: 0,
      };
      
      const actualConsumption = Math.round(amountGrams * consumptionRates[consumption]);

      // 3. Registrar log de alimentação
      await tx.insert(petFeedingLogs).values({
        petId,
        feedingDate: new Date(),
        mealType,
        amountGrams,
        consumption,
        notes,
        createdById: userId,
      });

      // 4. Deduzir do estoque (se tiver estoque configurado)
      let remainingStock = pet.foodStockGrams || 0;
      
      if (remainingStock > 0) {
        remainingStock = Math.max(0, remainingStock - actualConsumption);
        
        await tx
          .update(pets)
          .set({
            foodStockGrams: remainingStock,
            foodStockLastUpdate: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(pets.id, petId));
      }

      // 5. Calcular dias restantes e alertas
      const dailyConsumption = pet.foodAmount || 0;
      const daysRemaining = dailyConsumption > 0 
        ? Math.floor(remainingStock / dailyConsumption) 
        : 0;

      let alertLevel: FeedingResult["alertLevel"];
      if (remainingStock === 0) {
        alertLevel = "empty";
      } else if (daysRemaining <= CRITICAL_STOCK_DAYS) {
        alertLevel = "critical";
      } else if (daysRemaining <= LOW_STOCK_DAYS) {
        alertLevel = "warning";
      } else {
        alertLevel = "ok";
      }

      // 6. Enviar alertas se necessário
      if (daysRemaining <= NOTIFY_TUTOR_DAYS && dailyConsumption > 0) {
        await this.notifyLowStock(petId, pet.name, daysRemaining, tx);
      }

      return {
        success: true,
        petId,
        amountDeducted: actualConsumption,
        remainingStock,
        daysRemaining,
        alertLevel,
        message: alertLevel === "empty"
          ? "Estoque de ração esgotado!"
          : alertLevel === "critical"
            ? `Estoque crítico! Restam apenas ${daysRemaining} dia(s).`
            : `Alimentação registrada. Estoque: ${daysRemaining} dia(s).`,
      };
    });
  },

  /**
   * Deduz a porção diária do estoque (chamado automaticamente no check-out)
   */
  async deductDailyPortion(
    petId: number, 
    userId: number, 
    tx?: PgTransaction<any, any, any>
  ): Promise<void> {
    const execTx = tx || db;

    // @ts-ignore - tx pode ter select
    const [pet] = await execTx
      .select()
      .from(pets)
      .where(eq(pets.id, petId))
      .limit(1);

    if (!pet || !pet.foodAmount || !pet.foodStockGrams) {
      return; // Sem configuração de ração, não faz nada
    }

    const newStock = Math.max(0, pet.foodStockGrams - pet.foodAmount);

    // @ts-ignore - tx pode ter update
    await execTx
      .update(pets)
      .set({
        foodStockGrams: newStock,
        foodStockLastUpdate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(pets.id, petId));

    // Verificar se precisa notificar
    const daysRemaining = newStock / pet.foodAmount;
    
    if (daysRemaining <= NOTIFY_TUTOR_DAYS) {
      // @ts-ignore
      await this.notifyLowStock(petId, pet.name, Math.floor(daysRemaining), execTx);
    }
  },

  /**
   * Atualiza o estoque de ração (quando tutor traz novo saco)
   */
  async updateStock(
    petId: number, 
    stockGrams: number, 
    userId: number
  ): Promise<{ success: boolean; newStock: number; daysRemaining: number }> {
    const [pet] = await db
      .select()
      .from(pets)
      .where(eq(pets.id, petId))
      .limit(1);

    if (!pet) {
      throw new Error("Pet não encontrado");
    }

    await db
      .update(pets)
      .set({
        foodStockGrams: stockGrams,
        foodStockLastUpdate: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(pets.id, petId));

    const dailyConsumption = pet.foodAmount || 0;
    const daysRemaining = dailyConsumption > 0 
      ? Math.floor(stockGrams / dailyConsumption) 
      : 0;

    return {
      success: true,
      newStock: stockGrams,
      daysRemaining,
    };
  },

  /**
   * Calcula previsão de estoque
   */
  async getStockForecast(petId: number): Promise<StockForecast> {
    const [pet] = await db
      .select()
      .from(pets)
      .where(eq(pets.id, petId))
      .limit(1);

    if (!pet) {
      throw new Error("Pet não encontrado");
    }

    const currentStock = pet.foodStockGrams || 0;
    const dailyConsumption = pet.foodAmount || 0;
    
    let daysRemaining = 0;
    let estimatedEmptyDate: Date | null = null;
    
    if (dailyConsumption > 0) {
      daysRemaining = Math.floor(currentStock / dailyConsumption);
      if (currentStock > 0) {
        estimatedEmptyDate = new Date();
        estimatedEmptyDate.setDate(estimatedEmptyDate.getDate() + daysRemaining);
      }
    }

    let alertLevel: StockForecast["alertLevel"];
    if (currentStock === 0) {
      alertLevel = "empty";
    } else if (daysRemaining <= CRITICAL_STOCK_DAYS) {
      alertLevel = "critical";
    } else if (daysRemaining <= LOW_STOCK_DAYS) {
      alertLevel = "warning";
    } else {
      alertLevel = "ok";
    }

    return {
      currentStock,
      dailyConsumption,
      daysRemaining,
      alertLevel,
      estimatedEmptyDate,
      lastUpdate: pet.foodStockLastUpdate,
    };
  },

  /**
   * Notifica tutores sobre estoque baixo
   */
  async notifyLowStock(
    petId: number, 
    petName: string, 
    daysRemaining: number,
    tx?: PgTransaction<any, any, any>
  ): Promise<void> {
    const execTx = tx || db;

    // Buscar tutores do pet
    // @ts-ignore
    const tutorRelations = await execTx
      .select({ tutorId: petTutors.tutorId })
      .from(petTutors)
      .where(eq(petTutors.petId, petId));

    const message = daysRemaining <= 0
      ? `A ração de ${petName} acabou! Por favor, traga mais na próxima visita. 🦴`
      : `A ração de ${petName} está acabando! Restam aproximadamente ${daysRemaining} dia(s). Pode trazer mais na próxima visita? 🦴`;

    for (const relation of tutorRelations) {
      // Verificar se já existe notificação recente (evitar spam)
      // @ts-ignore
      const recentNotifications = await execTx
        .select()
        .from(notifications)
        .where(
          and(
            eq(notifications.userId, relation.tutorId),
            eq(notifications.petId, petId),
            eq(notifications.type, "warning"),
            gte(notifications.createdAt, new Date(Date.now() - 24 * 60 * 60 * 1000)) // Últimas 24h
          )
        )
        .limit(1);

      if (recentNotifications.length === 0) {
        // @ts-ignore
        await execTx.insert(notifications).values({
          userId: relation.tutorId,
          petId: petId,
          type: daysRemaining <= 0 ? "error" : "warning",
          title: "Estoque de Ração",
          message,
          actionUrl: `/tutor/pets/${petId}`,
        });
      }
    }

    // Notificar admins também se crítico
    if (daysRemaining <= CRITICAL_STOCK_DAYS) {
      // @ts-ignore
      const admins = await execTx.select().from(users).where(eq(users.role, "admin"));
      
      for (const admin of admins) {
        // @ts-ignore
        await execTx.insert(notifications).values({
          userId: admin.id,
          petId: petId,
          type: "warning",
          title: "Estoque de Ração Baixo",
          message: `O pet ${petName} está com estoque de ração baixo (${daysRemaining} dias restantes).`,
          actionUrl: `/admin/pets/${petId}`,
        });
      }
    }
  },

  /**
   * Busca histórico de alimentação do pet
   */
  async getFeedingHistory(petId: number, limit: number = 30) {
    return db.query.petFeedingLogs.findMany({
      where: eq(petFeedingLogs.petId, petId),
      orderBy: [desc(petFeedingLogs.feedingDate)],
      limit,
    });
  },

  /**
   * Calcula estatísticas de alimentação
   */
  async getFeedingStats(petId: number, days: number = 7) {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const logs = await db
      .select()
      .from(petFeedingLogs)
      .where(
        and(
          eq(petFeedingLogs.petId, petId),
          gte(petFeedingLogs.feedingDate, startDate)
        )
      );

    const consumptionCounts = {
      all: 0,
      most: 0,
      half: 0,
      little: 0,
      none: 0,
    };

    logs.forEach(log => {
      if (log.consumption in consumptionCounts) {
        consumptionCounts[log.consumption as keyof typeof consumptionCounts]++;
      }
    });

    const totalMeals = logs.length;
    const goodMeals = consumptionCounts.all + consumptionCounts.most;
    const appetiteScore = totalMeals > 0 
      ? Math.round((goodMeals / totalMeals) * 100) 
      : 0;

    return {
      totalMeals,
      consumptionCounts,
      appetiteScore,
      period: { start: startDate, end: new Date() },
    };
  },
};
