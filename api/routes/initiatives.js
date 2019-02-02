const express = require('express')
const router = express.Router()
const InitiativesController = require('../controllers/initiatives.controller')

router.post('/', InitiativesController.createInitiative)

router.post('/:encounterId/nextTurn', InitiativesController.setEncounterNextTurn)

router.get('/', InitiativesController.getAllInitiatives)

router.get('/:initiativeId', InitiativesController.getInitiative)

router.get('/:encounterId', InitiativesController.getEncounterInitiative)

router.patch('/:initiativeId', InitiativesController.patchInitiative)

router.patch('/:initiativeId/character', InitiativesController.patchCharacter)

router.delete('/:initiativeId', InitiativesController.deleteInitiative)

router.delete('/', InitiativesController.deleteAllInitiatives)

module.exports = router
