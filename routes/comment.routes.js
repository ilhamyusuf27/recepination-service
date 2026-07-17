const router = require('express').Router()
const controller = require('../controllers/comment.controller')
const { authenticate } = require('../middleware/auth.middleware')
const validate = require('../middleware/validate.middleware')
const asyncHandler = require('../utils/asyncHandler')
const { idParamSchema, paginationSchema } = require('../validators/common.validator')
const { createCommentSchema, updateCommentSchema, recipeIdParamSchema } = require('../validators/comment.validator')

router.get('/recipe/:recipeId', validate(recipeIdParamSchema, 'params'), validate(paginationSchema, 'query'), asyncHandler(controller.getCommentsByRecipe))
router.use(asyncHandler(authenticate))
router.post('/', validate(createCommentSchema), asyncHandler(controller.createComment))
router.patch('/:id', validate(idParamSchema, 'params'), validate(updateCommentSchema), asyncHandler(controller.updateComment))
router.delete('/:id', validate(idParamSchema, 'params'), asyncHandler(controller.deleteComment))

module.exports = router
