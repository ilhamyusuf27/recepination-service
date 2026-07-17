const prisma = require('../lib/prisma')
const AppError = require('../utils/AppError')
const { parsePagination } = require('../utils/pagination')

const createComment = async (data, userId) => {
  if (data.parentId) {
    const parent = await prisma.comment.findUnique({ where: { comment_id: data.parentId } })
    if (!parent || parent.recipeId !== data.recipeId || parent.parentId) {
      throw new AppError('Invalid parent comment', 400)
    }
  }

  return prisma.comment.create({
    data: { ...data, userId },
    include: { user: { select: { user_id: true, name: true, photo_profile: true } } }
  })
}

const getCommentsByRecipe = async (recipeId, query) => {
  const { page, limit, skip } = parsePagination(query)
  const where = { recipeId, parentId: null }
  const [data, total] = await Promise.all([
    prisma.comment.findMany({
      where,
      skip,
      take: limit,
      include: {
        user: { select: { user_id: true, name: true, photo_profile: true } },
        replies: {
          include: { user: { select: { user_id: true, name: true, photo_profile: true } } },
          orderBy: { created_at: 'asc' }
        }
      },
      orderBy: { created_at: 'desc' }
    }),
    prisma.comment.count({ where })
  ])
  return { data, meta: { total, page, limit, totalPages: Math.ceil(total / limit) } }
}

const assertCommentOwner = async (commentId, actor) => {
  const comment = await prisma.comment.findUnique({ where: { comment_id: commentId } })
  if (!comment) throw new AppError('Comment not found', 404)
  if (actor.role !== 'ADMIN' && comment.userId !== actor.user_id) throw new AppError('Forbidden', 403)
  return comment
}

const updateComment = async (commentId, data, actor) => {
  await assertCommentOwner(commentId, actor)
  return prisma.comment.update({ where: { comment_id: commentId }, data })
}

const deleteComment = async (commentId, actor) => {
  await assertCommentOwner(commentId, actor)
  return prisma.comment.delete({ where: { comment_id: commentId } })
}

module.exports = { createComment, getCommentsByRecipe, updateComment, deleteComment }
