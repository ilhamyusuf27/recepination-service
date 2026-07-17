const { Prisma } = require('@prisma/client')
const multer = require('multer')

const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500
  let message = err.message || 'Internal Server Error'

  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002':
        statusCode = 409
        message = 'Duplicate field value'
        break
      case 'P2025':
        statusCode = 404
        message = 'Record not found'
        break
      default:
        statusCode = 400
        message = 'Database error'
    }
  }

  if (err.name === 'JsonWebTokenError') {
    statusCode = 401
    message = 'Invalid token'
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401
    message = 'Token expired'
  }

  if (err instanceof multer.MulterError) {
    statusCode = 400
    message = err.code === 'LIMIT_FILE_SIZE' ? 'Image too large (max 5MB)' : err.message
  }

  const response = {
    success: false,
    status: err.status || 'error',
    message,
    requestId: req.id
  }

  if (err.details) response.errors = err.details

  if (process.env.NODE_ENV === 'development') {
    response.stack = err.stack
  }

  const log = {
    level: statusCode >= 500 ? 'error' : 'warn',
    requestId: req.id,
    statusCode,
    message: err.message,
    stack: statusCode >= 500 ? err.stack : undefined
  }
  console.error(JSON.stringify(log))

  res.status(statusCode).json(response)
}

module.exports = errorHandler
