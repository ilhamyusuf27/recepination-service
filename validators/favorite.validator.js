const { z } = require('zod')

const favoriteSchema = z.object({ recipeId: z.string().uuid() }).strict()
const favoriteQuerySchema = z.object({ recipeId: z.string().uuid() }).strict()

module.exports = { favoriteSchema, favoriteQuerySchema }
