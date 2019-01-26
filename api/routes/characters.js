const express = require('express')
const router = express.Router()

const CharactersController = require('../controllers/characters.controller')

router.get('/', CharactersController.getAllCharacters)

router.get('/:userId', CharactersController.getUserCharacters)

router.get('/:characterId', CharactersController.getCharacter)

router.post('/', CharactersController.createCharacter)

router.patch('/:characterId', CharactersController.patchCharacter)

router.delete('/:characterId', CharactersController.deleteCharacter)

router.delete('/', CharactersController.deleteAllCharacters)

module.exports = router
