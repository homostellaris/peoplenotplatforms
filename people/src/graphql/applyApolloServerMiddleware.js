const { ApolloServer } = require('apollo-server-express')

const typeDefs = require('./schema')
const PeopleDataSource = require('./dataSources/PeopleDataSource')
const resolvers = require('./resolvers')
const UsersDataSource = require('./dataSources/UsersDataSource')
const Auth = require('./schema-directives/Auth')

function applyApolloServerMiddleware(expressServer, db) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: ({ req }) => ({ req }),
    dataSources: () => ({
      peopleDataSource: new PeopleDataSource(db),
      usersDataSource: new UsersDataSource(db)
    }),
    schemaDirectives: {
      auth: Auth
    }
  })
  server.applyMiddleware({ app: expressServer })
  return server
}

module.exports = applyApolloServerMiddleware
