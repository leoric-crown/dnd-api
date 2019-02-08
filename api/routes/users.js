const express = require('express')
const router = express.Router()
const tokens = require('../auth/token.utils')
const UserController = require('../controllers/users.controller')
const config = require('../../config/main')
const passport = require('passport')

require('../auth/passport')()
const authenticate = passport.authenticate('jwt', { session: false })
const authenticateFb = passport.authenticate('facebook-token', { session: false })

router.post('/signup', UserController.userSignup)

router.post('/login', UserController.userLogin)

router.post('/auth/facebook', authenticateFb, tokens.sendToken)

router.post('/verifyToken', authenticate, (req, res) => {
  console.log(req.user)
  const { password, ...user } = req.user._doc
  res.status(200).json({
    user,
    status: {
      code: 200,
      message: 'JSON Web Token successfully verified'
    }
  })
})

router.delete('/:userId', UserController.userDelete)

router.delete('/', UserController.userDeleteAll)

module.exports = router
