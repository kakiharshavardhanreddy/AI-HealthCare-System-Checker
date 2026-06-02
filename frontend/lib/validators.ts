import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email("Use a valid email address"),
  password: z.string().min(1, "Password is required")
});

export const registerSchema = z
  .object({
    full_name: z.string().min(2, "Full name is required"),
    email: z.string().email("Use a valid email address"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirm_password: z.string().min(8),
    terms: z.boolean().refine(Boolean, "Terms must be accepted")
  })
  .refine((data) => data.password === data.confirm_password, {
    path: ["confirm_password"],
    message: "Passwords do not match"
  });

export const forgotSchema = z.object({
  email: z.string().email("Use a valid email address")
});

export const patientSchema = z.object({
  full_name: z.string().min(2, "Name is required"),
  age: z.coerce.number().min(0).max(120),
  gender: z.enum(["female", "male", "non_binary", "prefer_not_to_say"]),
  blood_group: z.string().min(1),
  height_cm: z.coerce.number().min(31).max(259),
  weight_kg: z.coerce.number().min(2).max(399)
});
