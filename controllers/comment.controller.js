const commentService = require('../services/comment.service')

exports.createComment = async (req, res) => {
  const comment = await commentService.createComment(req.body, req.user.user_id)
  res.status(201).json({ success: true, message: 'Comment created', data: comment })
}

exports.getCommentsByRecipe = async (req, res) => {
  const result = await commentService.getCommentsByRecipe(req.params.recipeId, req.query)
  res.json({ success: true, ...result })
}

exports.updateComment = async (req, res) => {
  const comment = await commentService.updateComment(req.params.id, req.body, req.user)
  res.json({ success: true, message: 'Comment updated', data: comment })
}

exports.deleteComment = async (req, res) => {
  await commentService.deleteComment(req.params.id, req.user)
  res.status(204).send()
}
