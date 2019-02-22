const jwt = require('jsonwebtoken')
const config = require('../../config/main')

const createToken = user => {
  return jwt.sign({ user }, config.jwtKey, { expiresIn: '24h' })
}

const sendToken = async (req, res) => {
  req.token = await createToken(req.user)
  return res.status(200).json({
    status: {
      code: 200,
      message: 'JSON Web Token successfully generated'
    },
    jwt: req.token,
    email: req.user.email,
    userId: req.user._id,
    isDM: req.user.isDM,
    photoURL: req.user.photoURL
  })
}

module.exports = {
  sendToken
}
