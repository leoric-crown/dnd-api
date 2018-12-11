const express = require('express')
const router = express.Router()
const passport = require('passport')
const EncountersController = require('../controllers/encounters.controller')

require('../auth/authenticator')(passport)
const authenticate = passport.authenticate('jwt', { session: false })

router.get('/', EncountersController.getAllEncounters)

router.get('/:encounterId', EncountersController.getEncounter)

router.post('/', EncountersController.createEncounter)

router.patch('/:encounterId', EncountersController.patchEncounter)

router.delete('/:encounterId', EncountersController.deleteEncounter)

router.delete('/', EncountersController.deleteAllEncounters)

module.exports = router
