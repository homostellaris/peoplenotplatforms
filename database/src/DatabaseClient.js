const MongoClient = require('mongodb').MongoClient
const parseMongoDbUri = require('./parseMongoDbUri')

class DatabaseClient {
  constructor(uriConnectionString = process.env.MONGODB_URI) {
    this.uriConnectionString = uriConnectionString
    const { hosts, database } = parseMongoDbUri(this.uriConnectionString)
    this.hosts = hosts
    this.database = database
    this.client = new MongoClient(this.uriConnectionString)
  }

  async connect() {
    await this.client.connect()
    console.info(`Successfully connected to database at ${this.hosts[0].host}`)
    return this
  }

  async close() {
    await this.client.close()
  }

  get db() {
    return this.client.db(this.database)
  }
}

module.exports = DatabaseClient
