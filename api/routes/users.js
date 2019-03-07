const express = require('express')
const router = express.Router()
const tokens = require('../auth/token.utils')
const UserController = require('../controllers/users.controller')
const config = require('../../config/main')
const passport = require('passport')
const endpoint = `http://${config.host}:${config.port}/users/`

require('../auth/passport')()
const authenticate = passport.authenticate('jwt', { session: false })
const authenticateFb = passport.authenticate('facebook-token', { session: false })

router.post('/signup', UserController.userSignup)

router.post('/login', UserController.userLogin)

router.post('/auth/facebook', authenticateFb, (req, res) => tokens.sendToken(req, res, true))

router.post('/verifyToken', authenticate, (req, res) => {
  const { password,  _v, facebookProvider, ...user } = req.user._doc
  res.status(200).json({
    ...user,
    request: {
      type: 'GET',
      url: endpoint + user._id
    },
    status: {
      code: 200,
      message: 'JSON Web Token successfully verified'
    }
  })
})

router.patch('/:userId', authenticate, UserController.patchUser)

router.delete('/:userId', authenticate, UserController.userDelete)

router.delete('/', authenticate, UserController.userDeleteAll)

router.post('/forgotpassword', UserController.forgotPassword)

router.post('/resetPassword', authenticate, UserController.resetPassword)

module.exports = router
