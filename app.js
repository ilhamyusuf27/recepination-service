require('dotenv').config()

const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const prisma = require('./lib/prisma')
const { env, validateEnv } = require('./config/env')
const requestContext = require('./middleware/request.middleware')
const errorHandler = require('./middleware/error.middleware')

const authRoutes = require('./routes/auth.routes')
const userRoutes = require('./routes/user.routes')
const recipeRoutes = require('./routes/recipe.routes')
const ingredientRoutes = require('./routes/ingredients.routes')
const categoryRoutes = require('./routes/category.routes')
const recipeCategoryRoutes = require('./routes/recipeCategory.routes')
const commentRoutes = require('./routes/comment.routes')
const favoriteRoutes = require('./routes/favorite.routes')

validateEnv()

const app = express()

if (env.nodeEnv === 'production') app.set('trust proxy', 1)

app.disable('x-powered-by')
app.use(requestContext)
app.use(helmet())
app.use(cors({ origin: env.clientUrl, credentials: true }))
app.use(express.json({ limit: '100kb' }))
app.use(express.urlencoded({ extended: true, limit: '100kb' }))

app.get('/health', (req, res) => {
  res.json({ success: true, data: { status: 'ok' } })
})

app.get('/ready', async (req, res, next) => {
  try {
    await prisma.$queryRaw`SELECT 1`
    res.json({ success: true, data: { status: 'ready' } })
  } catch (error) {
    next(error)
  }
})

app.use('/api/v1/auth', authRoutes)
app.use('/api/v1/users', userRoutes)
app.use('/api/v1/recipes', recipeRoutes)
app.use('/api/v1/ingredients', ingredientRoutes)
app.use('/api/v1/categories', categoryRoutes)
app.use('/api/v1/recipe-categories', recipeCategoryRoutes)
app.use('/api/v1/comments', commentRoutes)
app.use('/api/v1/favorites', favoriteRoutes)

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    requestId: req.id
  })
})

app.use(errorHandler)

module.exports = app
