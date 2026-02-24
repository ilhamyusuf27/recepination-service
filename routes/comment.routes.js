const router = require("express").Router();
const commentController = require("../controllers/comment.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.post("/", authenticate, commentController.createComment);
router.get("/recipe/:recipeId", commentController.getCommentsByRecipe);
router.delete("/:id", authenticate, commentController.deleteComment);

module.exports = router;
