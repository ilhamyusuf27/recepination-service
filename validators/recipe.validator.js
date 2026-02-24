const { z } = require("zod");

const createRecipeSchema = z.object({
    title: z.string().min(3),
    description: z.string().min(5),
    ingredients: z.array(
      z.object({
        name: z.string(),
        quantity: z.string().optional(),
      })
    ).optional(),
    categoryIds: z.array(z.string().uuid()).optional(),
});

const updateRecipeSchema = z.object({
    title: z.string().min(3).optional(),
    description: z.string().min(5).optional(),
    ingredients: z.array(
      z.object({
        name: z.string(),
        quantity: z.string().optional(),
      })
    ).optional(),
    categoryIds: z.array(z.string().uuid()).optional(),
});

module.exports = {
  createRecipeSchema,
  updateRecipeSchema,
};
