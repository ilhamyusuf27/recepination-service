const test = require('node:test')
const assert = require('node:assert/strict')
const AppError = require('../utils/AppError')
const { parsePagination } = require('../utils/pagination')
const { registerSchema } = require('../validators/auth.validator')
const { createRecipeSchema, updateRecipeSchema } = require('../validators/recipe.validator')

test('AppError preserves HTTP status and operational metadata', () => {
  const error = new AppError('Forbidden', 403, { reason: 'owner' })
  assert.equal(error.statusCode, 403)
  assert.equal(error.status, 'fail')
  assert.equal(error.isOperational, true)
  assert.deepEqual(error.details, { reason: 'owner' })
})

test('pagination rejects unsafe values and caps large limits', () => {
  assert.deepEqual(parsePagination({ page: '-2', limit: '0' }), { page: 1, limit: 10, skip: 0 })
  assert.deepEqual(parsePagination({ page: '3', limit: '5000' }), { page: 3, limit: 100, skip: 200 })
})

test('registration normalizes email and validates confirmation', () => {
  const valid = registerSchema.parse({
    name: 'Recipe Author',
    email: ' AUTHOR@EXAMPLE.COM ',
    password: 'correct-horse',
    rePassword: 'correct-horse'
  })
  assert.equal(valid.email, 'author@example.com')
  assert.equal(registerSchema.safeParse({ ...valid, rePassword: 'different' }).success, false)
})

test('recipe input parses multipart JSON fields', () => {
  const recipe = createRecipeSchema.parse({
    title: 'Nasi Goreng',
    description: 'A practical weeknight recipe',
    instructions: '["Prepare ingredients","Cook until fragrant"]',
    ingredients: '[{"name":"rice","quantity":"2 bowls"}]',
    categoryIds: '[]'
  })
  assert.equal(recipe.instructions.length, 2)
  assert.equal(recipe.ingredients[0].name, 'rice')
})

test('partial recipe updates do not require nested collections', () => {
  assert.deepEqual(updateRecipeSchema.parse({ title: 'Updated title' }), { title: 'Updated title' })
})
