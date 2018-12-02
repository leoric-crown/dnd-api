const config = require('../../config/main')
const endpoint = `http://${config.host}:${config.port}/characters/`
const mongoose = require('mongoose')
const Character = require('../models/character.model')

const returnError = (err, res) => {
  console.log(err)
  res.status(500).json({
    error: err.toString()
  })
}

const createCharacter = async (req, res, next) => {
  try {
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

    const result = await character.save()
    const add = {
      request: {
        type: 'GET',
        url: endpoint + character._id
      }
    }
    res.status(201).json({
      message: 'Successfully created new Character document',
      createdCharacter: {
        ...character._doc,
        ...add
      }
    })
  }
  catch (err) {
    returnError(err, res)
  }
}

const getAllCharacters = async (req, res, next) => {
  try{
    const docs = await Character.find()
    .select('-__v')
    .populate({
      path: 'condition',
      select: '-__v'
    })
    .exec()
    const response = {
      message: 'Fetched all Character documents',
      count: docs.length,
      characters: docs.map(doc => {
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
      res.status(200).json(response)
    } else {
      res.status(404).json({
        message: 'No documents in Character collection'
      })
    }
  }
  catch(err) {
    returnError(err, res)
  }
}

const getCharacter = async (req, res, next) => {
  try {
    const id = req.params.characterId
    const doc = await Character.findById(id)
    .populate({
      path: 'condition',
      select: '-__v'
    })
    .select('-__v')
    .exec()
    if(doc) {
      res.status(200).json(doc)
    } else {
      res.status(404).json({
        message: 'No Character document found for provided ID'
      })
    }
  }
  catch (err) {
    returnError(err, res)
  }
}

const patchCharacter = async (req, res, next) => {
  try{
    const id = req.params.characterId
    const updateOps = {}
    for(const ops of req.body) {
      updateOps[ops.propName] = ops.value
    }
    const result = await Character.updateOne({ _id: id }, { $set: updateOps }).exec()
    if(result.n === 0) {
      const message = 'Patch failed: Character document not found.'
      res.status(500).json({
        error: message
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
        ...add
      })
    }
  }
  catch (err) {
    returnError(err, res)
  }
}

const deleteCharacter = async (req, res, next) => {
  try {
    const id = req.params.characterId
    const result = await Character.deleteOne({ _id: id }).exec()
    res.status(200).json(result)
  }
  catch (err) {
    returnError(err, res)
  }
}

const deleteAllCharacters = async (req, res, next) => {
  try {
    const result = await Character.remove().exec()
    res.status(200).json(result)
  }
  catch (err) {
    returnError(err, res)
  }
}

module.exports = {
  createCharacter,
  getAllCharacters,
  getCharacter,
  patchCharacter,
  deleteCharacter,
  deleteAllCharacters
}
