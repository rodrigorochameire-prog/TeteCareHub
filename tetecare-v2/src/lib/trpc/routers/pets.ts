import { z } from "zod";
import { router, protectedProcedure, adminProcedure } from "../init";
import { db, pets, petTutors } from "@/lib/db";
import { eq, and, desc } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Schema de validação para criar pet
const createPetSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório").max(100),
  breed: z.string().max(100).optional(),
  species: z.enum(["dog", "cat"]).default("dog"),
  birthDate: z.string().optional(), // ISO date string
  weight: z.number().min(0).optional(), // em gramas
  notes: z.string().max(1000).optional(),
  foodBrand: z.string().max(200).optional(),
  foodAmount: z.number().min(0).optional(),
});

// Schema de validação para atualizar pet
const updatePetSchema = createPetSchema.partial().extend({
  id: z.number(),
});

export const petsRouter = router({
  /**
   * Lista pets do tutor logado
   */
  myPets: protectedProcedure.query(async ({ ctx }) => {
    const result = await db
      .select({
        pet: pets,
        relation: petTutors,
      })
      .from(pets)
      .innerJoin(petTutors, eq(pets.id, petTutors.petId))
      .where(eq(petTutors.tutorId, ctx.user.id))
      .orderBy(desc(pets.createdAt));

    return result.map((r) => ({
      ...r.pet,
      isPrimary: r.relation.isPrimary,
    }));
  }),

  /**
   * Lista todos os pets (admin)
   */
  list: adminProcedure
    .input(
      z
        .object({
          status: z.string().optional(),
          approvalStatus: z.string().optional(),
        })
        .optional()
    )
    .query(async ({ input }) => {
      let query = db.select().from(pets).orderBy(desc(pets.createdAt));

      // TODO: Adicionar filtros quando necessário

      return query;
    }),

  /**
   * Busca pet por ID
   */
  byId: protectedProcedure
    .input(z.object({ id: z.number() }))
    .query(async ({ ctx, input }) => {
      const pet = await db.query.pets.findFirst({
        where: eq(pets.id, input.id),
      });

      if (!pet) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Pet não encontrado",
        });
      }

      // Se não for admin, verificar se é tutor do pet
      if (ctx.user.role !== "admin") {
        const relation = await db.query.petTutors.findFirst({
          where: and(
            eq(petTutors.petId, input.id),
            eq(petTutors.tutorId, ctx.user.id)
          ),
        });

        if (!relation) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Você não tem permissão para ver este pet",
          });
        }
      }

      return pet;
    }),

  /**
   * Cria um novo pet
   */
  create: protectedProcedure
    .input(createPetSchema)
    .mutation(async ({ ctx, input }) => {
      // Criar pet
      const [newPet] = await db
        .insert(pets)
        .values({
          name: input.name,
          breed: input.breed,
          species: input.species,
          birthDate: input.birthDate ? new Date(input.birthDate) : null,
          weight: input.weight,
          notes: input.notes,
          foodBrand: input.foodBrand,
          foodAmount: input.foodAmount,
          // Admin cria pets já aprovados, tutores precisam de aprovação
          approvalStatus: ctx.user.role === "admin" ? "approved" : "pending",
        })
        .returning();

      // Associar ao tutor que criou
      await db.insert(petTutors).values({
        petId: newPet.id,
        tutorId: ctx.user.id,
        isPrimary: true,
      });

      return newPet;
    }),

  /**
   * Atualiza um pet
   */
  update: protectedProcedure
    .input(updatePetSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...data } = input;

      // Verificar permissão
      if (ctx.user.role !== "admin") {
        const relation = await db.query.petTutors.findFirst({
          where: and(
            eq(petTutors.petId, id),
            eq(petTutors.tutorId, ctx.user.id)
          ),
        });

        if (!relation) {
          throw new TRPCError({
            code: "FORBIDDEN",
            message: "Você não tem permissão para editar este pet",
          });
        }
      }

      const [updatedPet] = await db
        .update(pets)
        .set({
          ...data,
          birthDate: data.birthDate ? new Date(data.birthDate) : undefined,
          updatedAt: new Date(),
        })
        .where(eq(pets.id, id))
        .returning();

      return updatedPet;
    }),

  /**
   * Aprova um pet (admin)
   */
  approve: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      const [pet] = await db
        .update(pets)
        .set({
          approvalStatus: "approved",
          updatedAt: new Date(),
        })
        .where(eq(pets.id, input.id))
        .returning();

      return pet;
    }),

  /**
   * Rejeita um pet (admin)
   */
  reject: adminProcedure
    .input(z.object({ id: z.number(), reason: z.string().optional() }))
    .mutation(async ({ input }) => {
      const [pet] = await db
        .update(pets)
        .set({
          approvalStatus: "rejected",
          notes: input.reason,
          updatedAt: new Date(),
        })
        .where(eq(pets.id, input.id))
        .returning();

      return pet;
    }),

  /**
   * Lista pets pendentes de aprovação (admin)
   */
  pending: adminProcedure.query(async () => {
    return db
      .select()
      .from(pets)
      .where(eq(pets.approvalStatus, "pending"))
      .orderBy(desc(pets.createdAt));
  }),

  /**
   * Deleta um pet (admin)
   */
  delete: adminProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ input }) => {
      await db.delete(pets).where(eq(pets.id, input.id));
      return { success: true };
    }),
});
