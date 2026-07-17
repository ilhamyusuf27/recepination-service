const test = require('node:test')
const assert = require('node:assert/strict')
const app = require('../app')

test('health endpoint and versioned resource routers are registered', () => {
  const healthLayer = app.router.stack.find((layer) => layer.route?.path === '/health')
  assert.ok(healthLayer)
  assert.equal(healthLayer.route.methods.get, true)

  let responseBody
  healthLayer.route.stack[0].handle({}, { json: (body) => { responseBody = body } })
  assert.deepEqual(responseBody, { success: true, data: { status: 'ok' } })

  const mountedRouters = app.router.stack.filter((layer) => layer.name === 'router')
  assert.equal(mountedRouters.length, 8)
  assert.ok(app.router.stack.some((layer) => layer.name === 'errorHandler'))
})
