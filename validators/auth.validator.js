const { z } = require('zod')

const email = z.string().trim().toLowerCase().email('Invalid email')
const password = z.string().min(8, 'Password must be at least 8 characters').max(128)

const registerSchema = z.object({
  name: z.string().trim().min(3).max(100),
  phone_number: z.string().trim().min(5).max(30).optional().nullable(),
  email,
  password,
  rePassword: z.string()
}).strict().refine((data) => data.password === data.rePassword, {
  message: 'Password confirmation does not match',
  path: ['rePassword']
})

const loginSchema = z.object({ email, password }).strict()
const emailSchema = z.object({ email }).strict()
const refreshTokenSchema = z.object({ refreshToken: z.string().min(32) }).strict()
const resetPasswordSchema = z.object({
  token: z.string().min(32),
  password,
  rePassword: z.string()
}).strict().refine((data) => data.password === data.rePassword, {
  message: 'Password confirmation does not match',
  path: ['rePassword']
})

module.exports = {
  registerSchema,
  loginSchema,
  emailSchema,
  refreshTokenSchema,
  resetPasswordSchema
}
