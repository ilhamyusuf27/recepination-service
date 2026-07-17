const router = require('express').Router()
const controller = require('../controllers/favorite.controller')
const { authenticate } = require('../middleware/auth.middleware')
const validate = require('../middleware/validate.middleware')
const asyncHandler = require('../utils/asyncHandler')
const { paginationSchema } = require('../validators/common.validator')
const { favoriteSchema, favoriteQuerySchema } = require('../validators/favorite.validator')

router.use(asyncHandler(authenticate))
router.get('/me', validate(paginationSchema, 'query'), asyncHandler(controller.getMyFavorites))
router.get('/check', validate(favoriteQuerySchema, 'query'), asyncHandler(controller.isFavorited))
router.post('/', validate(favoriteSchema), asyncHandler(controller.addFavorite))
router.post('/toggle', validate(favoriteSchema), asyncHandler(controller.toggleFavorite))
router.delete('/', validate(favoriteSchema), asyncHandler(controller.removeFavorite))

module.exports = router
