const prisma = require('../lib/prisma')
const { parsePagination } = require('../utils/pagination')

const addFavorite = (userId, recipeId) => prisma.favorite.upsert({
  where: { userId_recipeId: { userId, recipeId } },
  update: {},
  create: { userId, recipeId }
})

const removeFavorite = (userId, recipeId) => prisma.favorite.deleteMany({ where: { userId, recipeId } })

const toggleFavorite = async (userId, recipeId) => prisma.$transaction(async (tx) => {
  const existing = await tx.favorite.findUnique({ where: { userId_recipeId: { userId, recipeId } } })
  if (existing) {
    await tx.favorite.delete({ where: { id: existing.id } })
    return { status: 'removed' }
  }
  await tx.favorite.create({ data: { userId, recipeId } })
  return { status: 'added' }
})

const getFavoritesByUser = async (userId, query) => {
  const { page, limit, skip } = parsePagination(query)
  const [favorites, total] = await Promise.all([
    prisma.favorite.findMany({
      where: { userId },
      skip,
      take: limit,
      include: {
        recipe: {
          include: {
            user: { select: { user_id: true, name: true, photo_profile: true } },
            _count: { select: { favorites: true, comments: true } }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    }),
    prisma.favorite.count({ where: { userId } })
  ])
  return {
    data: favorites.map((favorite) => favorite.recipe),
    meta: { total, page, limit, totalPages: Math.ceil(total / limit) }
  }
}

const isFavorited = async (userId, recipeId) => Boolean(await prisma.favorite.findUnique({
  where: { userId_recipeId: { userId, recipeId } }
}))

module.exports = { addFavorite, removeFavorite, toggleFavorite, getFavoritesByUser, isFavorited }
