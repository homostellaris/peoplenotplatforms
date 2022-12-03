module.exports = async function(db) {
  // TODO: Fix this causing NamespaceExists error.
  // await db.createCollection('people')
  await db.command({
    collMod: 'people',
    validator: {
      $jsonSchema: {
        required: ['creator', 'name', 'popularity', 'profiles'],
        properties: {
          creator: {
            type: 'string',
            description: 'ID of the user who created the person.'
          },
          name: {
            type: 'string',
            description: 'The name of the person.'
          },
          profiles: {
            type: 'array',
            items: {
              type: 'string',
              minLength: 1
            },
            minItems: 1,
            maxItems: 50,
            uniqueItems: true
          },
          image: {
            type: 'string',
            description: 'An image representing the person.'
          },
          popularity: {
            bsonType: 'int',
            minimum: 1,
            description: '1 is the most popular person.'
          }
        }
      }
    }
  })
  await db.collection('people').createIndex('popularity', { unique: true })
}
