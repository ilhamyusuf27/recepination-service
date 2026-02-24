const router = require("express").Router();
const ingredientController = require("../controllers/ingredient.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.post("/", authenticate, ingredientController.addIngredient);
router.post("/bulk", authenticate, ingredientController.addManyIngredients);
router.get("/recipe/:recipeId", ingredientController.getIngredientsByRecipe);
router.put("/:id", authenticate, ingredientController.updateIngredient);
router.delete("/:id", authenticate, ingredientController.deleteIngredient);

module.exports = router;
