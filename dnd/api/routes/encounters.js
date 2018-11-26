const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')

const Encounter = require('../models/encounter.model')

router.get('/', (req, res, next) => {
  Encounter.find()
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

router.post('/', (req, res, next) => {
  console.log(req.body)
  const encounter = new Encounter ({
    _id: new mongoose.Types.ObjectId(),
    name: req.body.name,
    status: req.body.status
  })
  encounter.save()
  .then(result => {
    console.log(result)
    res.status(201).json({
      message: 'Handling POST request to /encounters',
      createdEncounter: encounter
    })
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({
      error: err
    })
  })
})

router.get('/:encounterId', (req, res, next) => {
  const id = req.params.encounterId
  Encounter.findById(id)
  .select('-__v')
  .exec()
  .then(doc => {
    console.log('From database: ', doc)
    if(Object.keys(doc).length > 0) {
      res.status(200).json(doc)
    } else {
      res.status(404).json({
        message: 'No valid Encounter found with provided ID'
      })
    }
  })
  .catch(err => {
    console.log(err)
    res.status(500).json({ error: err })
  })
})

router.patch('/:encounterId', (req, res, next) => {
  const id = req.params.encounterId
  const updateOps = {}
  for(const ops of req.body) {
    updateOps[ops.propName] = ops.value
  }
  Encounter.update({ _id: id }, { $set: updateOps }).exec()
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

router.delete('/:encounterId', (req, res, next) => {
  const id = req.params.encounterId
  Encounter.deleteOne({ _id: id }).exec()
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
  Encounter.remove().exec()
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

module.exports = router
