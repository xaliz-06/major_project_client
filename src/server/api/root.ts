import { transcribeRouter } from "~/server/api/routers/transcribe";
import { createCallerFactory, createTRPCRouter } from "~/server/api/trpc";
import { entitiesRouter } from "./routers/entities";

/**
 * This is the primary router for your server.
 *
 * All routers added in /api/routers should be manually added here.
 */
export const appRouter = createTRPCRouter({
  transcribe: transcribeRouter,
  entities: entitiesRouter,
});

// export type definition of API
export type AppRouter = typeof appRouter;

/**
 * Create a server-side caller for the tRPC API.
 * @example
 * const trpc = createCaller(createContext);
 * const res = await trpc.post.all();
 *       ^? Post[]
 */
export const createCaller = createCallerFactory(appRouter);
