const router = require('express').Router()
const userController = require('../controllers/user.controller')
const { authenticate, authorize } = require('../middleware/auth.middleware')
const validate = require('../middleware/validate.middleware')
const asyncHandler = require('../utils/asyncHandler')
const upload = require('../middleware/multer.middleware')
const { idParamSchema, paginationSchema } = require('../validators/common.validator')
const { updateUserSchema } = require('../validators/user.validator')

router.use(asyncHandler(authenticate))
router.get('/me', asyncHandler(userController.getMe))
router.patch('/me', upload.single('image'), validate(updateUserSchema), asyncHandler(userController.updateMe))
router.delete('/me', asyncHandler(userController.deleteMe))
router.get('/', authorize('ADMIN'), validate(paginationSchema, 'query'), asyncHandler(userController.getUsers))
router.get('/:id', validate(idParamSchema, 'params'), asyncHandler(userController.getUser))
router.patch('/:id', authorize('ADMIN'), validate(idParamSchema, 'params'), upload.single('image'), validate(updateUserSchema), asyncHandler(userController.updateUser))
router.delete('/:id', authorize('ADMIN'), validate(idParamSchema, 'params'), asyncHandler(userController.deleteUser))

module.exports = router
