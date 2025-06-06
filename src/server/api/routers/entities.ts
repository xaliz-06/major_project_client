import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "../trpc";
import type { PredictionResponse, Prescription } from "~/lib/types/entities";
import { transcribes } from "~/server/db/schema";
import { eq } from "drizzle-orm";
import { env } from "~/env";

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const MODEL_URL =
  env.NODE_ENV === "production" ? env.MODEL_PROD_URL : env.MODEL_LOCAL_URL;

export const entitiesRouter = createTRPCRouter({
  generate: publicProcedure
    .input(
      z.object({
        fileId: z.string().min(1),
        transcription: z.string().min(1),
        skip: z.boolean().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      if (!input.skip) {
        const existing = await ctx.db.query.transcribes.findFirst({
          where: (transcribes, { eq }) => eq(transcribes.id, input.fileId),
        });

        await ctx.db
          .update(transcribes)
          .set({ transcription: input.transcription })
          .where(eq(transcribes.id, input.fileId))
          .returning();

        if (existing && existing.entities !== null) {
          const data = {
            summary: existing.summary,
            prescription: JSON.parse(existing.entities) as Prescription,
          };

          return data as PredictionResponse;
        }
      }

      try {
        const response = await fetch(`${MODEL_URL}/api/v1/predict`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            conversation: input.transcription,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        return (await response.json()) as PredictionResponse;
      } catch (error) {
        console.error("Prediction error:", error);
        throw error;
      }
    }),
  save: publicProcedure
    .input(
      z.object({
        fileId: z.string().min(1),
        entities: z.string().min(1),
        summary: z.string().min(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const [result] = await ctx.db
        .update(transcribes)
        .set({
          entities: input.entities,
          summary: input.summary,
        })
        .where(eq(transcribes.id, input.fileId))
        .returning();

      return result;
    }),
});
