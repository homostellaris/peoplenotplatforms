const createServer = require('../people/src/createServer')

async function logout(req, res) {
  await req.session.destroy()
  res.clearCookie('connect.sid')
  res.clearCookie('isLoggedIn')
  res.send()
}

module.exports = createServer(logout)
