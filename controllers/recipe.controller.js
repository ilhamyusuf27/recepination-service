const recipeService = require('../services/recipe.service')
const { uploadToSupabase, deleteFromSupabase } = require('../utils/uploadToSupabase')
const AppError = require('../utils/AppError')

const bucket = 'recepination-storage'

exports.createRecipe = async (req, res) => {
  let uploaded
  try {
    if (req.file) uploaded = await uploadToSupabase(req.file, bucket, 'recipes')
    const recipe = await recipeService.createRecipe({
      ...req.body,
      image_url: uploaded?.url,
      image_path: uploaded?.path
    }, req.user.user_id)
    res.status(201).json({ success: true, message: 'Recipe created successfully', data: recipe })
  } catch (error) {
    if (uploaded?.path) await deleteFromSupabase(bucket, uploaded.path)
    throw error
  }
}

exports.getRecipes = async (req, res) => {
  const result = await recipeService.getRecipes(req.query)
  res.json({ success: true, ...result })
}

exports.getMyRecipes = async (req, res) => {
  const result = await recipeService.getRecipes(req.query, req.user.user_id)
  res.json({ success: true, ...result })
}

exports.getPopularRecipes = async (req, res) => {
  const result = await recipeService.getRecipes({ ...req.query, sort: 'popular' })
  res.json({ success: true, ...result })
}

exports.getRecipeDetail = async (req, res) => {
  const recipe = await recipeService.getRecipeDetail(req.params.id)
  if (!recipe) throw new AppError('Recipe not found', 404)
  res.json({ success: true, data: recipe })
}

exports.updateRecipe = async (req, res) => {
  if (!req.file && Object.keys(req.body).length === 0) throw new AppError('At least one field or image is required', 400)

  let uploaded
  try {
    if (req.file) uploaded = await uploadToSupabase(req.file, bucket, 'recipes')
    const result = await recipeService.updateRecipe(req.params.id, {
      ...req.body,
      ...(uploaded && { image_url: uploaded.url, image_path: uploaded.path })
    }, req.user)
    if (uploaded && result.previousImagePath) await deleteFromSupabase(bucket, result.previousImagePath)
    res.json({ success: true, message: 'Recipe updated successfully', data: result.recipe })
  } catch (error) {
    if (uploaded?.path) await deleteFromSupabase(bucket, uploaded.path)
    throw error
  }
}

exports.deleteRecipe = async (req, res) => {
  const deleted = await recipeService.deleteRecipe(req.params.id, req.user)
  if (deleted.image_path) await deleteFromSupabase(bucket, deleted.image_path)
  res.status(204).send()
}
