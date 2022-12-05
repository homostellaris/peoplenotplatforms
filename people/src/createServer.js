const database = require('@peoplenotplatforms/database')
const session = require('express-session')
const MongoStore = require('connect-mongo')
const express = require('express')

async function createServer(middleware) {
  const databaseClient = await database()
  const mongoClient = databaseClient.client
  const expressServer = express()
  expressServer.locals.databaseClient = databaseClient

  expressServer.use(
    session({
      resave: false,
      saveUninitialized: true,
      secret: process.env.SESSION_SECRET,
      store: MongoStore.create({
        client: mongoClient
      })
    })
  )
  expressServer.use(express.json())
  expressServer.use(middleware)

  const port = process.env.PORT || 4000
  expressServer.listen({ port }, () =>
    console.info(`🚀 Server ready at http://localhost:${port}`)
  )

  return expressServer
}

module.exports = createServer
