const jwt = require('jsonwebtoken')
const prisma = require('../lib/prisma')
const { env } = require('../config/env')
const AppError = require('../utils/AppError')

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization
    if (!authHeader?.startsWith('Bearer ')) throw new AppError('Access token required', 401)

    const decoded = jwt.verify(authHeader.slice(7), env.jwtSecret, {
      issuer: 'recepination-service',
      audience: 'recepination-web'
    })
    if (decoded.type !== 'access') throw new AppError('Invalid token type', 401)

    const user = await prisma.user.findUnique({
      where: { user_id: decoded.user_id },
      select: { user_id: true, role: true, is_verified: true }
    })
    if (!user || !user.is_verified) throw new AppError('Account is unavailable', 401)

    req.user = user
    next()
  } catch (error) {
    next(error)
  }
}

const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) return next(new AppError('Forbidden', 403))
  next()
}

module.exports = { authenticate, authorize }
