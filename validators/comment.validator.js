const { z } = require('zod')

const createCommentSchema = z.object({
  content: z.string().trim().min(1).max(2000),
  recipeId: z.string().uuid(),
  parentId: z.string().uuid().optional().nullable()
}).strict()
const updateCommentSchema = z.object({ content: z.string().trim().min(1).max(2000) }).strict()
const recipeIdParamSchema = z.object({ recipeId: z.string().uuid() })

module.exports = { createCommentSchema, updateCommentSchema, recipeIdParamSchema }
