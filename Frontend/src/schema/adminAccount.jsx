import { z } from "zod";

const genderEnum = z.enum(["male", "female", "others"]);

export const adminLogin = z.object({
  email: z.string().min(8, "Email must be at least 6 characters").includes("@"),
  password: z
    .string()
    .min(8)
    .max(20)
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
      "Password must contain upper, lower, number, and symbol"
    ),
});

export const adminAccount = z
  .object({
    firstname: z
      .string()
      .min(3, "Firstname must be at least 3 characters")
      .max(30, "Firstname length must be less or equal than 30 characters"),
    lastname: z
      .string()
      .min(3, "Lastname must be at least 3 characters")
      .max(30, "Lastname length must be less or equal than 30 characters"),
    email: z
      .string()
      .min(8, "Email must be at least 8 characters")
      .max(50, "Email must be less than 50 characters")
      .email("Please enter a valid email address"),
    gender: genderEnum.optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(20, "Password must be less than 20 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/,
        "Password must include uppercase, lowercase, number, and special character"
      ),
    confirmPassword: z.string().min(8, "Please confirm your password"),
    birthday: z
      .string()
      .min(8, "Invalid birthday length")
      .max(16, "Exceeded maximum birthday length"),
    age: z.number().min(18, "Staff must be at least 18 years old"),
    contact: z
      .string()
      .min(11, "PH Number minimum of 11 numbers")
      .max(13, "PH Number maximum of 13 numbers"),
    address: z
      .string()
      .min(10, "Address must be at least 10 characters")
      .max(60, "Address must be less than or equal 60 characters"),
    emailVerificationCode: z
      .union([
        z.literal(""),
        z
          .string()
          .length(6, "Verification code must be 6 digits")
          .regex(/^\d{6}$/, "Verification code must be numeric"),
      ])
      .optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

export const adminAccountEdit = z.object({
  firstname: z
    .string()
    .min(3, "Firstname must be at least 8 characters")
    .max(30, "Firstname length must be less or equal than 30 characters"),
  lastname: z
    .string()
    .min(3, "Firstname must be at least 8 characters")
    .max(30, "Lastname length must be less or equal than 30 characters"),
  email: z
    .string()
    .min(8, "Emails must be at least 8 characters")
    .max(30, "Email length must be less or equal than 30 characters")
    .includes("@"),
  gender: genderEnum.optional(),
  birthday: z
    .string()
    .min(8, "Invalid birthday length")
    .max(16, "Exceeded maximum birthday length"),
  age: z.number().min(18, "Admin must be at least 18 years old"),
  contact: z
    .string()
    .min(11, "PH Number minimum of 11 numbers")
    .max(13, "PH Number maximum of 13 numbers"),
  address: z
    .string()
    .min(10, "Address must be at least 10 characters")
    .max(60, "Address must be less than or equal 60 characters"),
  emailVerificationCode: z
    .union([
      z.literal(""),
      z
        .string()
        .length(6, "Verification code must be 6 digits")
        .regex(/^\d{6}$/, "Verification code must be numeric"),
    ])
    .optional(),
});
