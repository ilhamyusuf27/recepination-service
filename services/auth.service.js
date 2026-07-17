const bcrypt = require('bcrypt')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const prisma = require('../lib/prisma')
const { env } = require('../config/env')
const { sendVerificationEmail, sendPasswordResetEmail, isMailerConfigured } = require('../lib/mailer')
const AppError = require('../utils/AppError')

const publicUserSelect = {
  user_id: true,
  name: true,
  phone_number: true,
  email: true,
  photo_profile: true,
  is_verified: true,
  role: true,
  created_at: true,
  updated_at: true
}

const normalizeEmail = (email) => email.trim().toLowerCase()
const hashToken = (token) => crypto.createHash('sha256').update(token).digest('hex')
const createOpaqueToken = () => crypto.randomBytes(48).toString('base64url')

const signAccessToken = (user) => jwt.sign(
  {
    user_id: user.user_id,
    name: user.name,
    email: user.email,
    role: user.role,
    type: 'access'
  },
  env.jwtSecret,
  {
    expiresIn: env.accessTokenTtl,
    issuer: 'recepination-service',
    audience: 'recepination-web',
    subject: user.user_id
  }
)

const createRefreshToken = async (userId, tx = prisma) => {
  const refreshToken = createOpaqueToken()
  const expiresAt = new Date(Date.now() + env.refreshTokenDays * 24 * 60 * 60 * 1000)

  await tx.refreshToken.create({
    data: {
      token_hash: hashToken(refreshToken),
      user_id: userId,
      expires_at: expiresAt
    }
  })

  return refreshToken
}

const login = async ({ email, password }) => {
  const user = await prisma.user.findUnique({ where: { email: normalizeEmail(email) } })
  const isMatch = user ? await bcrypt.compare(password, user.password) : false

  if (!user || !isMatch) throw new AppError('Invalid email or password', 401)
  if (!user.is_verified) throw new AppError('Please verify your email first', 403)

  const refreshToken = await createRefreshToken(user.user_id)
  return {
    accessToken: signAccessToken(user),
    refreshToken,
    user: Object.fromEntries(Object.keys(publicUserSelect).map((key) => [key, user[key]]))
  }
}

const register = async (data) => {
  const email = normalizeEmail(data.email)
  const existingUser = await prisma.user.findUnique({ where: { email } })
  if (existingUser) throw new AppError('Email already exists', 409)

  const skipVerification = env.nodeEnv !== 'production' && process.env.SKIP_EMAIL_VERIFICATION === 'true'
  if (!skipVerification && !isMailerConfigured()) {
    throw new AppError('Email service is not configured', 503)
  }

  const rawToken = createOpaqueToken()
  const tokenExpiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000)
  const hashedPassword = await bcrypt.hash(data.password, 12)

  const user = await prisma.user.create({
    data: {
      name: data.name.trim(),
      phone_number: data.phone_number?.trim() || null,
      email,
      password: hashedPassword,
      email_token: skipVerification ? null : hashToken(rawToken),
      email_token_expires_at: skipVerification ? null : tokenExpiresAt,
      is_verified: skipVerification
    },
    select: publicUserSelect
  })

  if (!skipVerification) {
    try {
      await sendVerificationEmail({ name: user.name, email: user.email, token: rawToken })
    } catch (error) {
      await prisma.user.delete({ where: { user_id: user.user_id } })
      throw new AppError('Unable to send verification email', 503)
    }
  }

  return user
}

const verifyEmail = async (token) => {
  if (!token) throw new AppError('Verification token is required', 400)

  const user = await prisma.user.findFirst({
    where: {
      email_token: hashToken(token),
      email_token_expires_at: { gt: new Date() }
    }
  })

  if (!user) throw new AppError('Invalid or expired verification token', 400)

  return prisma.user.update({
    where: { user_id: user.user_id },
    data: { email_token: null, email_token_expires_at: null, is_verified: true },
    select: publicUserSelect
  })
}

const resendVerification = async (emailInput) => {
  const email = normalizeEmail(emailInput)
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user || user.is_verified) return
  if (!isMailerConfigured()) throw new AppError('Email service is not configured', 503)

  const rawToken = createOpaqueToken()
  await prisma.user.update({
    where: { user_id: user.user_id },
    data: {
      email_token: hashToken(rawToken),
      email_token_expires_at: new Date(Date.now() + 24 * 60 * 60 * 1000)
    }
  })
  await sendVerificationEmail({ name: user.name, email, token: rawToken })
}

const refreshSession = async (rawToken) => {
  if (!rawToken) throw new AppError('Refresh token is required', 401)
  const stored = await prisma.refreshToken.findUnique({
    where: { token_hash: hashToken(rawToken) },
    include: { user: true }
  })

  if (!stored || stored.revoked_at || stored.expires_at <= new Date()) {
    throw new AppError('Invalid or expired refresh token', 401)
  }
  if (!stored.user.is_verified) throw new AppError('Account is not verified', 403)

  const nextRefreshToken = await prisma.$transaction(async (tx) => {
    await tx.refreshToken.update({ where: { id: stored.id }, data: { revoked_at: new Date() } })
    return createRefreshToken(stored.user_id, tx)
  })

  return {
    accessToken: signAccessToken(stored.user),
    refreshToken: nextRefreshToken
  }
}

const logout = async (rawToken) => {
  if (!rawToken) return
  await prisma.refreshToken.updateMany({
    where: { token_hash: hashToken(rawToken), revoked_at: null },
    data: { revoked_at: new Date() }
  })
}

const forgotPassword = async (emailInput) => {
  const email = normalizeEmail(emailInput)
  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) return
  if (!isMailerConfigured()) throw new AppError('Email service is not configured', 503)

  const rawToken = createOpaqueToken()
  await prisma.user.update({
    where: { user_id: user.user_id },
    data: {
      password_reset_token: hashToken(rawToken),
      password_reset_expires_at: new Date(Date.now() + 60 * 60 * 1000)
    }
  })
  await sendPasswordResetEmail({ name: user.name, email, token: rawToken })
}

const resetPassword = async ({ token, password }) => {
  const user = await prisma.user.findFirst({
    where: {
      password_reset_token: hashToken(token),
      password_reset_expires_at: { gt: new Date() }
    }
  })
  if (!user) throw new AppError('Invalid or expired reset token', 400)

  await prisma.$transaction([
    prisma.user.update({
      where: { user_id: user.user_id },
      data: {
        password: await bcrypt.hash(password, 12),
        password_reset_token: null,
        password_reset_expires_at: null
      }
    }),
    prisma.refreshToken.updateMany({
      where: { user_id: user.user_id, revoked_at: null },
      data: { revoked_at: new Date() }
    })
  ])
}

module.exports = {
  publicUserSelect,
  login,
  register,
  verifyEmail,
  resendVerification,
  refreshSession,
  logout,
  forgotPassword,
  resetPassword
}
