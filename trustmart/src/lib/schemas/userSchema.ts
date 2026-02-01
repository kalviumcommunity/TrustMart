import { z } from "zod";

export const userSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters long").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Invalid email address"),
  age: z.number().min(18, "User must be 18 or older").max(120, "Age must be less than 120"),
  role: z.enum(["user", "admin", "moderator"]).default("user"),
  isActive: z.boolean().default(true),
});

export const userUpdateSchema = userSchema.partial();

export type UserInput = z.infer<typeof userSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
