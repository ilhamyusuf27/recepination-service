const router = require('express').Router()
const ingredientController = require('../controllers/ingredient.controller')
const { authenticate } = require('../middleware/auth.middleware')
const validate = require('../middleware/validate.middleware')
const asyncHandler = require('../utils/asyncHandler')
const { idParamSchema } = require('../validators/common.validator')
const {
  createIngredientSchema,
  updateIngredientSchema,
  ingredientListSchema,
  recipeIdParamSchema
} = require('../validators/ingredient.validator')

router.get('/recipe/:recipeId', validate(recipeIdParamSchema, 'params'), asyncHandler(ingredientController.getIngredientsByRecipe))
router.use(asyncHandler(authenticate))
router.post('/', validate(createIngredientSchema), asyncHandler(ingredientController.addIngredient))
router.put('/replace', validate(ingredientListSchema), asyncHandler(ingredientController.replaceIngredients))
router.patch('/:id', validate(idParamSchema, 'params'), validate(updateIngredientSchema), asyncHandler(ingredientController.updateIngredient))
router.delete('/:id', validate(idParamSchema, 'params'), asyncHandler(ingredientController.deleteIngredient))

module.exports = router
