const { z } = require('zod')

const updateUserSchema = z.object({
  name: z.string().trim().min(3).max(100).optional(),
  phone_number: z.string().trim().min(5).max(30).nullable().optional()
}).strict()

module.exports = { updateUserSchema }
