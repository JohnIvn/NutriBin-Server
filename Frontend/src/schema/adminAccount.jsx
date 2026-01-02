import { z } from "zod";

const genderEnum = z.enum([
  "male", "female", "others"
])

export const adminLogin = z.object({
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

export const adminAccount = z.object({
  firstname: z.string().min(8, "Firstname must be at least 8 characters").max(30, "Firstname length must be less or equal than 30 characters"),
  lastname: z.string().min(8, "Firstname must be at least 8 characters").max(30, "Lastname length must be less or equal than 30 characters"),
  gender: genderEnum,
  age: z.number().min(18, "Admin must be at least 18 years old"),
  number:z.number().min(11, "PH Number minimum of 11 numbers").max(13, "PH Number maximum of 13 numbers"),
  address: z.string().min(10, "Address must be at least 10 characters").max(60, "Address must be less than or equal 60 characters"),
})
