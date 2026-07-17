const prisma = require('../lib/prisma')
const { assertOwner } = require('./recipe.service')
const AppError = require('../utils/AppError')

const addIngredient = async (data, actor) => {
  await assertOwner(data.recipeId, actor)
  const position = await prisma.ingredient.count({ where: { recipeId: data.recipeId } })
  return prisma.ingredient.create({ data: { ...data, position: position + 1 } })
}

const replaceIngredients = async (recipeId, ingredients, actor) => prisma.$transaction(async (tx) => {
  await assertOwner(recipeId, actor, tx)
  await tx.ingredient.deleteMany({ where: { recipeId } })
  if (ingredients.length) {
    await tx.ingredient.createMany({
      data: ingredients.map((item, index) => ({ ...item, recipeId, position: index + 1 }))
    })
  }
  return tx.ingredient.findMany({ where: { recipeId }, orderBy: { position: 'asc' } })
})

const getIngredientsByRecipe = (recipeId) => prisma.ingredient.findMany({
  where: { recipeId },
  orderBy: { position: 'asc' }
})

const getOwnedIngredient = async (id, actor) => {
  const ingredient = await prisma.ingredient.findUnique({ where: { id } })
  if (!ingredient) throw new AppError('Ingredient not found', 404)
  await assertOwner(ingredient.recipeId, actor)
  return ingredient
}

const updateIngredient = async (id, data, actor) => {
  await getOwnedIngredient(id, actor)
  return prisma.ingredient.update({ where: { id }, data })
}

const deleteIngredient = async (id, actor) => {
  await getOwnedIngredient(id, actor)
  return prisma.ingredient.delete({ where: { id } })
}

module.exports = { addIngredient, replaceIngredients, getIngredientsByRecipe, updateIngredient, deleteIngredient }
