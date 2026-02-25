const recipeService = require("../services/recipe.service");
const { getUserIdFromToken } = require("../utils/jwt");
const uploadToSupabase = require("../utils/uploadToSupabase");

exports.createRecipe = async (req, res, next) => {
  try {
    const userId = getUserIdFromToken(req);

    let image_url = null;

    if (req.file) {
      image_url = await uploadToSupabase(req.file, 'recepination-storage', 'recipes');
    }

    const recipeData = {
      ...req.body,
      user_id: userId,
      image_url,
    };
    const recipe = await recipeService.createRecipe(recipeData);
    res.status(201).json({
      success: true,
      message: "Recipe created successfully",
      data: recipe,
    });
  } catch (err) {
    next(err);
  }
};

exports.getRecipes = async (req, res, next) => {
  try {
    const result = await recipeService.getRecipes(req.query);
    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

exports.getRecipeDetail = async (req, res, next) => {
  try {
    const recipe = await recipeService.getRecipeDetail(req.params.id);

    if (!recipe) {
      return res.status(404).json({
        success: false,
        message: "Recipe not found",
      });
    }

    res.json({ success: true, data: recipe });
  } catch (err) {
    next(err);
  }
};

exports.updateRecipe = async (req, res, next) => {
  try {
    const recipe = await recipeService.updateRecipe(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      message: "Recipe updated successfully",
      data: recipe,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteRecipe = async (req, res, next) => {
  try {
    await recipeService.deleteRecipe(req.params.id);

    res.json({
      success: true,
      message: "Recipe deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};

exports.toggleFavorite = async (req, res, next) => {
  try {
    const { userId, recipeId } = req.body;
    const result = await recipeService.toggleFavorite(userId, recipeId);

    res.json({
      success: true,
      message: result.message,
    });
  } catch (err) {
    next(err);
  }
};

exports.getPopularRecipes = async (req, res, next) => {
  try {
    const recipes = await recipeService.getPopularRecipes();
    res.json({ success: true, data: recipes });
  } catch (err) {
    next(err);
  }
};
