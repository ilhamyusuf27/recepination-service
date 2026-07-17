const { z } = require('zod')

const categorySchema = z.object({ name: z.string().trim().min(2).max(80) }).strict()
const categoryDetailQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional()
}).strict()

const recipeCategorySchema = z.object({ recipeId: z.string().uuid(), categoryId: z.string().uuid() }).strict()
const bulkRecipeCategorySchema = z.object({
  recipeId: z.string().uuid(),
  categoryIds: z.array(z.string().uuid()).max(20).transform((ids) => [...new Set(ids)])
}).strict()
const recipeIdParamSchema = z.object({ recipeId: z.string().uuid() })
const categoryIdParamSchema = z.object({ categoryId: z.string().uuid() })

module.exports = {
  categorySchema,
  categoryDetailQuerySchema,
  recipeCategorySchema,
  bulkRecipeCategorySchema,
  recipeIdParamSchema,
  categoryIdParamSchema
}
