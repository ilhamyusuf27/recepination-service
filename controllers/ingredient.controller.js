const ingredientService = require("../services/ingredient.service");

exports.addIngredient = async (req, res, next) => {
  try {
    const ingredient = await ingredientService.addIngredient(req.body);

    res.status(201).json({
      success: true,
      data: ingredient,
    });
  } catch (err) {
    next(err);
  }
};

exports.addManyIngredients = async (req, res, next) => {
  try {
    const { recipeId, ingredients } = req.body;

    await ingredientService.addManyIngredients(recipeId, ingredients);

    res.json({
      success: true,
      message: "Ingredients added",
    });
  } catch (err) {
    next(err);
  }
};

exports.getIngredientsByRecipe = async (req, res, next) => {
  try {
    const ingredients =
      await ingredientService.getIngredientsByRecipe(req.params.recipeId);

    res.json({
      success: true,
      data: ingredients,
    });
  } catch (err) {
    next(err);
  }
};

exports.updateIngredient = async (req, res, next) => {
  try {
    const ingredient = await ingredientService.updateIngredient(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      data: ingredient,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteIngredient = async (req, res, next) => {
  try {
    await ingredientService.deleteIngredient(req.params.id);

    res.json({
      success: true,
      message: "Ingredient deleted",
    });
  } catch (err) {
    next(err);
  }
};

exports.replaceIngredients = async (req, res, next) => {
  try {
    const { recipeId, ingredients } = req.body;

    await ingredientService.replaceIngredients(recipeId, ingredients);

    res.json({
      success: true,
      message: "Ingredients replaced",
    });
  } catch (err) {
    next(err);
  }
};

exports.searchIngredient = async (req, res, next) => {
  try {
    const result = await ingredientService.searchIngredient(
      req.query.q
    );

    res.json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};
