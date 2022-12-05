const setupDatabase = require('./setupDatabase')
const DatabaseClient = require('./DatabaseClient')

async function resetDatabase(databaseUrl) {
  if (process.env.NODE_ENV === 'production') {
    throw new Error('Unsafe to reset database in production.')
  }

  const client = await new DatabaseClient(databaseUrl)

  try {
    await client.db.dropDatabase()
    await setupDatabase(client.db)
  } finally {
    client.close()
  }
}

module.exports = resetDatabase
