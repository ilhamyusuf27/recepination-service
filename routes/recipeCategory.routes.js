const router = require("express").Router();
const recipeCategoryController = require("../controllers/recipeCategory.controller");
const { authenticate } = require("../middleware/auth.middleware");

router.post("/attach", authenticate, recipeCategoryController.attachCategory);
router.post("/bulk", authenticate, recipeCategoryController.bulkAttach);
router.put("/replace", authenticate, recipeCategoryController.replaceCategories);
router.delete("/detach", authenticate, recipeCategoryController.detachCategory);

router.get("/recipe/:recipeId", recipeCategoryController.getCategoriesByRecipe);
router.get("/category/:categoryId", recipeCategoryController.getRecipesByCategory);

module.exports = router;
