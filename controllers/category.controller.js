const categoryService = require("../services/category.service");

exports.createCategory = async (req, res, next) => {
  try {
    const category = await categoryService.createCategory(req.body);

    res.status(201).json({
      success: true,
      message: "Category created",
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

exports.getCategories = async (req, res, next) => {
  try {
    const categories = await categoryService.getCategories();
    res.json({ success: true, data: categories });
  } catch (err) {
    next(err);
  }
};

exports.getCategoryDetail = async (req, res, next) => {
  try {
    const result = await categoryService.getCategoryDetail(
      req.params.id,
      req.query
    );

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

exports.updateCategory = async (req, res, next) => {
  try {
    const category = await categoryService.updateCategory(
      req.params.id,
      req.body
    );

    res.json({
      success: true,
      message: "Category updated",
      data: category,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    await categoryService.deleteCategory(req.params.id);

    res.json({
      success: true,
      message: "Category deleted",
    });
  } catch (err) {
    next(err);
  }
};

exports.attachRecipe = async (req, res, next) => {
  try {
    const { recipeId } = req.body;

    const result = await categoryService.attachRecipe(
      req.params.id,
      recipeId
    );

    res.json({ success: true, data: result });
  } catch (err) {
    next(err);
  }
};

exports.detachRecipe = async (req, res, next) => {
  try {
    const { recipeId } = req.body;

    await categoryService.detachRecipe(req.params.id, recipeId);

    res.json({
      success: true,
      message: "Recipe removed from category",
    });
  } catch (err) {
    next(err);
  }
};
