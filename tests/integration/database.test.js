require('dotenv').config({ quiet: true })

const test = require('node:test')
const assert = require('node:assert/strict')
const bcrypt = require('bcrypt')
const crypto = require('node:crypto')
const prisma = require('../../lib/prisma')
const authService = require('../../services/auth.service')
const recipeService = require('../../services/recipe.service')
const commentService = require('../../services/comment.service')
const favoriteService = require('../../services/favorite.service')

test('PostgreSQL supports the secured service lifecycle', async (t) => {
  const suffix = crypto.randomUUID()
  const emailA = `db-test-a-${suffix}@example.com`
  const emailB = `db-test-b-${suffix}@example.com`
  const password = 'database-test-password'
  const cleanup = { userIds: [], categoryId: null }

  t.after(async () => {
    if (cleanup.userIds.length) {
      await prisma.user.deleteMany({
        where: { user_id: { in: cleanup.userIds } }
      })
    }
    if (cleanup.categoryId) await prisma.category.deleteMany({ where: { category_id: cleanup.categoryId } })
    await prisma.$disconnect()
  })

  const passwordHash = await bcrypt.hash(password, 4)
  const [userA, userB] = await Promise.all([
    prisma.user.create({
      data: { name: 'Database Test A', email: emailA, password: passwordHash, is_verified: true }
    }),
    prisma.user.create({
      data: { name: 'Database Test B', email: emailB, password: passwordHash, is_verified: true }
    })
  ])
  cleanup.userIds.push(userA.user_id, userB.user_id)

  const category = await prisma.category.create({ data: { name: `Integration ${suffix}` } })
  cleanup.categoryId = category.category_id

  const login = await authService.login({ email: emailA, password })
  assert.ok(login.accessToken)
  assert.ok(login.refreshToken)
  assert.equal(login.user.email, emailA)
  assert.equal(Object.hasOwn(login.user, 'password'), false)

  const rotated = await authService.refreshSession(login.refreshToken)
  assert.ok(rotated.accessToken)
  assert.notEqual(rotated.refreshToken, login.refreshToken)

  const recipe = await recipeService.createRecipe({
    title: 'Integration recipe',
    description: 'Created against the real PostgreSQL database',
    instructions: ['Prepare ingredients', 'Cook and serve'],
    ingredients: [{ name: 'Rice', quantity: '2 bowls' }],
    categoryIds: [category.category_id]
  }, userA.user_id)

  assert.equal(recipe.user_id, userA.user_id)
  const detail = await recipeService.getRecipeDetail(recipe.recipe_id)
  assert.equal(detail.ingredients[0].position, 1)
  assert.equal(detail.instructions.length, 2)

  await assert.rejects(
    recipeService.updateRecipe(recipe.recipe_id, { title: 'Unauthorized change' }, userB),
    (error) => error.statusCode === 403
  )

  const parent = await commentService.createComment({
    content: 'Database-backed comment',
    recipeId: recipe.recipe_id
  }, userB.user_id)
  await commentService.createComment({
    content: 'Database-backed reply',
    recipeId: recipe.recipe_id,
    parentId: parent.comment_id
  }, userA.user_id)

  const comments = await commentService.getCommentsByRecipe(recipe.recipe_id, { page: 1, limit: 10 })
  assert.equal(comments.data.length, 1)
  assert.equal(comments.data[0].replies.length, 1)

  await favoriteService.addFavorite(userB.user_id, recipe.recipe_id)
  const favorites = await favoriteService.getFavoritesByUser(userB.user_id, { page: 1, limit: 10 })
  assert.equal(favorites.data[0].recipe_id, recipe.recipe_id)

  await authService.logout(rotated.refreshToken)
})
