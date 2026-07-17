const router = require('express').Router()
const recipeController = require('../controllers/recipe.controller')
const validate = require('../middleware/validate.middleware')
const { authenticate } = require('../middleware/auth.middleware')
const upload = require('../middleware/multer.middleware')
const asyncHandler = require('../utils/asyncHandler')
const { idParamSchema } = require('../validators/common.validator')
const { createRecipeSchema, updateRecipeSchema, recipeQuerySchema } = require('../validators/recipe.validator')

router.get('/', validate(recipeQuerySchema, 'query'), asyncHandler(recipeController.getRecipes))
router.get('/popular', validate(recipeQuerySchema, 'query'), asyncHandler(recipeController.getPopularRecipes))
router.get('/mine', asyncHandler(authenticate), validate(recipeQuerySchema, 'query'), asyncHandler(recipeController.getMyRecipes))
router.get('/:id', validate(idParamSchema, 'params'), asyncHandler(recipeController.getRecipeDetail))
router.post('/', asyncHandler(authenticate), upload.single('image'), validate(createRecipeSchema), asyncHandler(recipeController.createRecipe))
router.patch('/:id', asyncHandler(authenticate), validate(idParamSchema, 'params'), upload.single('image'), validate(updateRecipeSchema), asyncHandler(recipeController.updateRecipe))
router.delete('/:id', asyncHandler(authenticate), validate(idParamSchema, 'params'), asyncHandler(recipeController.deleteRecipe))

module.exports = router
