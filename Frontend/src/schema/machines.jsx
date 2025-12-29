import { z } from 'zod'

export const machinesFilter = z.object({
	count: z.number().min(10).max(50),
	term: z.string(),
})