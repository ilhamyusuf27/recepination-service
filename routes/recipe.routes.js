const router = require("express").Router();
const recipeController = require("../controllers/recipe.controller");
const validate = require("../middleware/validate.middleware");
const { createRecipeSchema, updateRecipeSchema } = require("../validators/recipe.validator");
const { authenticate } = require("../middleware/auth.middleware");
const upload = require("../middleware/multer.middleware");

router.post(
  "/",
  authenticate,
  upload.single("image"),
  validate(createRecipeSchema),
  recipeController.createRecipe
);

router.get("/", recipeController.getRecipes);
router.get("/:id", recipeController.getRecipeDetail);

router.put("/:id", 
  authenticate, 
  upload.single("image"),
  validate(updateRecipeSchema), 
  recipeController.updateRecipe
);

router.delete("/:id", authenticate, recipeController.deleteRecipe);

module.exports = router;