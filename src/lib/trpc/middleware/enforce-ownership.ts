import { TRPCError } from "@trpc/server";
import { db } from "@/lib/db";
import { eq } from "drizzle-orm";
import type { PgTable } from "drizzle-orm/pg-core";

interface OwnershipCheckable {
  id: any;
  source: any;
  createdByUserId: any;
}

/**
 * Verifica se o usuario pode modificar um registro baseado em source/created_by.
 * Admin pode tudo. Tutor so modifica registros com source='tutor' e created_by=userId.
 */
export async function enforceOwnership(
  userRole: string,
  userId: number,
  table: PgTable & OwnershipCheckable,
  recordId: number
): Promise<void> {
  if (userRole === "admin") return;

  const record = await db
    .select({
      id: table.id,
      source: table.source,
      createdByUserId: table.createdByUserId,
    })
    .from(table)
    .where(eq(table.id, recordId))
    .limit(1);

  if (record.length === 0) {
    throw new TRPCError({
      code: "NOT_FOUND",
      message: "Registro nao encontrado",
    });
  }

  const row = record[0];

  if (row.source !== "tutor" || row.createdByUserId !== userId) {
    throw new TRPCError({
      code: "FORBIDDEN",
      message: "Voce nao pode alterar registros cadastrados pela creche",
    });
  }
}

/**
 * Verifica se o tutor pode editar um campo especifico do pet.
 */
export function canTutorEditPetField(
  adminLockedFields: string[],
  fieldName: string
): boolean {
  return !adminLockedFields.includes(fieldName);
}

/**
 * Filtra campos de update do tutor removendo campos locked pelo admin.
 */
export function filterTutorPetUpdate(
  adminLockedFields: string[],
  updateData: Record<string, unknown>
): Record<string, unknown> {
  const filtered: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(updateData)) {
    if (!adminLockedFields.includes(key) && value !== undefined) {
      filtered[key] = value;
    }
  }
  return filtered;
}
