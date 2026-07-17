const requiredInProduction = [
  'DATABASE_URL',
  'SECRET_KEY',
  'CLIENT_URL',
  'APP_URL',
  'SUPABASE_ENDPOINT',
  'SUPABASE_SERVICE_ROLE_KEY'
]

const validateEnv = () => {
  if (process.env.NODE_ENV !== 'production') return

  const missing = requiredInProduction.filter((key) => !process.env[key])
  if (missing.length) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`)
  }

  if (process.env.SECRET_KEY.length < 32) {
    throw new Error('SECRET_KEY must be at least 32 characters')
  }
}

const env = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: Number(process.env.PORT) || 8000,
  clientUrl: process.env.CLIENT_URL || 'http://localhost:3000',
  appUrl: process.env.APP_URL || 'http://localhost:3000',
  jwtSecret: process.env.SECRET_KEY,
  accessTokenTtl: process.env.ACCESS_TOKEN_TTL || '30m',
  refreshTokenDays: Number(process.env.REFRESH_TOKEN_DAYS) || 30
}

module.exports = { env, validateEnv }
