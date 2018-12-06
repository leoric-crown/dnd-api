const config = require('../../config/main')
const endpoint = `http://${config.host}:${config.port}/initiatives/`
const encounterEndpoint = `http://${config.host}:${config.port}/encounters/`
const characterEndpoint = `http://${config.host}:${config.port}/characters/`
const mongoose = require('mongoose')
const Initiative = require('../models/initiative.model')
const Character = require ('../models/character.model')


const returnError = (err, res) => {
  console.log(err)
  res.status(500).json({
    error: err.toString()
  })
}

const createInitiative = async (req, res, next) => {
  try {
    const character = await Character.findById(req.body.character)
    .select('-__v -_id')
    .exec()
    const overrideHp = {}
    var characterAdd = {}
    const newId = new mongoose.Types.ObjectId()
    if(!character.player) {
      characterAdd = {
        hitpoints: character.maxhitpoints,
        request: {
          type: 'GET',
          url: endpoint + newId + '/character'
        }
      }
    } else {
      characterAdd = {
        request: {
          type: 'GET',
          url: characterEndpoint + req.body.character
        }
      }
    }
    const characterStamp = {
      ...character._doc,
      ...characterAdd
    }

    const initiative = new Initiative ({
      _id: newId,
      encounter: req.body.encounter,
      character: req.body.character,
      initiative: req.body.initiative,
      active: req.body.active,
      characterStamp: characterStamp
    })
    const result = await initiative.save()

    const add = {
      request: {
        type: 'GET',
        url: endpoint + initiative._id
      }
    }

    res.status(201).json({
      message: 'Successfully created new Initiative document',
      createdInitiative: {
        ...initiative._doc,
        ...add
      }
    })
  }
  catch (err) {
    returnError(err, res)
  }
}

const getAllInitiatives = async (req, res, next) => {
  try {
    const docs = await Initiative.find().select('-__v')
    .populate({
    path: 'character',
    select: '-__v',
    })
    .exec()
    const response = {
      message: 'Fetched all Initiative documents',
      count: docs.length,
      initiatives: docs.map(doc => {
        const add = {
          request:{
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
      res.status(200).json(response)
    } else {
      res.status(404).json({
        message: 'No documents in Initiative collection'
      })
    }
  }
  catch (err) {
    returnError(err, res)
  }
}

const getInitiative = async (req, res, next) => {
  try {
    const id = req.params.initiativeId
    const doc = await Initiative.findById(id)
      .select('-__v')
      .populate({
      path: ' character',
      select: '-__v',
      })
      .exec()
    if(doc) {
      const encounterRequest = {
        _id: doc.encounter._id,
        request: {
          type: 'GET',
          url: encounterEndpoint + doc.encounter._id
        }
      }
      const characterRequest = {
          request: {
            type: 'GET',
            url: characterEndpoint + doc.character._id
          }
      }
      const character = doc._doc.character._doc
      const encounter = doc._doc.encounter._doc
      const add = {
        encounter: {
          ...encounter,
           ...encounterRequest
         },
        character: {
          ...character,
           ...characterRequest
         },
        request:{
          type: 'GET',
          url: endpoint + doc._id
        }
      }
      const response =  {...doc._doc, ...add}
      res.status(200).json(response)
    }
    else{
      res.status(404).json({ error: 'No Initiative document found for provided ID'})
    }
  }
  catch (err) {
    returnError(err, res)
  }
}

const getEncounterInitiative = async (req, res, next) => {
  try {
    const encounterId = req.params.encounterId
    const docs = await Initiative.find({encounter: encounterId})
    .select('-__v -encounter')
    .populate('character encounter')
    .sort({initiative: 'desc'})
    .exec()
    const response = {
      message: 'Fetched Initiative documents for Encounter',
      encounter: encounterId,
      count: docs.length,
      initiatives: docs.map(doc => {
        const characterRequest = {
            _id: doc.character._id,
            request: {
              type: 'GET',
              url: characterEndpoint + doc.character._id
            }
        }
        const character = doc._doc.character._doc
        const add = {
          character: {...character, ...characterRequest},
          request:{
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
      res.status(200).json(response)
    } else {
      res.status(404).json({
        message: 'No Initiative documents found for provided Encounter Id'
      })
    }
  }
  catch (err) {
    returnError(err, res)
  }
}

const patchInitiative = async (req, res, next) => {
  try {
    const id = req.params.initiativeId
    const updateOps = {}
    for(const ops of req.body) {
      updateOps[ops.propName] = ops.value
    }
    const result = await Initiative.updateOne({ _id: id }, { $set: updateOps }).exec()
    if(result.n === 0 ) {
      res.status(500).json({
        error: 'Patch failed: Initiative document not found.'
      })
    } else {
      const add = {
        request:{
          type: 'GET',
          url: endpoint + id
        }
      }
      res.status(200).json({
        ...result,
        ...{_id: id},
        ...add})
    }
  }
  catch (err) {
    returnError(err, res)
  }
}

const patchCharacter = async (req, res, next) => {
  try{
    const id = req.params.initiativeId
    var initiative = await Initiative.findById(id).exec()
    if(initiative.n === 0) {
      res.status(500).json({
        error: 'Patch failed: Initiative document not found.'
      })
    }
    if(initiative._doc.characterStamp.player) {
      res.status(500).json({
        error: 'Character is Player Character, use /character endpoint instead.'
      })
    } else {
      const { characterStamp } = initiative._doc
      for(const ops of req.body) {
        characterStamp[ops.propName] = ops.value
      }

      const result = await Initiative.updateOne({_id: id}, {characterStamp}).exec()
      if(result.n !== 0) {
        const add = {
          request:{
            type: 'GET',
            url: endpoint + id
          }
        }
        res.status(200).json({
          ...result,
          ...{_id: id},
          ...add})
      }
    }
  }
  catch (err) {
    returnError(err, res)
  }
}

const deleteInitiative = async (req, res, next) => {
  try {
    const id = req.params.initiativeId
    const result = await Initiative.deleteOne({ _id: id })
    .exec()
    res.status(200).json(result)
  }
  catch (err) {
    returnError(err, res)
  }
}

const deleteAllInitiatives = async (req, res, next) => {
  try {
    const result = await Initiative.remove().exec()
    res.status(200).json(result)
  }
  catch (err) {
    returnError(err, res)
  }
}

module.exports = {
  createInitiative,
  getAllInitiatives,
  getInitiative,
  getEncounterInitiative,
  patchInitiative,
  patchCharacter,
  deleteInitiative,
  deleteAllInitiatives
}
