console.log('NODE_ENV is', process.env.NODE_ENV)
console.log('CI is', process.env.CI)

const databaseClient = require('follow-database')

const createExpressServerForStaticContent = require('./createExpressServerForStaticContent')
const applyApolloServerMiddleware = require('./applyApolloServerMiddleware')
const configureExpressToHandleUrlPaths = require('./configureExpressToHandleUrlPaths')

const expressServer = createExpressServerForStaticContent()
databaseClient().then(db => {
  const apolloServer = applyApolloServerMiddleware(expressServer, db)

  const port = process.env.PORT || 4000
  expressServer.listen({ port }, () =>
    console.log(
      `🚀 Server ready at http://localhost:${port}${apolloServer.graphqlPath}`
    )
  )

  configureExpressToHandleUrlPaths(expressServer)
})
