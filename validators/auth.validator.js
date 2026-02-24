const { z } = require("zod");

const registerSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    phone_number: z.string().optional().nullable(),
    email: z.string().email("Invalid email"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    rePassword: z.string(),
  })
  .refine((data) => data.password === data.rePassword, {
    message: "Password confirmation does not match",
    path: ["rePassword"],
  });

const loginSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Invalid email format"),

  password: z
    .string()
    .min(1, "Password is required")
    .min(8, "Password must be at least 8 characters"),
});

module.exports = {
  registerSchema,
  loginSchema,
};
