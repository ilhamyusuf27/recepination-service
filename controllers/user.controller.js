const userService = require('../services/user.service')
const { uploadToSupabase, deleteFromSupabase } = require('../utils/uploadToSupabase')
const AppError = require('../utils/AppError')

const bucket = 'recepination-storage'

exports.getUsers = async (req, res) => {
  const result = await userService.getUsers(req.query)
  res.json({ success: true, ...result })
}

exports.getMe = async (req, res) => {
  const user = await userService.getUserById(req.user.user_id)
  if (!user) throw new AppError('User not found', 404)
  res.json({ success: true, data: user })
}

exports.getUser = async (req, res) => {
  if (req.user.role !== 'ADMIN' && req.user.user_id !== req.params.id) throw new AppError('Forbidden', 403)
  const user = await userService.getUserById(req.params.id)
  if (!user) throw new AppError('User not found', 404)
  res.json({ success: true, data: user })
}

const update = async (userId, req, res) => {
  if (!req.file && Object.keys(req.body).length === 0) throw new AppError('At least one field or image is required', 400)
  const existing = await userService.getUserStorage(userId)
  if (!existing) throw new AppError('User not found', 404)

  let uploaded
  try {
    if (req.file) uploaded = await uploadToSupabase(req.file, bucket, 'users')
    const user = await userService.updateUser(userId, {
      ...req.body,
      ...(uploaded && { photo_profile: uploaded.url, photo_path: uploaded.path })
    })
    if (uploaded && existing.photo_path) await deleteFromSupabase(bucket, existing.photo_path)
    res.json({ success: true, message: 'User updated successfully', data: user })
  } catch (error) {
    if (uploaded?.path) await deleteFromSupabase(bucket, uploaded.path)
    throw error
  }
}

exports.updateMe = (req, res) => update(req.user.user_id, req, res)
exports.updateUser = (req, res) => update(req.params.id, req, res)

const remove = async (userId, res) => {
  const existing = await userService.getUserStorage(userId)
  await userService.deleteUser(userId)
  if (existing?.photo_path) await deleteFromSupabase(bucket, existing.photo_path)
  res.status(204).send()
}

exports.deleteMe = (req, res) => remove(req.user.user_id, res)
exports.deleteUser = (req, res) => remove(req.params.id, res)
