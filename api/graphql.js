const createServer = require('../people/src/createServer')
const applyApolloServerMiddleware = require('../people/src/graphql/applyApolloServerMiddleware')

async function graphql(req, res, next) {
  applyApolloServerMiddleware(
    req.app,
    req.app.locals.databaseClient.db('peoplenotplatforms')
  )
  next()
}

module.exports = createServer(graphql)
