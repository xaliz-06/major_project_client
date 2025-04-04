import { AssemblyAI } from "assemblyai";
import { env } from "~/env";

export const aaiClient = new AssemblyAI({
  apiKey: env.ASSEMBLY_AI_API_KEY,
});
