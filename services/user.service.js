const prisma = require('../lib/prisma')
const { publicUserSelect } = require('./auth.service')
const AppError = require('../utils/AppError')
const { parsePagination } = require('../utils/pagination')

const getUserById = async (userId) => prisma.user.findUnique({
  where: { user_id: userId },
  select: publicUserSelect
})

const getUsers = async (query) => {
  const { page, limit, skip } = parsePagination(query)
  const [data, total] = await Promise.all([
    prisma.user.findMany({
      skip,
      take: limit,
      orderBy: { created_at: 'desc' },
      select: publicUserSelect
    }),
    prisma.user.count()
  ])
  return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
}

const updateUser = async (userId, data) => {
  const existing = await prisma.user.findUnique({ where: { user_id: userId } })
  if (!existing) throw new AppError('User not found', 404)

  return prisma.user.update({
    where: { user_id: userId },
    data,
    select: publicUserSelect
  })
}

const getUserStorage = (userId) => prisma.user.findUnique({
  where: { user_id: userId },
  select: { user_id: true, photo_path: true }
})

const deleteUser = async (userId) => {
  const deleted = await prisma.user.deleteMany({ where: { user_id: userId } })
  if (!deleted.count) throw new AppError('User not found', 404)
}

module.exports = { getUserById, getUserStorage, getUsers, updateUser, deleteUser }
