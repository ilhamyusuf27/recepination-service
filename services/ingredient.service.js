const prisma = require("../lib/prisma");

const addIngredient = async (data) => {
  return prisma.ingredient.create({
    data,
  });
};

const addManyIngredients = async (recipeId, ingredients) => {
  return prisma.ingredient.createMany({
    data: ingredients.map((item, index) => ({
      recipeId,
      name: item.name,
      quantity: item.quantity,
      position: index + 1,
    })),
  });
};

const getIngredientsByRecipe = async (recipeId) => {
  return prisma.ingredient.findMany({
    where: { recipeId },
    orderBy: { position: "asc" },
  });
};

const updateIngredient = async (id, data) => {
  return prisma.ingredient.update({
    where: { id },
    data,
  });
};

const deleteIngredient = async (id) => {
  return prisma.ingredient.delete({
    where: { id },
  });
};

const replaceIngredients = async (recipeId, ingredients) => {
  return prisma.$transaction(async (tx) => {
    await tx.ingredient.deleteMany({
      where: { recipeId },
    });

    if (ingredients?.length) {
      await tx.ingredient.createMany({
        data: ingredients.map((item, index) => ({
          recipeId,
          name: item.name,
          quantity: item.quantity,
          position: index + 1,
        })),
      });
    }

    return true;
  });
};

const reorderIngredients = async (recipeId, orderedIds) => {
  return prisma.$transaction(
    orderedIds.map((id, index) =>
      prisma.ingredient.update({
        where: { id },
        data: { position: index + 1 },
      })
    )
  );
};

const searchIngredient = async (keyword) => {
  return prisma.ingredient.findMany({
    where: {
      name: {
        contains: keyword,
        mode: "insensitive",
      },
    },
    include: {
      recipe: {
        select: {
          recipe_id: true,
          title: true,
        },
      },
    },
  });
};

const countIngredients = async (recipeId) => {
  return prisma.ingredient.count({
    where: { recipeId },
  });
};

module.exports = {
  addIngredient,
  addManyIngredients,
  getIngredientsByRecipe,
  updateIngredient,
  deleteIngredient,
  replaceIngredients,
  reorderIngredients,
  searchIngredient,
  countIngredients,
};
