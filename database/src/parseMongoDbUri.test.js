const parseMongoDbUri = require('./parseMongoDbUri')

describe('when a valid MongoDB URI is passed in', () => {
  describe('when the URI contains the username and password', () => {
    let clientOptions

    beforeAll(() => {
      clientOptions = parseMongoDbUri(
        'mongodb://foo_12345678:random_password@ds029017.mLab.com:29017/foo_12345678'
      )
    })

    it('returns the scheme', () => {
      expect(clientOptions.scheme).toEqual('mongodb')
    })

    it('returns the username', () => {
      expect(clientOptions.username).toEqual('foo_12345678')
    })

    it('returns the password', () => {
      expect(clientOptions.password).toEqual('random_password')
    })

    it('returns the hosts', () => {
      expect(clientOptions.hosts).toEqual([
        { host: 'ds029017.mLab.com', port: 29017 }
      ])
    })

    it('returns the database', () => {
      expect(clientOptions.database).toEqual('foo_12345678')
    })
  })

  describe('when the URI does not contain the user name and password', () => {
    let clientOptions

    beforeAll(() => {
      clientOptions = parseMongoDbUri(
        'mongodb://localhost:27017/peoplenotplatforms'
      )
    })

    it('returns the scheme', () => {
      expect(clientOptions.scheme).toEqual('mongodb')
    })

    it('returns the username', () => {
      expect(clientOptions.username).toBeUndefined()
    })

    it('returns the password', () => {
      expect(clientOptions.password).toBeUndefined()
    })

    it('returns the hosts', () => {
      expect(clientOptions.hosts).toEqual([{ host: 'localhost', port: 27017 }])
    })

    it('returns the database', () => {
      expect(clientOptions.database).toEqual('peoplenotplatforms')
    })
  })
})
