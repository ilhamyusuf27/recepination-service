const prisma = require("../lib/prisma");

const attachCategory = async (recipeId, categoryId) => {
  return prisma.recipeCategory.create({
    data: { recipeId, categoryId },
  });
};

const detachCategory = async (recipeId, categoryId) => {
  return prisma.recipeCategory.delete({
    where: {
      recipeId_categoryId: {
        recipeId,
        categoryId,
      },
    },
  });
};

const bulkAttachCategories = async (recipeId, categoryIds) => {
  return prisma.recipeCategory.createMany({
    data: categoryIds.map((id) => ({
      recipeId,
      categoryId: id,
    })),
    skipDuplicates: true,
  });
};

const replaceCategories = async (recipeId, categoryIds) => {
  return prisma.$transaction(async (tx) => {
    await tx.recipeCategory.deleteMany({
      where: { recipeId },
    });

    if (categoryIds?.length) {
      await tx.recipeCategory.createMany({
        data: categoryIds.map((id) => ({
          recipeId,
          categoryId: id,
        })),
      });
    }

    return true;
  });
};

const getCategoriesByRecipe = async (recipeId) => {
  const result = await prisma.recipeCategory.findMany({
    where: { recipeId },
    include: {
      category: {
        include: {
          _count: {
            select: { recipes: true },
          },
        },
      },
    },
  });

  return result.map((r) => r.category);
};

const getRecipesByCategory = async (
  categoryId,
  { page = 1, limit = 10 }
) => {
  const skip = (page - 1) * limit;

  const [data, total] = await Promise.all([
    prisma.recipeCategory.findMany({
      where: { categoryId },
      skip: Number(skip),
      take: Number(limit),
      include: {
        recipe: {
          include: {
            user: { select: { name: true } },
            _count: {
              select: { favorites: true, comments: true },
            },
          },
        },
      },
      orderBy: {
        recipe: { created_at: "desc" },
      },
    }),
    prisma.recipeCategory.count({
      where: { categoryId },
    }),
  ]);

  return {
    data: data.map((r) => r.recipe),
    meta: {
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    },
  };
};

const countRecipes = async (categoryId) => {
  return prisma.recipeCategory.count({
    where: { categoryId },
  });
};

module.exports = {
  attachCategory,
  detachCategory,
  bulkAttachCategories,
  replaceCategories,
  getCategoriesByRecipe,
  getRecipesByCategory,
  countRecipes,
};
