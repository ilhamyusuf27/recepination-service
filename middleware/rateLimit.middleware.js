const buckets = new Map()

const rateLimit = ({ windowMs = 15 * 60 * 1000, max = 20 } = {}) => {
  return (req, res, next) => {
    const now = Date.now()
    const key = `${req.ip}:${req.baseUrl}:${req.path}`
    const current = buckets.get(key)

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs })
      return next()
    }

    current.count += 1
    if (current.count > max) {
      res.setHeader('retry-after', Math.ceil((current.resetAt - now) / 1000))
      return res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.'
      })
    }

    next()
  }
}

module.exports = rateLimit
