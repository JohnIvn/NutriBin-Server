import { z } from "zod";

export const serialFilter = z.object({
  count: z.string(),
  term: z.string().optional(),
});
