const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

const addFavorite = async (userId, recipeId) => {
  return prisma.favorite.create({
    data: { userId, recipeId },
  });
};

const removeFavorite = async (userId, recipeId) => {
  return prisma.favorite.delete({
    where: {
      userId_recipeId: {
        userId,
        recipeId,
      },
    },
  });
};

const toggleFavorite = async (userId, recipeId) => {
  const existing = await prisma.favorite.findUnique({
    where: {
      userId_recipeId: {
        userId,
        recipeId,
      },
    },
  });

  if (existing) {
    await prisma.favorite.delete({
      where: { id: existing.id },
    });
    return { status: "removed" };
  }

  await prisma.favorite.create({
    data: { userId, recipeId },
  });

  return { status: "added" };
};

const getFavoritesByUser = async (
  userId,
  { page = 1, limit = 10 }
) => {
  const skip = (page - 1) * limit;

  const [favorites, total] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId },
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
      orderBy: { createdAt: "desc" },
    }),
    prisma.favorite.count({
      where: { userId },
    }),
  ]);

  return {
    data: favorites.map((f) => f.recipe),
    meta: {
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    },
  };
};

const isFavorited = async (userId, recipeId) => {
  const favorite = await prisma.favorite.findUnique({
    where: {
      userId_recipeId: {
        userId,
        recipeId,
      },
    },
  });

  return !!favorite;
};

const countFavorites = async (recipeId) => {
  return prisma.favorite.count({
    where: { recipeId },
  });
};

module.exports = {
  addFavorite,
  removeFavorite,
  toggleFavorite,
  getFavoritesByUser,
  isFavorited,
  countFavorites,
};
