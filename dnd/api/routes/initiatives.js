const express = require('express')
const router = express.Router()
<<<<<<< HEAD

const InitiativesController = require('../controllers/initiatives.controller')

router.post('/', InitiativesController.initiatives_create)

router.get('/', InitiativesController.initiatives_get_all)

router.get('/:initiativeId', InitiativesController.initiatives_get)

router.get('/encounter/:encounterId', InitiativesController.initiatives_get_encounter)

router.patch('/:initiativeId', InitiativesController.initiatives_patch)

router.delete('/:initiativeId', InitiativesController.initiatives_delete)

router.delete('/', InitiativesController.initiatives_delete_all)
=======
const mongoose = require('mongoose')

const Initiative = require('../models/initiative.model')
const Character = require('../models/character.model')

router.get('/', (req, res, next) => {
  Initiative.find()
  .select('-__v')
  .populate({
    path: ' encounter character',
    select: '-__v',
  })
  .exec()
  .then(docs => {
    const response = {
      message: 'Fetched all Initiative Documents',
      count: docs.length,
      initiatives: docs.map(doc => {
        const characterRequest = {
            request: {
              type: 'GET',
              url: 'http://localhost:3000/characters/' + doc.character._id
            }
        }
        const character = doc._doc.character._doc
        const add = {
          character: {...character, ...characterRequest},
          request:{
            type: 'GET',
            url: 'http://localhost:3000/initiatives/' + doc._id
          }
        }

        return {...doc._doc, ...add}
      })
    }
    if(docs) {
      res.status(200).json(response)
    } else {
      res.status(404).json({
        message: 'No Initiatives found for provided Encounter Id'
      })
    }
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({
      error: err
    })
  })
})

router.get('/:initiativeId', (req, res, next) => {
  const id = req.params.initiativeId
  Initiative.findById(id)
  .select('-__v')
  .exec()
  .then(doc => {
    const characterRequest = {
        request: {
          type: 'GET',
          url: 'http://localhost:3000/characters/' + doc.character._id
        }
    }
    const add = {
      character: {...doc._doc, ...characterRequest},
      request:{
        type: 'GET',
        url: 'http://localhost:3000/initiatives/' + doc._id
      }
    }

    const response =  {...doc._doc, ...add}
    res.status(200).json(response)
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({ error: err })
  })
})

router.get('/encounter/:encounterId', (req, res, next) => {
  const encounterId = req.params.encounterId
  Initiative.find({encounter: encounterId})
  .select('-__v -encounter')
  .sort({initiative: 'desc'})
  .populate({
    path: 'character',
    select: '-__v',
  })
  .exec()
  .then(docs => {
    const response = {
      message: 'Fetched Initiative Documents for Encounter',
      encounter: encounterId,
      count: docs.length,
      initiatives: docs.map(doc => {
        const characterRequest = {
            request: {
              type: 'GET',
              url: 'http://localhost:3000/characters/' + doc.character._id
            }
        }
        const character = doc._doc.character._doc
        const add = {
          character: {...character, ...characterRequest},
          request:{
            type: 'GET',
            url: 'http://localhost:3000/initiatives/' + doc._id
          }
        }

        return {...doc._doc, ...add}
      })
    }
    if(docs) {
      res.status(200).json(response)
    } else {
      res.status(404).json({
        message: 'No Initiatives found for provided Encounter Id'
      })
    }
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({ error: err })
  })
})

router.post('/', (req, res, next) => {
  console.log(req.body)
  const initiative = new Initiative ({
    _id: new mongoose.Types.ObjectId(),
    encounter: req.body.encounter,
    character: req.body.character,
    initiative: req.body.initiative,
    active: req.body.active
  })
  initiative.save()
  .then(result => {
    console.log(result)
    res.status(201).json({
      message: 'Handling POST request to /initiatives',
      createdInitiative: initiative
    })
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({
      error: err
    })
  })
})

router.get('/:initiativeId', (req, res, next) => {
  const id = req.params.initiativeId
  Initiative.findById(id)
  .select('-__v')
  .exec()
  .then(doc => {
    console.log('From database: ', doc)
    if(Object.keys(doc).length > 0) {
      res.status(200).json(doc)
    } else {
      res.status(404).json({
        message: 'No valid Initiative found with provided ID'
      })
    }
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({ error: err })
  })
})

router.patch('/:initiativeId', (req, res, next) => {
  const id = req.params.initiativeId
  const updateOps = {}
  for(const ops of req.body) {
    updateOps[ops.propName] = ops.value
  }
  Initiative.update({ _id: id }, { $set: updateOps })
  .exec()
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

router.delete('/:initiativeId', (req, res, next) => {
  const id = req.params.initiativeId
  Initiative.deleteOne({ _id: id })
  .exec()
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
  Initiative.remove()
  .exec()
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
