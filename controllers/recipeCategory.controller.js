const recipeCategoryService = require("../services/recipeCategory.service");

exports.attachCategory = async (req, res, next) => {
  try {
    const { recipeId, categoryId } = req.body;

    const result = await recipeCategoryService.attachCategory(
      recipeId,
      categoryId
    );

    res.status(201).json({
      success: true,
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

exports.detachCategory = async (req, res, next) => {
  try {
    const { recipeId, categoryId } = req.body;

    await recipeCategoryService.detachCategory(
      recipeId,
      categoryId
    );

    res.json({
      success: true,
      message: "Category removed from recipe",
    });
  } catch (err) {
    next(err);
  }
};

exports.bulkAttach = async (req, res, next) => {
  try {
    const { recipeId, categoryIds } = req.body;

    await recipeCategoryService.bulkAttachCategories(
      recipeId,
      categoryIds
    );

    res.json({
      success: true,
      message: "Categories attached",
    });
  } catch (err) {
    next(err);
  }
};

exports.replaceCategories = async (req, res, next) => {
  try {
    const { recipeId, categoryIds } = req.body;

    await recipeCategoryService.replaceCategories(
      recipeId,
      categoryIds
    );

    res.json({
      success: true,
      message: "Categories replaced",
    });
  } catch (err) {
    next(err);
  }
};

exports.getCategoriesByRecipe = async (req, res, next) => {
  try {
    const categories =
      await recipeCategoryService.getCategoriesByRecipe(
        req.params.recipeId
      );

    res.json({
      success: true,
      data: categories,
    });
  } catch (err) {
    next(err);
  }
};

exports.getRecipesByCategory = async (req, res, next) => {
  try {
    const result =
      await recipeCategoryService.getRecipesByCategory(
        req.params.categoryId,
        req.query
      );

    res.json({
      success: true,
      ...result,
    });
  } catch (err) {
    next(err);
  }
};
