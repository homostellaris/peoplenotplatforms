const { ApolloServer } = require('apollo-server-express')

const typeDefs = require('../graphql/schema')
const PeopleDataSource = require('../graphql/datasources/people')
const resolvers = require('../graphql/resolvers')

function applyApolloServerMiddleware (app, db) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    dataSources: () => ({
      peopleDataSource: new PeopleDataSource(db)
    })
  })
  server.applyMiddleware({ app })
  return server
}

module.exports = applyApolloServerMiddleware