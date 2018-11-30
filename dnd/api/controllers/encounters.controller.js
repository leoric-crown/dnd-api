const config = require('../../config/main')
const endpoint = `http://${config.host}:${config.port}/encounters/`
const mongoose = require('mongoose')
const Encounter = require('../models/encounter.model')

const returnError = (err, res) => {
  console.log(err)
  res.status(500).json({
    error: err.toString()
  })
}

const encountersCreate = async(req, res, next) => {
  try{
    const encounter = new Encounter ({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      status: req.body.status
    })
    const result = await encounter.save()
    const add = {
      request: {
        type: 'GET',
        url: endpoint + encounter._id
      }
    }
    console.log(result)
    res.status(201).json({
      message: 'Successfully created new Encounter record.',
      createdEncounter: {...encounter._doc, ...add}
    })
  }
  catch(err) {
    returnError(err, res)
  }
}

const encountersGetAll = async (req, res, next) => {
  try {
    const docs = await Encounter.find().select('-__v').exec()
    const response = {
      message: 'Fetched all Encounter Documents',
      count: docs.length,
      encounters: docs.map(doc => {
        const add = {
          request: {
            type: 'GET',
            url: endpoint + doc._id
          }
        }
        return {
          ...doc._doc,
          ...add
        }
      })
    }
    if(docs) {
      console.log(response)
      res.status(200).json(response)
    } else {
      console.log('No Encounters in Encounter Collection')
      res.status(404).json({
        message: 'No Encounters in Encounter Collection'
      })
    }
  }
  catch(err) {
    returnError(err, res)
  }
}

const encountersGet = async (req, res, next) => {
  const id = req.params.encounterId
  try{
    const doc = await Encounter.findById(id).select('-__v').exec()
    if(doc) {
      console.log(doc)
      res.status(200).json(doc)
    } else {
      res.status(404).json({
        message: 'No valid Encounter found with provided ID'
      })
    }
  }
  catch (err) {
    returnError(err, res)
  }
}

const encountersPatch = async (req, res, next) => {
  try {
    const id = req.params.encounterId
    const updateOps = {}
    for(const ops of req.body) {
      updateOps[ops.propName] = ops.value
    }
    const result = await Encounter.updateOne({ _id: id }, { $set: updateOps }).exec()
    if(result.n === 0) {
      const message = 'Patch failed: Encounter not found.'
      console.log(message)
      res.status(500).json({
        error: message
      })
    } else {
      console.log(result)
      const add = {
        request:{
          type: 'GET',
          url: endpoint + id
        }
      }
      res.status(200).json({...result, ...{_id: id}, ...add})
    }
  }
  catch (err) {
    returnError(err, res)
  }
}

const encountersDelete = async (req, res, next) => {
  try {
    const id = req.params.encounterId
    const result = await Encounter.deleteOne({ _id: id }).exec()
    res.status(200).json(result)
  }
  catch (err) {
    returnError(err, res)
  }
}

const encountersDeleteAll = async (req, res, next) => {
  try{
    const result = await Encounter.remove().exec()
    res.status(200).json(result)
  }
  catch (err) {
    returnError(err, res)
  }
}

module.exports = {
  encountersCreate,
  encountersGetAll,
  encountersGet,
  encountersPatch,
  encountersDelete,
  encountersDeleteAll
}
