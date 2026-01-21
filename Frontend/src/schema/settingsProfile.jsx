import { z } from "zod";

// Schema for the Settings page — excludes age and gender
export const settingsProfile = z.object({
  firstname: z
    .string()
    .min(1, "Firstname is required")
    .max(30, "Firstname must be 30 characters or less"),
  lastname: z
    .string()
    .min(1, "Lastname is required")
    .max(30, "Lastname must be 30 characters or less"),
  address: z
    .string()
    .max(120, "Address must be 120 characters or less")
    .optional(),
  number: z
    .string()
    .min(0)
    .max(30, "Contact number must be 30 characters or less")
    .optional(),
});
