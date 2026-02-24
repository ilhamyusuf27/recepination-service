const favoriteService = require("../services/favorite.service");

exports.addFavorite = async (req, res, next) => {
  try {
    const { userId, recipeId } = req.body;

    const result = await favoriteService.addFavorite(
      userId,
      recipeId
    );

    res.status(201).json({
      success: true,
      message: "Recipe favorited",
      data: result,
    });
  } catch (err) {
    next(err);
  }
};

exports.removeFavorite = async (req, res, next) => {
  try {
    const { userId, recipeId } = req.body;

    await favoriteService.removeFavorite(userId, recipeId);

    res.json({
      success: true,
      message: "Favorite removed",
    });
  } catch (err) {
    next(err);
  }
};

exports.toggleFavorite = async (req, res, next) => {
  try {
    const { userId, recipeId } = req.body;

    const result = await favoriteService.toggleFavorite(
      userId,
      recipeId
    );

    res.json({
      success: true,
      status: result.status,
    });
  } catch (err) {
    next(err);
  }
};

exports.getFavoritesByUser = async (req, res, next) => {
  try {
    const result = await favoriteService.getFavoritesByUser(
      req.params.userId,
      req.query
    );

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

exports.isFavorited = async (req, res, next) => {
  try {
    const { userId, recipeId } = req.query;

    const isFav = await favoriteService.isFavorited(
      userId,
      recipeId
    );

    res.json({
      success: true,
      isFavorited: isFav,
    });
  } catch (err) {
    next(err);
  }
};
