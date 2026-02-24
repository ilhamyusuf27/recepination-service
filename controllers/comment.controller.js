const commentService = require("../services/comment.service");

exports.createComment = async (req, res, next) => {
  try {
    const comment = await commentService.createComment(req.body);

    res.status(201).json({
      success: true,
      message: "Comment created",
      data: comment,
    });
  } catch (err) {
    next(err);
  }
};

exports.getCommentsByRecipe = async (req, res, next) => {
  try {
    const result = await commentService.getCommentsByRecipe(
      req.params.recipeId,
      req.query
    );

    res.json({ success: true, ...result });
  } catch (err) {
    next(err);
  }
};

exports.deleteComment = async (req, res, next) => {
  try {
    const { userId } = req.body;

    await commentService.deleteComment(
      req.params.id,
      userId
    );

    res.json({
      success: true,
      message: "Comment deleted",
    });
  } catch (err) {
    next(err);
  }
};

exports.countComments = async (req, res, next) => {
  try {
    const total = await commentService.countComments(
      req.params.recipeId
    );

    res.json({
      success: true,
      total,
    });
  } catch (err) {
    next(err);
  }
};
