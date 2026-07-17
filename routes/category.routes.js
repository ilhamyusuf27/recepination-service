const router = require('express').Router()
const categoryController = require('../controllers/category.controller')
const { authenticate, authorize } = require('../middleware/auth.middleware')
const validate = require('../middleware/validate.middleware')
const asyncHandler = require('../utils/asyncHandler')
const { idParamSchema } = require('../validators/common.validator')
const { categorySchema, categoryDetailQuerySchema } = require('../validators/category.validator')

router.get('/', asyncHandler(categoryController.getCategories))
router.get('/:id', validate(idParamSchema, 'params'), validate(categoryDetailQuerySchema, 'query'), asyncHandler(categoryController.getCategoryDetail))
router.use(asyncHandler(authenticate), authorize('ADMIN'))
router.post('/', validate(categorySchema), asyncHandler(categoryController.createCategory))
router.patch('/:id', validate(idParamSchema, 'params'), validate(categorySchema), asyncHandler(categoryController.updateCategory))
router.delete('/:id', validate(idParamSchema, 'params'), asyncHandler(categoryController.deleteCategory))

module.exports = router
