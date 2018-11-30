const express = require('express')
const router = express.Router()

const InitiativesController = require('../controllers/initiatives.controller')

router.post('/', InitiativesController.initiativesCreate)

router.get('/', InitiativesController.initiativesGetAll)

router.get('/:initiativeId', InitiativesController.initiativesGet)

router.get('/encounter/:encounterId', InitiativesController.initiativesGetEncounter)

router.patch('/:initiativeId', InitiativesController.initiativesPatch)

router.delete('/:initiativeId', InitiativesController.initiativesDelete)

router.delete('/', InitiativesController.initiativesDeleteAll)

module.exports = router
