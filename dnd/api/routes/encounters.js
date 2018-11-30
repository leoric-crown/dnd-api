const express = require('express')
const router = express.Router()
const passport = require('passport')
const EncountersController = require('../controllers/encounters.controller')

require('../auth/authenticator')(passport)
const authenticate = passport.authenticate('jwt', { session: false })

router.get('/', authenticate, EncountersController.encounters_get_all)

router.get('/:encounterId', EncountersController.encounters_get)

router.post('/', EncountersController.encounters_create)

router.patch('/:encounterId', EncountersController.encounters_patch)

router.delete('/:encounterId', EncountersController.encounters_delete)

router.delete('/', EncountersController.encounters_delete_all)

module.exports = router
