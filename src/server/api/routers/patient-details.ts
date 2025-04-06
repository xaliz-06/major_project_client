import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import { patients } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { createPatientSchema } from "~/lib/types/patient";

export const patientDetailsRouter = createTRPCRouter({
  get: publicProcedure
    .input(z.object({ transcribeId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const patient = await ctx.db.query.patients.findFirst({
        where: (patients, { eq }) =>
          eq(patients.transcribeId, input.transcribeId),
      });

      return patient;
    }),
  add: publicProcedure
    .input(createPatientSchema)
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.patients.findFirst({
        where: (patients, { eq }) =>
          eq(patients.transcribeId, input.transcribeId),
      });

      if (existing) {
        const [updated] = await ctx.db
          .update(patients)
          .set({
            isAnonymous: input.isAnonymous,
            firstName: input.firstName,
            middleName: input.middleName,
            lastName: input.lastName,
            dateOfBirth: input.dateOfBirth,
            gender: input.gender,
            phone: input.phone,
            email: input.email,
            visitDate: input.visitDate,
            visitTime: input.visitTime,
            doctorName: input.doctorName,
          })
          .where(eq(patients.transcribeId, input.transcribeId))
          .returning();

        return {
          record: updated,
          action: "updated",
        };
      } else {
        const [inserted] = await ctx.db
          .insert(patients)
          .values({
            transcribeId: input.transcribeId,
            isAnonymous: input.isAnonymous,
            firstName: input.firstName,
            middleName: input.middleName,
            lastName: input.lastName,
            dateOfBirth: input.dateOfBirth,
            gender: input.gender,
            phone: input.phone,
            email: input.email,
            visitDate: input.visitDate,
            visitTime: input.visitTime,
            doctorName: input.doctorName,
          })
          .returning();

        return {
          record: inserted,
          action: "created",
        };
      }
    }),
});
