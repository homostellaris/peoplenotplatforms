const DatabaseClient = require('@peoplenotplatforms/database/src/DatabaseClient')
const resetDatabase = require('@peoplenotplatforms/database/src/resetDatabase')

const { updatePopularities } = require('.')

let databaseClient
let peopleCollection
let peopleIds

beforeAll(async () => {
  await resetDatabase()
  databaseClient = await new DatabaseClient(process.env.MONGODB_URI).connect()
  peopleCollection = databaseClient
    .db('peoplenotplatforms')
    .collection('people')

  const people = []
  for (let i = 1; i <= 10; i++) {
    people.push({
      name: `Daniel Metcalfe ${i}`,
      image:
        'https://www.gravatar.com/avatar/d35e305d07d4e8fe7bf844d17bec5e1e?s=1000',
      popularity: i,
      profiles: [
        'https://danielmetcalfe.rocks',
        'https://stackoverflow.com/story/mrdanielmetcalfe',
        'https://github.com/moderatemisbehaviour'
      ]
    })
  }
  const results = await peopleCollection.insertMany(people)
  peopleIds = results.insertedIds
})

afterAll(async () => {
  await databaseClient.close()
})

it('Updates the popularities according to the number of page visits for each person', async () => {
  const peopleIdsOrderedByVisits = [
    peopleIds[7],
    peopleIds[3],
    peopleIds[1],
    peopleIds[9],
    peopleIds[0],
    peopleIds[4],
    peopleIds[5],
    peopleIds[2],
    peopleIds[8],
    peopleIds[6]
  ]

  await updatePopularities(peopleIdsOrderedByVisits)

  const updatedPeople = await peopleCollection
    .find()
    .sort({ popularity: 1 })
    .toArray()
  const updatedPeopleIds = updatedPeople.map(person => person._id)
  expect(updatedPeopleIds).toEqual(peopleIdsOrderedByVisits)
})
