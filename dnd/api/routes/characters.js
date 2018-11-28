const express = require('express')
const router = express.Router()

const CharactersController = require('../controllers/characters.controller')

router.get('/', CharactersController.characters_get_all)

router.get('/:characterId', CharactersController.characters_get)

router.post('/', CharactersController.characters_create)

router.patch('/:characterId', CharactersController.characters_patch)

router.delete('/:characterId', CharactersController.characters_delete)

router.delete('/', CharactersController.characters_delete_all)

module.exports = router
