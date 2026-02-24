const prisma = require("../lib/prisma");

const createRecipe = async (data) => {
  const { title, description, user_id, ingredients, categoryIds } = data;

  return prisma.$transaction(async (tx) => {
    const newRecipe = await tx.recipe.create({
      data: { title, description, user_id },
    });

    if (ingredients?.length) {
      await tx.ingredient.createMany({
        data: ingredients.map((item) => ({
          recipeId: newRecipe.recipe_id,
          name: item.name,
          quantity: item.quantity,
        })),
      });
    }

    if (categoryIds?.length) {
      await tx.recipeCategory.createMany({
        data: categoryIds.map((id) => ({
          recipeId: newRecipe.recipe_id,
          categoryId: id,
        })),
      });
    }

    return newRecipe;
  });
};

const getRecipes = async ({ page = 1, limit = 10, search, categoryId }) => {
  const skip = (page - 1) * limit;

  const whereClause = {
    ...(search && {
      title: { contains: search, mode: "insensitive" },
    }),
    ...(categoryId && {
      categories: { some: { categoryId } },
    }),
  };

  const [recipes, total] = await Promise.all([
    prisma.recipe.findMany({
      where: whereClause,
      skip: Number(skip),
      take: Number(limit),
      include: {
        user: { select: { name: true } },
        _count: {
          select: { favorites: true, comments: true },
        },
      },
      orderBy: { created_at: "desc" },
    }),
    prisma.recipe.count({ where: whereClause }),
  ]);

  return {
    data: recipes,
    meta: {
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    },
  };
};

const getRecipeDetail = async (id) => {
  return prisma.recipe.findUnique({
    where: { recipe_id: id },
    include: {
      user: { select: { name: true, photo_profile: true } },
      ingredients: true,
      comments: {
        include: { user: { select: { name: true } } },
        orderBy: { created_at: "desc" },
      },
      categories: { include: { category: true } },
      _count: {
        select: { favorites: true, comments: true },
      },
    },
  });
};

const updateRecipe = async (recipeId, data) => {
  const { title, description, ingredients, categoryIds } = data;

  return prisma.$transaction(async (tx) => {
    const recipe = await tx.recipe.update({
      where: { recipe_id: recipeId },
      data: { title, description },
    });

    await tx.ingredient.deleteMany({ where: { recipeId } });

    if (ingredients?.length) {
      await tx.ingredient.createMany({
        data: ingredients.map((item) => ({
          recipeId,
          name: item.name,
          quantity: item.quantity,
        })),
      });
    }

    await tx.recipeCategory.deleteMany({ where: { recipeId } });

    if (categoryIds?.length) {
      await tx.recipeCategory.createMany({
        data: categoryIds.map((id) => ({
          recipeId,
          categoryId: id,
        })),
      });
    }

    return recipe;
  });
};

const deleteRecipe = async (id) => {
  return prisma.recipe.delete({
    where: { recipe_id: id },
  });
};

const toggleFavorite = async (userId, recipeId) => {
  const existing = await prisma.favorite.findFirst({
    where: { userId, recipeId },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { id: existing.id },
    });
    return { message: "Favorite removed" };
  }

  await prisma.favorite.create({
    data: { userId, recipeId },
  });

  return { message: "Recipe favorited" };
};

const getPopularRecipes = async () => {
  return prisma.recipe.findMany({
    include: {
      _count: { select: { favorites: true } },
      user: { select: { name: true } },
    },
    orderBy: {
      favorites: { _count: "desc" },
    },
    take: 10,
  });
};

module.exports = {
  createRecipe,
  getRecipes,
  getRecipeDetail,
  updateRecipe,
  deleteRecipe,
  toggleFavorite,
  getPopularRecipes,
};
