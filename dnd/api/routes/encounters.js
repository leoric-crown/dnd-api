const express = require('express')
const router = express.Router()
const passport = require('passport')
const EncountersController = require('../controllers/encounters.controller')

require('../auth/authenticator')(passport)
const authenticate = passport.authenticate('jwt', { session: false })

router.get('/', authenticate, EncountersController.encountersGetAll)

router.get('/:encounterId', EncountersController.encountersGet)

router.post('/', EncountersController.encountersCreate)

router.patch('/:encounterId', EncountersController.encountersPatch)

router.delete('/:encounterId', EncountersController.encountersDelete)

router.delete('/', EncountersController.encountersDeleteAll)

module.exports = router
