import { z } from "zod";
import { router, adminProcedure } from "../init";
import { db, users, petTutors, invitations } from "@/lib/db";
import { eq, desc, and } from "drizzle-orm";
import { safeAsync, Errors } from "@/lib/errors";
import { createInvitationSchema } from "@/lib/validations/invitation";
import crypto from "crypto";

export const invitationsRouter = router({
  /**
   * Lista todos os convites (admin)
   */
  list: adminProcedure.query(async () => {
    return safeAsync(async () => {
      const result = await db
        .select({
          invitation: invitations,
          tutor: {
            id: users.id,
            name: users.name,
            email: users.email,
            phone: users.phone,
          },
        })
        .from(invitations)
        .innerJoin(users, eq(invitations.tutorId, users.id))
        .orderBy(desc(invitations.createdAt));
      return result;
    }, "Erro ao listar convites");
  }),

  /**
   * Cria um novo convite para tutor (admin)
   */
  create: adminProcedure
    .input(createInvitationSchema)
    .mutation(async ({ ctx, input }) => {
      return safeAsync(async () => {
        const tutor = await db.query.users.findFirst({
          where: eq(users.id, input.tutorId),
        });
        if (!tutor) throw Errors.notFound("Tutor");

        for (const petId of input.petIds) {
          const relation = await db.query.petTutors.findFirst({
            where: and(
              eq(petTutors.petId, petId),
              eq(petTutors.tutorId, input.tutorId)
            ),
          });
          if (!relation) {
            throw Errors.conflict(`Pet ${petId} nao esta vinculado a este tutor`);
          }
        }

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const [invitation] = await db
          .insert(invitations)
          .values({
            token,
            tutorId: input.tutorId,
            petIds: input.petIds,
            dashboardAccess: input.dashboardAccess,
            status: "pending",
            createdBy: ctx.user.id,
            expiresAt,
          })
          .returning();

        await db
          .update(users)
          .set({
            onboardingStatus: "not_started",
            invitedBy: ctx.user.id,
            updatedAt: new Date(),
          })
          .where(eq(users.id, input.tutorId));

        return {
          ...invitation,
          inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/${token}`,
        };
      }, "Erro ao criar convite");
    }),

  /**
   * Revoga um convite (admin)
   */
  revoke: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const [updated] = await db
          .update(invitations)
          .set({ status: "expired", updatedAt: new Date() })
          .where(eq(invitations.id, input.id))
          .returning();
        if (!updated) throw Errors.notFound("Convite");
        return updated;
      }, "Erro ao revogar convite");
    }),

  /**
   * Reenvia um convite com novo token (admin)
   */
  resend: adminProcedure
    .input(z.object({ id: z.number().int().positive() }))
    .mutation(async ({ input }) => {
      return safeAsync(async () => {
        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7);

        const [updated] = await db
          .update(invitations)
          .set({ token, status: "pending", expiresAt, updatedAt: new Date() })
          .where(eq(invitations.id, input.id))
          .returning();
        if (!updated) throw Errors.notFound("Convite");
        return {
          ...updated,
          inviteUrl: `${process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"}/invite/${token}`,
        };
      }, "Erro ao reenviar convite");
    }),
});
