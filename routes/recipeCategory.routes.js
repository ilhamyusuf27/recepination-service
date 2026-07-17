const router = require('express').Router()
const controller = require('../controllers/recipeCategory.controller')
const { authenticate } = require('../middleware/auth.middleware')
const validate = require('../middleware/validate.middleware')
const asyncHandler = require('../utils/asyncHandler')
const {
  recipeCategorySchema,
  bulkRecipeCategorySchema,
  recipeIdParamSchema,
  categoryIdParamSchema
} = require('../validators/category.validator')
const { paginationSchema } = require('../validators/common.validator')

router.get('/recipe/:recipeId', validate(recipeIdParamSchema, 'params'), asyncHandler(controller.getCategoriesByRecipe))
router.get('/category/:categoryId', validate(categoryIdParamSchema, 'params'), validate(paginationSchema, 'query'), asyncHandler(controller.getRecipesByCategory))
router.use(asyncHandler(authenticate))
router.post('/attach', validate(recipeCategorySchema), asyncHandler(controller.attachCategory))
router.post('/bulk', validate(bulkRecipeCategorySchema), asyncHandler(controller.bulkAttach))
router.put('/replace', validate(bulkRecipeCategorySchema), asyncHandler(controller.replaceCategories))
router.delete('/detach', validate(recipeCategorySchema), asyncHandler(controller.detachCategory))

module.exports = router
