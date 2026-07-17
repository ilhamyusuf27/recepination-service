const crypto = require('crypto')
const path = require('path')
const getSupabase = require('../lib/supabase')
const AppError = require('./AppError')

const uploadToSupabase = async (file, bucketName, folderName = 'public') => {
  const fileExt = path.extname(file.originalname).toLowerCase()
  const storagePath = `${folderName}/${crypto.randomUUID()}${fileExt}`
  const supabase = getSupabase()
  const { error } = await supabase.storage.from(bucketName).upload(storagePath, file.buffer, {
    contentType: file.mimetype,
    upsert: false
  })
  if (error) throw new AppError('Unable to upload image', 502)

  const { data } = supabase.storage.from(bucketName).getPublicUrl(storagePath)
  return { url: data.publicUrl, path: storagePath }
}

const deleteFromSupabase = async (bucketName, storagePath) => {
  if (!storagePath) return
  const { error } = await getSupabase().storage.from(bucketName).remove([storagePath])
  if (error) console.error(JSON.stringify({ level: 'warn', message: 'Unable to delete stored image', storagePath }))
}

module.exports = { uploadToSupabase, deleteFromSupabase }
