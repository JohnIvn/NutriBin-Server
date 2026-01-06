import { z } from "zod";

const genderEnum = z.enum([
  "male", "female", "others"
])

export const adminLogin = z.object({
  email: z.string().min(8, "Email must be at least 6 characters").includes('@'),
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
  firstname: z.string().min(3, "Firstname must be at least 8 characters").max(30, "Firstname length must be less or equal than 30 characters"),
  lastname: z.string().min(3, "Firstname must be at least 8 characters").max(30, "Lastname length must be less or equal than 30 characters"),
  email: z.string().min(8, "Emails must be at least 8 characters").max(30, "Email length must be less or equal than 30 characters").includes("@"),
  gender: genderEnum,
  password: z
    .string()
    .min(8)
    .max(20)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
      "Password must contain upper, lower, number, and symbol"
    ),
  birthday: z.string().min(8, "Invalid birthday length").max(16, "Exceeded maximum birthday length"),
  age: z.number().min(18, "Admin must be at least 18 years old"),
  contact:z.string().min(11, "PH Number minimum of 11 numbers").max(13, "PH Number maximum of 13 numbers"),
  address: z.string().min(10, "Address must be at least 10 characters").max(60, "Address must be less than or equal 60 characters"),
})

export const adminAccountEdit = z.object({
  firstname: z.string().min(3, "Firstname must be at least 8 characters").max(30, "Firstname length must be less or equal than 30 characters"),
  lastname: z.string().min(3, "Firstname must be at least 8 characters").max(30, "Lastname length must be less or equal than 30 characters"),
  email: z.string().min(8, "Emails must be at least 8 characters").max(30, "Email length must be less or equal than 30 characters").includes("@"),
  gender: genderEnum,
  birthday: z.string().min(8, "Invalid birthday length").max(16, "Exceeded maximum birthday length"),
  age: z.number().min(18, "Admin must be at least 18 years old"),
  contact:z.string().min(11, "PH Number minimum of 11 numbers").max(13, "PH Number maximum of 13 numbers"),
  address: z.string().min(10, "Address must be at least 10 characters").max(60, "Address must be less than or equal 60 characters"),
})
