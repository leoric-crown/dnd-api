const express = require('express')
const router = express.Router()

const InitiativesController = require('../controllers/initiatives.controller')

router.post('/', InitiativesController.initiatives_create)

router.get('/', InitiativesController.initiatives_get_all)

router.get('/:initiativeId', InitiativesController.initiatives_get)

router.get('/encounter/:encounterId', InitiativesController.initiatives_get_encounter)

router.patch('/:initiativeId', InitiativesController.initiatives_patch)

router.delete('/:initiativeId', InitiativesController.initiatives_delete)

router.delete('/', InitiativesController.initiatives_delete_all)

module.exports = router
