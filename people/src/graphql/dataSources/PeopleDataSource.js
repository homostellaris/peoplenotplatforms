const { DataSource } = require('apollo-datasource')
const { ObjectID } = require('mongodb') // TODO: Remove the need for this dependency
const replaceMongoIdWithApplicationId = require('./replaceMongoIdWithApplicationId.js') // TODO: Use inheritance to avoid these imports duplicated in all Mongo data sources.

// TODO: Replace with Mongo community data source
class PeopleDataSource extends DataSource {
  constructor(db) {
    super()
    this.db = db
    this.collection = this.db.collection('people')
  }

  async createPerson(person, userId) {
    const numberOfPeople = await this.collection.countDocuments()
    const personToInsert = {
      ...person,
      popularity: numberOfPeople + 1,
      creator: userId
    }

    const result = await this.collection.insertOne(personToInsert) // Have to shallow clone the object because insertOne mutates the original to add _id.

    return replaceMongoIdWithApplicationId({
      ...personToInsert,
      _id: result.insertedId
    })
  }

  async editPerson(id, person) {
    const result = await this.collection.findOneAndUpdate(
      { _id: new ObjectID(id) },
      { $set: { ...person } },
      { returnOriginal: false }
    )

    if (result.modifiedCount < 1) {
      throw new Error('The edit had no effect!')
    }

    const editedPerson = result.value
    return replaceMongoIdWithApplicationId(editedPerson)
  }

  async getPeople(query, resultsPerPage, startingPopularity = 1) {
    const mongoQuery = query.includes(':')
      ? { creator: query.split(':')[1].trim() }
      : { name: { $regex: query, $options: 'i' } }

    // TODO: This doesn't work if multiple people have the same popularity
    // as then there are more than 5 results per page but the extras are missed.
    const cursor = this.collection
      .find({
        ...mongoQuery,
        popularity: { $gte: startingPopularity }
      })
      .sort({ popularity: 1 })

    if (resultsPerPage) cursor.limit(resultsPerPage)

    const people = await cursor.toArray()
    return people.map(replaceMongoIdWithApplicationId)
  }

  async getPeopleCount(query) {
    const count = await this.collection.countDocuments({
      name: { $regex: query, $options: 'i' }
    })
    return count
  }

  async getPerson(id) {
    // TODO: Decide whether to keep using this.
    // Doesn't work with non-Mongo IDs like fakeUserId used in tests
    // replaceMongoIdWithApplicationId also doesn't work with non-Mongo IDs
    const query = { _id: new ObjectID(id) }
    const person = await this.collection.findOne(query)
    return replaceMongoIdWithApplicationId(person)
  }
}

module.exports = PeopleDataSource
