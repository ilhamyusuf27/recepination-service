const { z, parseJson } = require('./common.validator')

const ingredientSchema = z.object({
  name: z.string().trim().min(1).max(150),
  quantity: z.string().trim().max(100).optional().nullable()
}).strict()

const instructions = z.preprocess(parseJson, z.array(z.string().trim().min(1).max(2000)).min(1).max(100))
const ingredients = z.preprocess(parseJson, z.array(ingredientSchema).max(100))
const categoryIds = z.preprocess(parseJson, z.array(z.string().uuid()).max(20).transform((ids) => [...new Set(ids)]))

const createRecipeSchema = z.object({
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().min(5).max(10000),
  instructions,
  ingredients: ingredients.default([]),
  categoryIds: categoryIds.default([])
}).strict()

const updateRecipeSchema = z.object({
  title: z.string().trim().min(3).max(200).optional(),
  description: z.string().trim().min(5).max(10000).optional(),
  instructions: instructions.optional(),
  ingredients: ingredients.optional(),
  categoryIds: categoryIds.optional()
}).strict()

const recipeQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().max(100).optional(),
  categoryId: z.string().uuid().optional(),
  sort: z.enum(['newest', 'oldest', 'popular']).default('newest')
}).strict()

module.exports = { createRecipeSchema, updateRecipeSchema, recipeQuerySchema, ingredientSchema }
