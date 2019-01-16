const jwt = require('jsonwebtoken')
const config = require('../../config/main')
const chalk = require('chalk')

const createToken = user => {
  return jwt.sign({user}, config.jwtKey, {expiresIn: '24h'})
}

const sendToken = async (req, res) => {
  req.token = await createToken(req.user)
  console.log(chalk.bold.green('Authentication successful, JWT generated:\n', req.token))
  res.setHeader('auth-token', req.token)
  return res.status(200).json({
    status: {
      code: 200,
      message: 'JSON Web Token successfully generated'
    },
    email: req.user.email,
    userId: req.user._id,
    isDM: req.user.isDM
  })
}

module.exports = {
   sendToken
}
