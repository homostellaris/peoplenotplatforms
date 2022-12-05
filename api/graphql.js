const createServer = require('../people/src/createServer')
const applyApolloServerMiddleware = require('../people/src/graphql/applyApolloServerMiddleware')

async function graphql(req, res, next) {
  applyApolloServerMiddleware(req.app, req.app.locals.databaseClient.db)
  next()
}

module.exports = createServer(graphql)
