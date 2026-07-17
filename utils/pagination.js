const parsePagination = (query = {}) => {
  const rawPage = Number.parseInt(query.page, 10)
  const rawLimit = Number.parseInt(query.limit, 10)
  const page = Number.isFinite(rawPage) && rawPage > 0 ? rawPage : 1
  const limit = Number.isFinite(rawLimit) && rawLimit > 0
    ? Math.min(rawLimit, 100)
    : 10

  return { page, limit, skip: (page - 1) * limit }
}

module.exports = { parsePagination }
