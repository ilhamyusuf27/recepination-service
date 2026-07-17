const { z } = require('zod')

const idParamSchema = z.object({ id: z.string().uuid() })

const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10)
}).passthrough()

const parseJson = (value) => {
  if (typeof value !== 'string') return value
  try {
    return JSON.parse(value)
  } catch {
    return value
  }
}

module.exports = { z, idParamSchema, paginationSchema, parseJson }
