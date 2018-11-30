const express = require('express')
const router = express.Router()

const UserController = require('../controllers/users.controller')

router.post('/signup', UserController.userSignup)

router.post('/login', UserController.userLogin)

router.delete('/:userId', UserController.userDelete)

router.delete('/', UserController.userDeleteAll)

module.exports = router
