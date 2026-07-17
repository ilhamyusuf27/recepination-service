const favoriteService = require('../services/favorite.service')

exports.addFavorite = async (req, res) => {
  const data = await favoriteService.addFavorite(req.user.user_id, req.body.recipeId)
  res.status(201).json({ success: true, message: 'Recipe favorited', data })
}

exports.removeFavorite = async (req, res) => {
  await favoriteService.removeFavorite(req.user.user_id, req.body.recipeId)
  res.status(204).send()
}

exports.toggleFavorite = async (req, res) => {
  const data = await favoriteService.toggleFavorite(req.user.user_id, req.body.recipeId)
  res.json({ success: true, data })
}

exports.getMyFavorites = async (req, res) => {
  const result = await favoriteService.getFavoritesByUser(req.user.user_id, req.query)
  res.json({ success: true, ...result })
}

exports.isFavorited = async (req, res) => {
  const isFavorited = await favoriteService.isFavorited(req.user.user_id, req.query.recipeId)
  res.json({ success: true, data: { isFavorited } })
}
