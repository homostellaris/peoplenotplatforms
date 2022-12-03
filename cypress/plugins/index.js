// ***********************************************************
// This example plugins/index.js can be used to load plugins
//
// You can change the location of this file or turn off loading
// the plugins file with the 'pluginsFile' configuration option.
//
// You can read more here:
// https://on.cypress.io/plugins-guide
// ***********************************************************

const resetDatabase = require('../../database/src/resetDatabase')
const DatabaseClient = require('../../database/src/DatabaseClient')
const fs = require('fs')
const createPeople = require('./createPeople')
const MongoStore = require('connect-mongo')
var signature = require('cookie-signature')
const PeopleDataSource = require('../../people/src/graphql/dataSources/PeopleDataSource')

// This function is called when a project is opened or re-opened (e.g. due to
// the project's config changing)
module.exports = async (on, config) => {
  // `on` is used to hook into various events Cypress emits
  // `config` is the resolved Cypress config

  const databaseClient = await new DatabaseClient(
    process.env.MONGODB_URI
  ).connect()
  const peopleCollection = databaseClient.db.collection('people')
  const peopleDataSource = new PeopleDataSource(databaseClient.db)
  const usersCollection = databaseClient.db.collection('users')

  on('task', {
    async resetDatabase() {
      await resetDatabase()
      return null // Tell Cypress we do not intend to yield a value.
    },
    async createPerson(fixture) {
      if (!fixture) {
        const dan = JSON.parse(
          fs.readFileSync('cypress/fixtures/people/dan.json', 'utf8')
        )
        fixture = dan
      }

      if (!fixture.popularity) fixture.popularity = 1

      const result = await peopleCollection.insertOne(fixture)
      const person = result.ops[0]

      return person
    },
    // TODO: Upgrade to 5.3.0 and use default arg: https://github.com/cypress-io/cypress/issues/5913
    async createPersonApi(args) {
      // TODO: Replace with default arg after upgrading Cypress
      if (!args) args = {}

      const personToCreate =
        args.person ||
        JSON.parse(fs.readFileSync('cypress/fixtures/people/dan.json', 'utf8'))
      const userId = args.userId || 'fakeUserId'

      return peopleDataSource.createPerson(personToCreate, userId)
    },
    async createPeople() {
      return createPeople(databaseClient)
    },
    async createSession(sessionData) {
      // TODO: Stop this creating two redundant sessions.
      const mongoStore = MongoStore.create({ client: databaseClient.client })
      await mongoStore.set('fakeSessionId', {
        cookie: {
          httpOnly: true,
          path: '/'
        },
        ...sessionData
      })
      // Nicked this from the setcookie function in express-session's index JS file.
      var signed = 's%3A' + signature.sign('fakeSessionId', 'fakeSessionSecret')
      return signed
    },
    async createUser(user) {
      const result = await usersCollection.insertOne(user)
      const createdUser = result.ops[0]
      return { ...createdUser, id: createdUser._id }
    },
    async findUser(email) {
      return usersCollection.findOne({ email })
    }
  })

  on('before:browser:launch', (browser = {}, args) => {
    if (browser.name === 'chrome') {
      args.push('--remote-debugging-port=9222')
      return args
    }
  })

  return config
}
