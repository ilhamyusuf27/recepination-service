require('dotenv').config()

const app = require('./app')
const prisma = require('./lib/prisma')
const { env } = require('./config/env')

const server = app.listen(env.port, () => {
  console.log(JSON.stringify({ level: 'info', message: `Server running on port ${env.port}` }))
})

const shutdown = (signal) => {
  console.log(JSON.stringify({ level: 'info', message: `${signal} received; shutting down` }))
  server.close(async () => {
    await prisma.$disconnect()
    process.exit(0)
  })

  setTimeout(() => process.exit(1), 10000).unref()
}

process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))

module.exports = server
