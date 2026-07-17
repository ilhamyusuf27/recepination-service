const getUserIdFromToken = (req) => {
  if (!req.user?.user_id) throw new Error('Authentication middleware must run first')
  return req.user.user_id
}

module.exports = { getUserIdFromToken }
