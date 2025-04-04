import { eq } from "drizzle-orm";
import { z } from "zod";

import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { transcribes } from "~/server/db/schema";
import { aaiClient } from "~/utils/assemblyai";

type TranscriptionResponse = {
  text: string;
};

export const transcribeRouter = createTRPCRouter({
  add: publicProcedure
    .input(
      z.object({
        filename: z.string().min(1),
        fileURL: z.string().min(1),
        type: z.string().min(1).optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const data = {
        filename: input.filename,
        fileURL: input.fileURL,
        ...(input.type ? { type: input.type } : {}),
      };
      const [res] = await ctx.db
        .insert(transcribes)
        .values(data)
        .returning({ fileId: transcribes.id });
      return res;
    }),
  get: publicProcedure
    .input(z.object({ fileId: z.string().min(1) }))
    .query(async ({ ctx, input }) => {
      const res = await ctx.db.query.transcribes.findFirst({
        where: (transcribes, { eq }) => eq(transcribes.id, input.fileId),
      });

      return res;
    }),
  getTranscription: publicProcedure
    .input(z.object({ fileURL: z.string().min(1) }))
    .mutation(async ({ ctx, input }) => {
      const existing = await ctx.db.query.transcribes.findFirst({
        where: (transcribes, { eq }) => eq(transcribes.fileURL, input.fileURL),
      });

      if (existing && existing.transcription !== null) {
        return {
          id: existing.id,
          transcription: existing.transcription,
          fromCache: true,
        };
      }

      const transcript = await aaiClient.transcripts.transcribe({
        audio: input.fileURL,
      });

      if (transcript.status === "error") {
        throw new Error(transcript.error);
      }

      await ctx.db
        .update(transcribes)
        .set({ transcription: transcript.text })
        .where(eq(transcribes.fileURL, input.fileURL));

      const data = {
        transcription: transcript.text,
        fromCache: false,
      };

      return data;
    }),
  update: publicProcedure
    .input(
      z.object({ fileId: z.string().min(1), transcription: z.string().min(1) }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(transcribes)
        .set({
          transcription: input.transcription,
        })
        .where(eq(transcribes.id, input.fileId));
    }),
});
