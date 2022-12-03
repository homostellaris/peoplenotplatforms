const createServer = require('../people/src/createServer')
const verifyGoogleIdToken = require('../people/src/verifyGoogleIdToken')

async function login(req, res, next) {
  if (!req.body.idToken) {
    const error = new Error('No ID token provided.')
    error.status = 400
    return next(error)
  }

  try {
    const payload = await verifyGoogleIdToken(req.body.idToken)

    const user = {
      email: payload.email,
      image: payload.picture.replace('=s96-c', ''),
      name: payload.name
    }
    const upsertedUser = await upsertUser(user)
    req.session.userId = upsertedUser._id

    setAuthCookies(payload.exp, req, res)

    return res.send()
  } catch (error) {
    return next(error)
  }

  function setAuthCookies(payloadExpiry, req, res) {
    const tokenExpiryUnixSeconds = payloadExpiry
    const expiryDate = new Date(tokenExpiryUnixSeconds * 1000)
    const now = new Date()
    const maxAge = expiryDate - now
    req.session.cookie.maxAge = maxAge

    res.cookie('isLoggedIn', true, { maxAge })
  }

  async function upsertUser(user) {
    const usersCollection = req.app.locals.databaseClient
      .db('peoplenotplatforms')
      .collection('users')
    const result = await usersCollection.findOneAndReplace(
      { email: user.email },
      { ...user },
      {
        returnOriginal: false, // Without this null is returned when the document does not already exist.
        upsert: true
      }
    ) // Have to shallow clone the object because insertOne mutates the original to add _id.

    return result.value
  }
}

module.exports = createServer(login)
