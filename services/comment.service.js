const prisma = require("../lib/prisma");
const AppError = require("../utils/AppError");

const createComment = async (data) => {
  const { content, userId, recipeId, parentId } = data;

  return prisma.comment.create({
    data: {
      content,
      userId,
      recipeId,
      parentId: parentId || null,
    },
  });
};

const getCommentsByRecipe = async (
  recipeId,
  { page = 1, limit = 10 }
) => {
  const skip = (page - 1) * limit;

  const comments = await prisma.comment.findMany({
    where: {
      recipeId,
      parentId: null,
    },
    skip: Number(skip),
    take: Number(limit),
    include: {
      user: { select: { name: true } },
      replies: {
        include: {
          user: { select: { name: true } },
        },
        orderBy: { created_at: "asc" },
      },
    },
    orderBy: { created_at: "desc" },
  });

  const total = await prisma.comment.count({
    where: { recipeId, parentId: null },
  });

  return {
    data: comments,
    meta: {
      total,
      page: Number(page),
      totalPages: Math.ceil(total / limit),
    },
  };
};

const deleteComment = async (commentId, userId) => {
  const comment = await prisma.comment.findUnique({
    where: { comment_id: commentId },
  });

  if (!comment) {
    const error = new AppError("Comment not found");
    error.status = 404;
    throw error;
  }

  // Ownership check (optional)
  if (comment.userId !== userId) {
    const error = new AppError("Unauthorized to delete this comment");
    error.status = 403;
    throw error;
  }

  return prisma.comment.delete({
    where: { comment_id: commentId },
  });
};

const countComments = async (recipeId) => {
  return prisma.comment.count({
    where: { recipeId },
  });
};

module.exports = {
  createComment,
  getCommentsByRecipe,
  deleteComment,
  countComments,
};
