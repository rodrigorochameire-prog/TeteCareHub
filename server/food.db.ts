import { eq, desc } from "drizzle-orm";
import { getDb } from "./db";
import * as schema from "../drizzle/schema";
import { cache } from "./cache";

/**
 * Get current food stock
 */
export async function getCurrentStock() {
  const db = await getDb();
  const [stock] = await db!.select().from(schema.foodStock).limit(1);
  return stock || { id: 0, currentStockKg: 0, lastUpdated: new Date() };
}

/**
 * Convert kg to grams
 */
function kgToGrams(kg: number): number {
  return Math.round(kg * 1000);
}

/**
 * Convert grams to kg
 */
function gramsToKg(grams: number): number {
  return grams / 1000;
}

/**
 * Get food statistics
 * Cached for 30 seconds
 */
export async function getFoodStats() {
  const cacheKey = 'food:stats';
  const cached = cache.get<any>(cacheKey);
  if (cached !== null) {
    return cached;
  }
  
  const db = await getDb();
  const stock = await getCurrentStock();
  const recentMovements = await db!
    .select()
    .from(schema.foodMovements)
    .orderBy(desc(schema.foodMovements.createdAt))
    .limit(10);

  const data = {
    currentStockKg: gramsToKg(stock.currentStockKg),
    lastUpdated: stock.lastUpdated,
    recentMovements: recentMovements.map(m => ({
      ...m,
      amountKg: gramsToKg(Math.abs(m.amountKg)),
    })),
  };
  
  cache.set(cacheKey, data, 60 * 1000); // 1 minute cache (aumentado de 30s para melhor performance)
  return data;
}

/**
 * Add stock (purchase or entry)
 */
export async function addStock(amountKg: number, notes?: string, createdBy?: number) {
  const db = await getDb();
  const stock = await getCurrentStock();
  const amountGrams = kgToGrams(amountKg);

  // Update or create stock record
  if (stock.id > 0) {
    await db!
      .update(schema.foodStock)
      .set({
        currentStockKg: stock.currentStockKg + amountGrams,
        lastUpdated: new Date(),
      })
      .where(eq(schema.foodStock.id, stock.id));
  } else {
    await db!.insert(schema.foodStock).values({
      currentStockKg: amountGrams,
      lastUpdated: new Date(),
    });
  }

  // Record movement
  await db!.insert(schema.foodMovements).values({
    type: "purchase",
    amountKg: amountGrams,
    notes,
    createdBy,
    createdAt: new Date(),
  });

  // Invalidate cache
  cache.delete('food:stats');
  cache.delete('food:total-daily-consumption');

  return { success: true };
}

/**
 * Record daily consumption
 */
export async function recordDailyConsumption(amountKg: number, notes?: string) {
  const db = await getDb();
  const stock = await getCurrentStock();
  const amountGrams = kgToGrams(amountKg);

  if (stock.id > 0) {
    const newStock = Math.max(0, stock.currentStockKg - amountGrams);
    await db!
      .update(schema.foodStock)
      .set({
        currentStockKg: newStock,
        lastUpdated: new Date(),
      })
      .where(eq(schema.foodStock.id, stock.id));
  }

  // Record movement
  await db!.insert(schema.foodMovements).values({
    type: "consumption",
    amountKg: -amountGrams,
    notes,
    createdAt: new Date(),
  });

  // Invalidate cache
  cache.delete('food:stats');
  cache.delete('food:total-daily-consumption');

  return { success: true };
}

/**
 * Get food movements history
 */
export async function getFoodMovements(limit: number = 50) {
  const db = await getDb();
  return await db!
    .select()
    .from(schema.foodMovements)
    .orderBy(desc(schema.foodMovements.createdAt))
    .limit(limit);
}
