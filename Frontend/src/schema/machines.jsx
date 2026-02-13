import { z } from "zod";

export const machinesFilter = z.object({
  count: z.coerce.number().min(5).max(100),
  term: z.string().optional().or(z.literal("")),
});
