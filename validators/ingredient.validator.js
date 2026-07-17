const { z } = require('zod')
const { ingredientSchema } = require('./recipe.validator')

const createIngredientSchema = ingredientSchema.extend({ recipeId: z.string().uuid() })
const updateIngredientSchema = ingredientSchema.partial().strict().refine(
  (data) => Object.keys(data).length > 0,
  'At least one field is required'
)
const ingredientListSchema = z.object({
  recipeId: z.string().uuid(),
  ingredients: z.array(ingredientSchema).max(100)
}).strict()
const recipeIdParamSchema = z.object({ recipeId: z.string().uuid() })

module.exports = { createIngredientSchema, updateIngredientSchema, ingredientListSchema, recipeIdParamSchema }
