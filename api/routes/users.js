const express = require('express')
const router = express.Router()
const tokens = require('../auth/token.utils')
const UserController = require('../controllers/users.controller')
const config = require('../../config/main')
const passport = require('passport')
require('../auth/passport')()

router.post('/signup', UserController.userSignup)

router.post('/login', UserController.userLogin)

router.delete('/:userId', UserController.userDelete)

router.delete('/', UserController.userDeleteAll)

router.post('/auth/facebook', passport.authenticate('facebook-token', {session: false}), tokens.sendToken)

module.exports = router
