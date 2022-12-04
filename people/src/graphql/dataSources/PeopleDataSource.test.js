const fs = require('fs')
const path = require('path')
const database = require('@peoplenotplatforms/database')
const resetDatabase = require('@peoplenotplatforms/database/src/resetDatabase')
const PeopleDataSource = require('./PeopleDataSource')

let databaseClient
let db
let peopleDataSource
let elon
let dan

beforeAll(async () => {
  databaseClient = await database()
  db = databaseClient.db
  peopleDataSource = new PeopleDataSource(db)
})

afterAll(async () => {
  await databaseClient.close()
})

beforeEach(async () => {
  await resetDatabase()

  dan = JSON.parse(
    fs.readFileSync(
      path.resolve(`${__dirname}/../../../../cypress/fixtures/people/dan.json`),
      'utf8'
    )
  )
  elon = JSON.parse(
    fs.readFileSync(
      path.resolve(
        `${__dirname}/../../../../cypress/fixtures/people/elon.json`
      ),
      'utf8'
    )
  )
})

describe('create person', () => {
  describe('when the object is valid', () => {
    it('returns an object', async () => {
      const actualResponse = await peopleDataSource.createPerson(
        dan,
        'fakeUserId'
      )
      expect(actualResponse).toMatchObject(dan)
      expect(actualResponse.id).toMatch(/[\d\w]{24}/)
    })

    it('assigns the person a popularity', async () => {
      expect(dan.popularity).toBeFalsy()
      expect(elon.popularity).toBeFalsy()

      const updatedDan = await peopleDataSource.createPerson(dan, 'fakeUserId')
      const updatedElon = await peopleDataSource.createPerson(
        elon,
        'fakeUserId'
      )

      expect(updatedDan.popularity).toBe(1)
      expect(updatedElon.popularity).toBe(2)
    })

    it('records the user who created the person', async () => {
      const actualResponse = await peopleDataSource.createPerson(
        dan,
        'fakeUserId'
      )
      expect(actualResponse.creator).toEqual('fakeUserId')
    })
  })

  describe('when the object is invalid', () => {
    describe('because the person has no name', () => {
      it('should throw a validation error', async () => {
        const danInvalid = { ...dan }
        delete danInvalid.name
        await expect(
          peopleDataSource.createPerson(danInvalid, 'fakeUserId')
        ).rejects.toThrow(Error)
      })
    })

    describe('because there are no profiles', () => {
      it('should throw a validation error', async () => {
        const danInvalid = { ...dan }
        delete danInvalid.profiles
        await expect(
          peopleDataSource.createPerson(danInvalid, 'fakeUserId')
        ).rejects.toThrow(Error)
      })
    })

    describe('because one of the profiles is an empty string', () => {
      it('should throw a validation error', async () => {
        const danInvalid = { ...dan }
        danInvalid.profiles[0] = ''
        await expect(
          peopleDataSource.createPerson(danInvalid, 'fakeUserId')
        ).rejects.toThrow(Error)
      })
    })
  })
})

describe('get people', () => {
  beforeEach(async () => {
    await db
      .collection('people')
      .insertMany([
        { ...dan, creator: 'fakeUserId', popularity: 1 },
        { ...elon, creator: 'fakeUserId', popularity: 2 }
      ])
  })

  describe('when the query matches the name', () => {
    describe('when the query matches the first 2 letters', () => {
      it('should return the person', async () => {
        const query = 'Da'
        const actualResponse = await peopleDataSource.getPeople(query)
        expect(actualResponse).toMatchObject([dan])
      })
    })

    describe('when the query matches the first 2 letters case insensitively', () => {
      it('should return the person', async () => {
        const query = 'da'
        const actualResponse = await peopleDataSource.getPeople(query)
        expect(actualResponse).toMatchObject([dan])
      })
    })

    describe('when the query matches the first 2 letters of the second name', () => {
      it('should return the person', async () => {
        const query = 'Me'
        const actualResponse = await peopleDataSource.getPeople(query)
        expect(actualResponse).toMatchObject([dan])
      })
    })

    describe('when the query matches the middle of the name', () => {
      it('should return the person', async () => {
        const query = 'Dan'
        const actualResponse = await peopleDataSource.getPeople(query)
        expect(actualResponse).toMatchObject([dan])
      })
    })

    describe('when the query matches multiple names', () => {
      it('should return people ordered by earliest match', async () => {
        const query = 'el'
        const actualResponse = await peopleDataSource.getPeople(query)
        expect(actualResponse).toMatchObject([dan, elon])
      })
    })

    xdescribe('when the query matches but has a typo', () => {
      it('should return the person', async () => {
        const query = 'Dna'
        const actualResponse = await peopleDataSource.getPeople(query)
        expect(actualResponse).toMatchObject([dan])
      })
    })
  })
})

describe('edit person', () => {
  describe('when the object is valid', () => {
    it('returns an object', async () => {
      dan.popularity = 1
      const peopleCollection = databaseClient.db.collection('people')
      const { insertedId } = await peopleCollection.insertOne({
        ...dan,
        creator: 'fakeUserId'
      })
      dan.name = 'Dan'

      const personReturned = await peopleDataSource.editPerson(insertedId, dan)

      expect(personReturned).toMatchObject(dan)
      const personInDatabase = await peopleCollection.findOne({
        _id: insertedId
      })
      expect(personInDatabase).toMatchObject(dan)
      expect(personInDatabase.name).toEqual('Dan')
    })
  })
})
