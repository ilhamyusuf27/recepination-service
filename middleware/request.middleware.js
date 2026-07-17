const { randomUUID } = require('crypto')

const requestContext = (req, res, next) => {
  req.id = req.headers['x-request-id'] || randomUUID()
  res.setHeader('x-request-id', req.id)

  const startedAt = Date.now()
  res.on('finish', () => {
    const event = {
      level: 'info',
      requestId: req.id,
      method: req.method,
      path: req.originalUrl,
      statusCode: res.statusCode,
      durationMs: Date.now() - startedAt
    }
    console.log(JSON.stringify(event))
  })

  next()
}

module.exports = requestContext
