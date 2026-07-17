const ingredientService = require('../services/ingredient.service')

exports.addIngredient = async (req, res) => {
  const ingredient = await ingredientService.addIngredient(req.body, req.user)
  res.status(201).json({ success: true, data: ingredient })
}

exports.replaceIngredients = async (req, res) => {
  const data = await ingredientService.replaceIngredients(req.body.recipeId, req.body.ingredients, req.user)
  res.json({ success: true, message: 'Ingredients replaced', data })
}

exports.getIngredientsByRecipe = async (req, res) => {
  const data = await ingredientService.getIngredientsByRecipe(req.params.recipeId)
  res.json({ success: true, data })
}

exports.updateIngredient = async (req, res) => {
  const data = await ingredientService.updateIngredient(req.params.id, req.body, req.user)
  res.json({ success: true, data })
}

exports.deleteIngredient = async (req, res) => {
  await ingredientService.deleteIngredient(req.params.id, req.user)
  res.status(204).send()
}
