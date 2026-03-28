import { z } from "zod";
import { router, publicProcedure } from "../init";
import { db } from "@/lib/db";
import { invitations } from "@/lib/db/schema-invitations";
import { users, pets } from "@/lib/db/schema";
import { eq, inArray } from "drizzle-orm";
import { Errors, safeAsync } from "@/lib/errors";
import {
  tutorOnboardingStep1Schema,
  tutorOnboardingStep2Schema,
  completeOnboardingSchema,
} from "@/lib/validations/invitation";
import { filterTutorPetUpdate } from "../middleware/enforce-ownership";

export const invitePublicRouter = router({
  getByToken: publicProcedure
    .input(z.object({ token: z.string().min(1) }))
    .query(async ({ input }) => {
      return safeAsync(async () => {
        const [invitation] = await db
          .select()
          .from(invitations)
          .where(eq(invitations.token, input.token))
          .limit(1);
        if (!invitation) throw Errors.notFound("Convite");

        if (invitation.status === "expired" || new Date() > invitation.expiresAt) {
          throw new Error("Este convite expirou. Solicite um novo a creche.");
        }
        if (invitation.status === "completed") {
          throw new Error("Este convite ja foi utilizado.");
        }

        const [tutor] = await db
          .select()
          .from(users)
          .where(eq(users.id, invitation.tutorId))
          .limit(1);
        if (!tutor) throw Errors.notFound("Tutor");

        const petList = await db
          .select()
          .from(pets)
          .where(inArray(pets.id, invitation.petIds as number[]));

        return {
          invitation: {
            id: invitation.id,
            dashboardAccess: invitation.dashboardAccess,
            expiresAt: invitation.expiresAt,
          },
          tutor: {
            id: tutor.id,
            name: tutor.name,
            email: tutor.email,
            phone: tutor.phone,
          },
          pets: petList.map((p) => ({
            id: p.id,
            name: p.name,
            breed: p.breed,
            species: p.species,
            birthDate: p.birthDate,
            weight: p.weight,
            photoUrl: p.photoUrl,
            adminLockedFields: (p.adminLockedFields as string[]) || [],
            emergencyVetName: p.emergencyVetName,
            emergencyVetPhone: p.emergencyVetPhone,
            fearTriggers: p.fearTriggers,
            notes: p.notes,
          })),
        };
      }, "Erro ao buscar convite");
    }),

  saveStep1: publicProcedure
    .input(tutorOnboardingStep1Schema)
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const [invitation] = await db
          .select()
          .from(invitations)
          .where(eq(invitations.token, input.token))
          .limit(1);
        if (!invitation || invitation.status !== "pending") {
          throw new Error("Convite invalido ou expirado");
        }

        // Note: users table does not have address/emergencyContact/emergencyPhone columns.
        // Only update fields that exist in the schema.
        const updateData: Record<string, unknown> = {
          onboardingStatus: "in_progress",
          updatedAt: new Date(),
        };

        await db.update(users).set(updateData).where(eq(users.id, invitation.tutorId));

        return { success: true };
      }, "Erro ao salvar dados do tutor");
    }),

  saveStep2: publicProcedure
    .input(tutorOnboardingStep2Schema)
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const [invitation] = await db
          .select()
          .from(invitations)
          .where(eq(invitations.token, input.token))
          .limit(1);
        if (!invitation || invitation.status !== "pending") {
          throw new Error("Convite invalido ou expirado");
        }

        for (const petData of input.pets) {
          if (!(invitation.petIds as number[]).includes(petData.petId)) continue;

          const [pet] = await db
            .select()
            .from(pets)
            .where(eq(pets.id, petData.petId))
            .limit(1);
          if (!pet) continue;

          const lockedFields = (pet.adminLockedFields as string[]) || [];
          const rawUpdate: Record<string, unknown> = { updatedAt: new Date() };

          // Map validation schema field names to actual DB column names
          if (petData.vetName) rawUpdate.emergencyVetName = petData.vetName;
          if (petData.vetPhone) rawUpdate.emergencyVetPhone = petData.vetPhone;
          if (petData.vetAddress) rawUpdate.emergencyVetAddress = petData.vetAddress;
          if (petData.fearTriggers) rawUpdate.fearTriggers = petData.fearTriggers;
          if (petData.notes) rawUpdate.notes = petData.notes;

          const safeUpdate = filterTutorPetUpdate(lockedFields, rawUpdate);
          if (Object.keys(safeUpdate).length > 0) {
            await db.update(pets).set(safeUpdate).where(eq(pets.id, petData.petId));
          }
        }

        return { success: true };
      }, "Erro ao salvar dados dos pets");
    }),

  complete: publicProcedure
    .input(completeOnboardingSchema)
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const [invitation] = await db
          .select()
          .from(invitations)
          .where(eq(invitations.token, input.token))
          .limit(1);
        if (!invitation || invitation.status !== "pending") {
          throw new Error("Convite invalido ou expirado");
        }

        await db.update(invitations).set({
          status: "completed",
          completedAt: new Date(),
          updatedAt: new Date(),
        }).where(eq(invitations.id, invitation.id));

        const tutorUpdate: Record<string, unknown> = {
          onboardingStatus: "completed",
          updatedAt: new Date(),
        };
        if (invitation.dashboardAccess) {
          tutorUpdate.approvalStatus = "approved";
        }
        await db.update(users).set(tutorUpdate).where(eq(users.id, invitation.tutorId));

        return { success: true, dashboardAccess: invitation.dashboardAccess };
      }, "Erro ao completar cadastro");
    }),
});
