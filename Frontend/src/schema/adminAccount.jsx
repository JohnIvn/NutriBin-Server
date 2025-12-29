import { z } from "zod";

export const adminAccount = z.object({
  username: z.string().min(8, "Username must be at least 8 characters"),
  password: z
    .string()
    .min(8)
    .max(20)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
      "Password must contain upper, lower, number, and symbol"
    ),
});