const express = require('express')
const router = express.Router()

const UserController = require('../controllers/users.controller')

router.post('/signup', UserController.user_signup)

router.post('/login', UserController.user_login)

router.delete('/:userId', UserController.user_delete)

router.delete('/', UserController.user_delete_all)

module.exports = router
