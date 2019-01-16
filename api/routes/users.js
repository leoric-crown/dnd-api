const express = require('express')
const router = express.Router()
const jwt = require('jsonwebtoken')
const UserController = require('../controllers/users.controller')
const config = require('../../config/main')
const passport = require('passport')
require('../auth/passport')()

const generateToken = (req, res, next) => {
  req.token = jwt.sign({
    id: req.auth.id},
    config.jwtKey,
    {expiresIn: '24h'}
  )
  return next()
}

const sendToken = (req, res, next) => {
  res.setHeader('x-auth-token', req.token)
  return res.status(200).send(JSON.stringify(req.user))
}

router.post('/signup', UserController.userSignup)

router.post('/login', UserController.userLogin)

router.delete('/:userId', UserController.userDelete)

router.delete('/', UserController.userDeleteAll)

router.post('/auth/facebook', passport.authenticate('facebook-token', {session: false}),
  function (req, res, next) {
    console.log(req)
    if(!req.user) {
      return res.send(401, 'User Not Authenticated')
    }
    req.auth = {
      id: req.user._id
    }
    next()
  }, generateToken, sendToken)

module.exports = router
