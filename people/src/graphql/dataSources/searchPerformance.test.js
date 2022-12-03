const setupDatabaseAndGetClient = require('@peoplenotplatforms/database')

// Run this with MONGODB_URI=mongodb://localhost:27017/peoplenotplatforms npx jest searchPerformance --watch --verbose=false

describe('Database search performance', () => {
  const query = 'Dan'
  let db
  let peopleCollection
  let hrstart
  let hrend

  beforeAll(async () => {
    const databaseClient = await setupDatabaseAndGetClient()
    db = databaseClient.db

    await db('peoplenotplatforms').dropDatabase()
    await db('peoplenotplatforms').createCollection('people')
    peopleCollection = db('peoplenotplatforms').collection('people')

    // TODO: Replace with Cypress plugin
    const people = []
    for (let i = 1; i <= 100000; i++) {
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
    await peopleCollection.insertMany(people)
  })

  it('using skip and limit', async () => {
    hrstart = process.hrtime()

    const cursor = await peopleCollection
      .find({
        name: { $regex: `${query}`, $options: 'i' }
      })
      .sort({ popularity: 1 })
      .skip(50000)
      .limit(10000)
    await cursor.toArray()

    hrend = process.hrtime(hrstart)
    console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
  })

  it('using a "range query"', async () => {
    hrstart = process.hrtime()

    const cursor = await peopleCollection
      .find({
        name: { $regex: `${query}`, $options: 'i' },
        popularity: { $gt: 50000 }
      })
      .sort({ popularity: 1 })
      .limit(10000)
    await cursor.toArray()

    hrend = process.hrtime(hrstart)
    console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
  })

  it('using a "range query" with an index', async () => {
    await peopleCollection.createIndex('popularity')

    hrstart = process.hrtime()

    const cursor = await peopleCollection
      .find({
        name: { $regex: `${query}`, $options: 'i' },
        popularity: { $gt: 50000 }
      })
      .sort({ popularity: 1 })
      .limit(10000)

    await Promise.all([
      cursor.toArray(),
      await peopleCollection.count({
        name: { $regex: `${query}`, $options: 'i' }
      })
    ])

    hrend = process.hrtime(hrstart)
    console.info('Execution time (hr): %ds %dms', hrend[0], hrend[1] / 1000000)
  })
})
