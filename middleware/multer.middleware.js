const multer = require('multer')

const storage = multer.memoryStorage()

const upload = multer({
  storage,
  limits: {
    fileSize: 5 * 1024 * 1024,
    files: 1,
    fields: 30
  },
  fileFilter: (req, file, callback) => {
    const allowed = ['image/jpeg', 'image/png', 'image/webp']
    callback(allowed.includes(file.mimetype) ? null : new Error('Invalid image type'), allowed.includes(file.mimetype))
  }
})

module.exports = upload
