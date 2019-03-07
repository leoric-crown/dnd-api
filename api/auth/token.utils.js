const jwt = require('jsonwebtoken')
const config = require('../../config/main')
const endpoint = `http://${config.host}:${config.port}/users/`

const createToken = user => {
  return jwt.sign({ user }, config.jwtKey, { expiresIn: '24h' })
}

const createVerifyToken = id => {
  return jwt.sign({ user: { _id: id} }, config.jwtKey, { expiresIn: '24h' })
}

const sendToken = async (req, res, fromFb=false, patch=false) => {
  req.token = await createToken(req.user)

  const { __v, facebookProvider, ...user } = fromFb ? req.user._doc : req.user

  return res.status(200).json({
    status: {
      code: 200,
      message: patch ? 'Successfully patched User document' : 'JSON Web Token successfully generated'
    },
    ...user,
    jwt: req.token,
    request: {
      type: 'GET',
      url: endpoint + req.user._id
    }
  })
}

module.exports = {
  sendToken,
  createToken,
  createVerifyToken
}
