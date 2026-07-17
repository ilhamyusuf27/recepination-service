const authService = require('../services/auth.service')

exports.login = async (req, res) => {
  const result = await authService.login(req.body)
  res.json({ success: true, message: 'Login successful', data: result })
}

exports.register = async (req, res) => {
  const user = await authService.register(req.body)
  res.status(201).json({
    success: true,
    message: user.is_verified
      ? 'Account created successfully'
      : 'Account created successfully. Please check your email for verification.',
    data: user
  })
}

exports.verifyEmail = async (req, res) => {
  const user = await authService.verifyEmail(req.query.token)
  res.json({ success: true, message: 'Email successfully verified', data: user })
}

exports.resendVerification = async (req, res) => {
  await authService.resendVerification(req.body.email)
  res.json({ success: true, message: 'If the account requires verification, an email has been sent.' })
}

exports.refreshToken = async (req, res) => {
  const session = await authService.refreshSession(req.body.refreshToken)
  res.json({ success: true, data: session })
}

exports.logout = async (req, res) => {
  await authService.logout(req.body.refreshToken)
  res.status(204).send()
}

exports.forgotPassword = async (req, res) => {
  await authService.forgotPassword(req.body.email)
  res.json({ success: true, message: 'If that account exists, a reset email has been sent.' })
}

exports.resetPassword = async (req, res) => {
  await authService.resetPassword(req.body)
  res.json({ success: true, message: 'Password reset successfully. Please sign in again.' })
}
