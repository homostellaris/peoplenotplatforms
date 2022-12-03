const { MongoClient } = require('mongodb')
const setupDatabase = require('./setupDatabase')

async function resetDatabase(databaseUrl) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Unsafe to reset database in production.')
  }

  const mongoClient = new MongoClient(databaseUrl || process.env.MONGODB_URI)
  await mongoClient.connect()

  try {
    const database = mongoClient.db('peoplenotplatforms')
    await database.dropDatabase()
    await setupDatabase(database)
  } finally {
    mongoClient.close()
  }
}

module.exports = resetDatabase
