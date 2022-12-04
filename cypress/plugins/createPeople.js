const fs = require('fs')

// TODO: Update this to take an argument and create a user and update VS Code tasks to prompt for it.
async function createPeople(databaseClient) {
  const numberOfPeople = 13
  const dan = JSON.parse(
    fs.readFileSync('cypress/fixtures/people/dan.json', 'utf8')
  )

  const dans = []
  for (let i = 1; i <= numberOfPeople; i++) {
    dans.push({
      ...dan,
      creator: 'fakeUserId',
      name: `${dan.name} ${i}`,
      popularity: i
    })
  }
  await databaseClient.db.collection('people').insertMany(dans)

  return dans
}

module.exports = createPeople
