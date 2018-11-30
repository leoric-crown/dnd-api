const express = require('express')
const router = express.Router()

const CharactersController = require('../controllers/characters.controller')

router.get('/', CharactersController.charactersGetAll)

router.get('/:characterId', CharactersController.charactersGet)

router.post('/', CharactersController.charactersCreate)

router.patch('/:characterId', CharactersController.charactersPatch)

router.delete('/:characterId', CharactersController.charactersDelete)

router.delete('/', CharactersController.charactersDeleteAll)

module.exports = router
