const express = require('express')
const router = express.Router()
<<<<<<< HEAD

const CharactersController = require('../controllers/characters.controller')

router.get('/', CharactersController.characters_get_all)

router.get('/:characterId', CharactersController.characters_get)

router.post('/', CharactersController.characters_create)

router.patch('/:characterId', CharactersController.characters_patch)

router.delete('/:characterId', CharactersController.characters_delete)

router.delete('/', CharactersController.characters_delete_all)
=======
const mongoose = require('mongoose')

const Character = require('../models/character.model')

router.get('/', (req, res, next) => {
  Character.find()
  .select('-__v')
  .exec()
  .then(docs => {
    console.log(docs)
    res.status(200).json(docs)
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({
      error: err
    })
  })
})

router.get('/:characterId', (req, res, next) => {
  const id = req.params.characterId
  Character.findById(id)
  .select('-__v')
  .exec()
  .then(doc => {
    console.log('From database: ', doc)
    if(Object.keys(doc).length > 0) {
      res.status(200).json(doc)
    } else {
      res.status(404).json({
        message: 'No valid Character found with provided ID'
      })
    }
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({ error: err })
  })
})

router.post('/', (req, res, next) => {
  const character = new Character ({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    level: req.body.level,
    armorclass: req.body.armorclass,
    hitpoints: req.body.hitpoints,
    maxhitpoints: req.body.maxhitpoints,
    condition: req.body.condition,
    player: req.body.player
  })
  character.save()
  .then(result => {
    console.log(result)
    res.status(201).json({
      message: 'Handling POST request to /Characters',
      createdCharacter: character
    })
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({
      error: err
    })
  })
})

router.patch('/:characterId', (req, res, next) => {
  const id = req.params.characterId
  const updateOps = {}
  for(const ops of req.body) {
    updateOps[ops.propName] = ops.value
  }
  Character.update({ _id: id }, { $set: updateOps }).exec()
  .then(result => {
    console.log(result)
    res.status(200).json(result)
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({
      error: err
    })
  })
})

router.delete('/:characterId', (req, res, next) => {
  const id = req.params.characterId
  Character.deleteOne({ _id: id }).exec()
  .then(result => {
    res.status(200).json(result)
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({
      error: err
    })
  })
})

router.delete('/', (req, res, next) => {
  Character.remove().exec()
  .then(result => {
    res.status(200).json(result)
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({
      error: err
    })
  })
})
>>>>>>> 4380df16195b5b602e3b92999cd1346f03746724

module.exports = router
