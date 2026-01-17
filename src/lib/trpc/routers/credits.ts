import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../init";
import { db, creditPackages, pets, petTutors } from "@/lib/db";
import { eq, desc, and } from "drizzle-orm";
import { Errors, safeAsync } from "@/lib/errors";
import { idSchema } from "@/lib/validations";
import { addCredits as creditEngineAddCredits, debitCredits } from "@/lib/services/credit-engine";

export const creditsRouter = router({
  /**
   * Lista pacotes de créditos ativos
   */
  packages: protectedProcedure.query(async () => {
    return safeAsync(async () => {
      const packages = await db
        .select()
        .from(creditPackages)
        .where(eq(creditPackages.isActive, true))
        .orderBy(creditPackages.displayOrder, creditPackages.credits);

      return packages;
    }, "Erro ao listar pacotes de créditos");
  }),

  /**
   * Lista todos os pacotes (admin)
   */
  allPackages: adminProcedure.query(async () => {
    return safeAsync(async () => {
      const packages = await db
        .select()
        .from(creditPackages)
        .orderBy(creditPackages.displayOrder, creditPackages.credits);

      return packages;
    }, "Erro ao listar pacotes");
  }),

  /**
   * Cria pacote de créditos (admin)
   */
  createPackage: adminProcedure
    .input(
      z.object({
        name: z.string().min(1).max(100),
        description: z.string().max(500).optional(),
        credits: z.number().int().min(1).max(365),
        priceInCents: z.number().int().min(100),
        discountPercent: z.number().int().min(0).max(100).default(0),
        displayOrder: z.number().int().default(0),
      })
    )
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const [newPackage] = await db
          .insert(creditPackages)
          .values({
            name: input.name,
            description: input.description || null,
            credits: input.credits,
            priceInCents: input.priceInCents,
            discountPercent: input.discountPercent,
            displayOrder: input.displayOrder,
            isActive: true,
          })
          .returning();

        return newPackage;
      }, "Erro ao criar pacote");
    }),

  /**
   * Atualiza pacote de créditos (admin)
   */
  updatePackage: adminProcedure
    .input(
      z.object({
        id: idSchema,
        name: z.string().min(1).max(100).optional(),
        description: z.string().max(500).optional(),
        credits: z.number().int().min(1).max(365).optional(),
        priceInCents: z.number().int().min(100).optional(),
        discountPercent: z.number().int().min(0).max(100).optional(),
        displayOrder: z.number().int().optional(),
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const { id, ...data } = input;

        const existing = await db.query.creditPackages.findFirst({
          where: eq(creditPackages.id, id),
        });

        if (!existing) {
          throw Errors.notFound("Pacote de créditos");
        }

        const updateData: Record<string, unknown> = {};
        if (data.name !== undefined) updateData.name = data.name;
        if (data.description !== undefined) updateData.description = data.description;
        if (data.credits !== undefined) updateData.credits = data.credits;
        if (data.priceInCents !== undefined) updateData.priceInCents = data.priceInCents;
        if (data.discountPercent !== undefined) updateData.discountPercent = data.discountPercent;
        if (data.displayOrder !== undefined) updateData.displayOrder = data.displayOrder;
        if (data.isActive !== undefined) updateData.isActive = data.isActive;

        const [updated] = await db
          .update(creditPackages)
          .set(updateData)
          .where(eq(creditPackages.id, id))
          .returning();

        return updated;
      }, "Erro ao atualizar pacote");
    }),

  /**
   * Deleta pacote de créditos (admin)
   */
  deletePackage: adminProcedure
    .input(z.object({ id: idSchema }))
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const existing = await db.query.creditPackages.findFirst({
          where: eq(creditPackages.id, input.id),
        });

        if (!existing) {
          throw Errors.notFound("Pacote de créditos");
        }

        await db.delete(creditPackages).where(eq(creditPackages.id, input.id));

        return { success: true, deletedId: input.id };
      }, "Erro ao deletar pacote");
    }),

  /**
   * Adiciona créditos a um pet (após compra - admin)
   */
  addToPet: adminProcedure
    .input(
      z.object({
        petId: idSchema,
        credits: z.number().int().min(1).max(365),
        reason: z.string().max(200).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar autenticação
      if (!ctx.user || !ctx.user.id) {
        throw Errors.unauthorized("Sessão expirada");
      }

      const userId = ctx.user.id;

      return safeAsync(async () => {
        const pet = await db.query.pets.findFirst({
          where: eq(pets.id, input.petId),
        });

        if (!pet) {
          throw Errors.notFound("Pet");
        }

        // Usar Credit Engine para garantir transação e consistência
        const result = await creditEngineAddCredits(
          input.petId,
          input.credits,
          userId,
          {
            packageName: input.reason,
          }
        );

        if (!result.success) {
          throw Errors.badRequest(result.error || "Erro ao adicionar créditos");
        }

        // Retornar pet atualizado
        const [updated] = await db
          .select()
          .from(pets)
          .where(eq(pets.id, input.petId));

        return updated;
      }, "Erro ao adicionar créditos");
    }),

  /**
   * Remove créditos de um pet (uso de creche - admin)
   */
  removeFromPet: adminProcedure
    .input(
      z.object({
        petId: idSchema,
        credits: z.number().int().min(1),
        reason: z.string().max(200).optional(),
      })
    )
    .mutation(async ({ ctx, input }) => {
      // Verificar autenticação
      if (!ctx.user || !ctx.user.id) {
        throw Errors.unauthorized("Sessão expirada");
      }

      const userId = ctx.user.id;

      return safeAsync(async () => {
        const pet = await db.query.pets.findFirst({
          where: eq(pets.id, input.petId),
        });

        if (!pet) {
          throw Errors.notFound("Pet");
        }

        if (pet.credits < input.credits) {
          throw Errors.badRequest("Pet não tem créditos suficientes");
        }

        // Usar Credit Engine para garantir transação e consistência
        const result = await debitCredits(
          input.petId,
          input.credits,
          userId,
          {
            description: input.reason || "Remoção manual de créditos",
          }
        );

        if (!result.success) {
          throw Errors.badRequest(result.error || "Erro ao remover créditos");
        }

        // Retornar pet atualizado
        const [updated] = await db
          .select()
          .from(pets)
          .where(eq(pets.id, input.petId));

        return updated;
      }, "Erro ao remover créditos");
    }),

  /**
   * Resumo de créditos do tutor
   */
  mySummary: protectedProcedure.query(async ({ ctx }) => {
    if (!ctx.user || !ctx.user.id) {
      throw Errors.unauthorized("Sessão expirada");
    }

    const userId = ctx.user.id;

    return safeAsync(async () => {
      // Buscar todos os pets do tutor
      const myPets = await db
        .select({
          id: pets.id,
          name: pets.name,
          species: pets.species,
          credits: pets.credits,
          approvalStatus: pets.approvalStatus,
        })
        .from(pets)
        .innerJoin(petTutors, eq(pets.id, petTutors.petId))
        .where(eq(petTutors.tutorId, userId));

      const totalCredits = myPets.reduce((sum, pet) => sum + pet.credits, 0);
      const approvedPets = myPets.filter(p => p.approvalStatus === "approved");

      return {
        totalCredits,
        petCount: myPets.length,
        approvedPetCount: approvedPets.length,
        petCredits: myPets.map(p => ({
          id: p.id,
          name: p.name,
          species: p.species,
          credits: p.credits,
        })),
      };
    }, "Erro ao buscar resumo de créditos");
  }),
});
