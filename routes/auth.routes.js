const router = require('express').Router()
const authController = require('../controllers/auth.controller')
const validate = require('../middleware/validate.middleware')
const asyncHandler = require('../utils/asyncHandler')
const rateLimit = require('../middleware/rateLimit.middleware')
const {
  registerSchema,
  loginSchema,
  emailSchema,
  refreshTokenSchema,
  resetPasswordSchema
} = require('../validators/auth.validator')

const authLimit = rateLimit({ max: 10, windowMs: 15 * 60 * 1000 })

router.post('/register', authLimit, validate(registerSchema), asyncHandler(authController.register))
router.post('/login', authLimit, validate(loginSchema), asyncHandler(authController.login))
router.get('/verify-email', authLimit, asyncHandler(authController.verifyEmail))
router.post('/resend-verification', authLimit, validate(emailSchema), asyncHandler(authController.resendVerification))
router.post('/refresh-token', authLimit, validate(refreshTokenSchema), asyncHandler(authController.refreshToken))
router.post('/logout', validate(refreshTokenSchema), asyncHandler(authController.logout))
router.post('/forgot-password', authLimit, validate(emailSchema), asyncHandler(authController.forgotPassword))
router.post('/reset-password', authLimit, validate(resetPasswordSchema), asyncHandler(authController.resetPassword))

module.exports = router
