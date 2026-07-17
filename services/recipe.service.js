const prisma = require('../lib/prisma')
const AppError = require('../utils/AppError')
const { parsePagination } = require('../utils/pagination')

const recipeListInclude = {
  user: { select: { user_id: true, name: true, photo_profile: true } },
  categories: { include: { category: true } },
  _count: { select: { favorites: true, comments: true } }
}

const assertOwner = async (recipeId, actor, tx = prisma) => {
  const recipe = await tx.recipe.findUnique({
    where: { recipe_id: recipeId },
    select: { recipe_id: true, user_id: true, image_path: true }
  })
  if (!recipe) throw new AppError('Recipe not found', 404)
  if (actor.role !== 'ADMIN' && recipe.user_id !== actor.user_id) throw new AppError('Forbidden', 403)
  return recipe
}

const createRecipe = async (data, userId) => prisma.$transaction(async (tx) => {
  const recipe = await tx.recipe.create({
    data: {
      user_id: userId,
      title: data.title,
      description: data.description,
      instructions: data.instructions,
      image_url: data.image_url || null,
      image_path: data.image_path || null
    }
  })

  if (data.ingredients.length) {
    await tx.ingredient.createMany({
      data: data.ingredients.map((item, index) => ({
        recipeId: recipe.recipe_id,
        name: item.name,
        quantity: item.quantity || null,
        position: index + 1
      }))
    })
  }

  if (data.categoryIds.length) {
    await tx.recipeCategory.createMany({
      data: data.categoryIds.map((categoryId) => ({ recipeId: recipe.recipe_id, categoryId }))
    })
  }

  return tx.recipe.findUnique({ where: { recipe_id: recipe.recipe_id }, include: recipeListInclude })
})

const getRecipes = async (query, userId) => {
  const { page, limit, skip } = parsePagination(query)
  const where = {
    ...(userId && { user_id: userId }),
    ...(query.search && {
      OR: [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { ingredients: { some: { name: { contains: query.search, mode: 'insensitive' } } } }
      ]
    }),
    ...(query.categoryId && { categories: { some: { categoryId: query.categoryId } } })
  }

  const orderBy = query.sort === 'popular'
    ? { favorites: { _count: 'desc' } }
    : { created_at: query.sort === 'oldest' ? 'asc' : 'desc' }

  const [data, total] = await Promise.all([
    prisma.recipe.findMany({ where, skip, take: limit, include: recipeListInclude, orderBy }),
    prisma.recipe.count({ where })
  ])
  return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
}

const getRecipeDetail = async (id) => prisma.recipe.findUnique({
  where: { recipe_id: id },
  include: {
    ...recipeListInclude,
    ingredients: { orderBy: { position: 'asc' } }
  }
})

const updateRecipe = async (recipeId, data, actor) => prisma.$transaction(async (tx) => {
  const existing = await assertOwner(recipeId, actor, tx)
  await tx.recipe.update({
    where: { recipe_id: recipeId },
    data: {
      title: data.title,
      description: data.description,
      instructions: data.instructions,
      image_url: data.image_url,
      image_path: data.image_path
    }
  })

  if (data.ingredients !== undefined) {
    await tx.ingredient.deleteMany({ where: { recipeId } })
    if (data.ingredients.length) {
      await tx.ingredient.createMany({
        data: data.ingredients.map((item, index) => ({
          recipeId,
          name: item.name,
          quantity: item.quantity || null,
          position: index + 1
        }))
      })
    }
  }

  if (data.categoryIds !== undefined) {
    await tx.recipeCategory.deleteMany({ where: { recipeId } })
    if (data.categoryIds.length) {
      await tx.recipeCategory.createMany({
        data: data.categoryIds.map((categoryId) => ({ recipeId, categoryId }))
      })
    }
  }

  const recipe = await tx.recipe.findUnique({
    where: { recipe_id: recipeId },
    include: { ...recipeListInclude, ingredients: { orderBy: { position: 'asc' } } }
  })
  return { recipe, previousImagePath: existing.image_path }
})

const deleteRecipe = async (id, actor) => prisma.$transaction(async (tx) => {
  const existing = await assertOwner(id, actor, tx)
  await tx.recipe.delete({ where: { recipe_id: id } })
  return existing
})

module.exports = { assertOwner, createRecipe, getRecipes, getRecipeDetail, updateRecipe, deleteRecipe }
