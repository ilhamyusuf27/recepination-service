const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

const createCategory = async (data) => {
  const existing = await prisma.category.findUnique({
    where: { name: data.name },
  });

  if (existing) {
    const error = new AppError("Category already exists");
    error.status = 409;
    throw error;
  }

  return prisma.category.create({
    data: { name: data.name },
  });
};

const getCategories = async () => {
  return prisma.category.findMany({
    include: {
      _count: {
        select: { recipes: true },
      },
    },
    orderBy: { created_at: "desc" },
  });
};

const getCategoryDetail = async (
  categoryId,
  { page = 1, limit = 10, search }
) => {
  const skip = (page - 1) * limit;

  const category = await prisma.category.findUnique({
    where: { category_id: categoryId },
  });

  if (!category) {
    const error = new AppError("Category not found");
    error.status = 404;
    throw error;
  }

  const recipes = await prisma.recipeCategory.findMany({
    where: {
      categoryId,
      ...(search && {
        recipe: {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
      }),
    },
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
  });

  const total = await prisma.recipeCategory.count({
    where: { categoryId },
  });

  return {
    category,
    recipes: recipes.map((r) => r.recipe),
    meta: {
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    },
  };
};

const updateCategory = async (categoryId, data) => {
  return prisma.category.update({
    where: { category_id: categoryId },
    data: { name: data.name },
  });
};

const deleteCategory = async (categoryId) => {
  const used = await prisma.recipeCategory.count({
    where: { categoryId },
  });

  if (used > 0) {
    const error = new AppError(
      "Cannot delete category because it is used by recipes"
    );
    error.status = 400;
    throw error;
  }

  return prisma.category.delete({
    where: { category_id: categoryId },
  });
};

const attachRecipe = async (categoryId, recipeId) => {
  return prisma.recipeCategory.create({
    data: { categoryId, recipeId },
  });
};

const detachRecipe = async (categoryId, recipeId) => {
  return prisma.recipeCategory.delete({
    where: {
      recipeId_categoryId: {
        recipeId,
        categoryId,
      },
    },
  });
};

const bulkAttachRecipes = async (categoryId, recipeIds) => {
  return prisma.recipeCategory.createMany({
    data: recipeIds.map((id) => ({
      categoryId,
      recipeId: id,
    })),
    skipDuplicates: true,
  });
};

module.exports = {
  createCategory,
  getCategories,
  getCategoryDetail,
  updateCategory,
  deleteCategory,
  attachRecipe,
  detachRecipe,
  bulkAttachRecipes,
};
