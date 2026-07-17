const AppError = require('../utils/AppError')

const isValidImage = (file) => {
  const bytes = file.buffer
  if (!bytes?.length) return false

  const jpeg = bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff
  const png = bytes.subarray(0, 8).equals(Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]))
  const webp = bytes.subarray(0, 4).toString() === 'RIFF' && bytes.subarray(8, 12).toString() === 'WEBP'
  return jpeg || png || webp
}

const validate = (schema, source = 'body') => (req, res, next) => {
  const result = schema.safeParse(req[source])
  if (!result.success) {
    return next(new AppError('Validation error', 400, result.error.flatten()))
  }

  if (req.file && !isValidImage(req.file)) {
    return next(new AppError('File content is not a valid JPEG, PNG, or WebP image', 400))
  }

  req[source] = result.data
  next()
}

module.exports = validate
