import z from "zod";

export const authSchema = z.object({
  //   username: z
  //     .string()
  //     .trim()
  //     .min(1, "Username is required")
  //     .max(10)
  //     .toLowerCase(),
  email: z.email().trim().min(1, "Email is required"),
  password: z.string().trim().min(1, "Password is required"),
});
