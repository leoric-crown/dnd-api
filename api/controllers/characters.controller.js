const config = require('../../config/main')
const endpoint = `${config.host}characters/`
const mongoose = require('mongoose')
const Character = require('../models/character.model')
const validator = require('validator')
const download = require('image-downloader')
const defaultPic = 'https://s3.us-east-2.amazonaws.com/dnd-turntracker-aws/characterPicDefault.jpg'
const wsTypes = require('../socket/wsTypes')
const aws = require('aws-sdk')

aws.config.update({
  secretAccessKey: config.awsSecret,
  accessKeyId: config.awsKey,
  region: 'us-east-1',
  ACL: 'public-read'
})
const s3 = new aws.S3()

const returnError = (err, res) => {
  res.status(500).json({
    error: err.toString()
  })
}

const fetchAndUpload = async (url) => {
  const options = {
    url,
    dest: './uploads/' + new Date().getTime() + url.substring(url.lastIndexOf('/') + 1)
  }
  try {
    const result = await download.image(options)
    console.log('result', result)
    //TODO: upload to aws without saving in filesystem
    const uploadResult = await s3.upload({
      Bucket: 'dnd-turntracker-aws',
      Key: result.filename.substring(result.filename.lastIndexOf('/')+1),
      Body: result.image
    }).promise()
    uploadResult.location = uploadResult.Location
    return uploadResult
  }
  catch (err) {
    return {location: defaultPic}
  }
}

const createCharacter = async (req, res, next) => {
  try {
    console.log('req.file', req.file)
    if (!req.file &&
      req.body.characterPic &&
      validator.isURL(req.body.characterPic)) {
      req.file = await fetchAndUpload(req.body.characterPic)
      console.log('uploadResult', req.file)
    }

    const character = new Character({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      level: req.body.level,
      armorclass: req.body.armorclass,
      hitpoints: (req.body.hitpoints == null ? req.body.maxhitpoints : req.body.hitpoints),
      maxhitpoints: req.body.maxhitpoints,
      conditions: (req.body.conditions == null ? [] : req.body.conditions),
      player: req.body.player,
      user: req.body.player ? req.body.user : null,
      picUrl: req.file ? req.file.location : defaultPic
    })

    const result = await character.save()
    const add = {
      request: {
        type: 'GET',
        url: endpoint + character._id
      }
    }
    const responseBody = {
      status: {
        code: 201,
        message: 'Successfully created new Character document'
      },
      createdCharacter: {
        ...character._doc,
        ...add
      }
    }

    req.app.io.emit(wsTypes.CREATE_CHARACTER, {
      character: responseBody.createdCharacter,
      appId: req.headers.appid
    })
    res.status(201).json(responseBody)
  }
  catch (err) {
    console.log(err)
    res.status(400).json({
      status: {
        code: 400,
        message: 'Error creating Character document'
      }
    })
  }
}

const patchCharacter = async (req, res, next) => {
  try {
    const id = req.params.characterId
    const updateOps = {}
    for (const ops of req.body) {
      updateOps[ops.propName] = ops.value
    }
    const result = await Character.updateOne({ _id: id }, { $set: updateOps }).exec()
    if (result.n === 0) {
      res.status(500).json({
        status: {
          code: 500,
          message: 'Patch failed: Character document not found'
        }
      })
    } else {
      const add = {
        request: {
          type: 'GET',
          url: endpoint + id
        }
      }

      req.app.io.emit(wsTypes.UPDATE_CHARACTER, {
        id,
        appId: req.headers.appid,
        payload: req.body
      })
      res.status(200).json({
        status: {
          code: 200,
          message: 'Successfully patched Character document'
        },
        ...result,
        ...{ _id: id },
        ...add
      })
    }
  }
  catch (err) {
    console.log(err)
    res.status(400).json({
      status: {
        code: 400,
        message: 'Error patching Character document'
      }
    })
  }
}

const deleteCharacter = async (req, res, next) => {
  try {
    const id = req.params.characterId
    const result = await Character.deleteOne({ _id: id }).exec()
    req.app.io.emit(wsTypes.REMOVE_CHARACTER, {
      id,
      appId: req.headers.appid
    })
    res.status(200).json({
      status: {
        code: 200,
        message: 'Successfully deleted Character document'
      },
      ...result
    })
  }
  catch (err) {
    res.status(400).json({
      status: {
        code: 400,
        message: 'Error deleting Character document'
      }
    })
  }
}

const getAllCharacters = async (req, res, next) => {
  const docs = await Character.find()
    .select('-__v')
    .exec()
  return charactersResponse(res, docs)
}

const getUserCharacters = async (req, res, next) => {
  const userId = req.user._id
  const docs = await Character.find({ user: userId })
    .select('-__v')
    .exec()
  return charactersResponse(res, docs, true)
}

const charactersResponse = async (res, docs, userFilter = false) => {
  try {
    const response = {
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
    if (docs) {
      res.status(200).json({
        status: {
          code: 200,
          message: `Successfully fetched all ${userFilter ? "User's" : ''} Character documents`
        },
        ...response
      })
    } else {
      res.status(404).json({
        status: {
          code: 404,
          message: `No documents ${userFilter ? 'for User' : ''} in Character collection`
        }
      })
    }
  }
  catch (err) {
    console.log(err)
    res.status(400).json({
      status: {
        code: 400,
        message: `Error getting ${userFilter ? 'User' : ''} Character documents`
      }
    })
  }
}

const getCharacter = async (req, res, next) => {
  try {
    const id = req.params.characterId
    const character = await Character.findById(id)
      .select('-__v')
      .exec()
    if (character) {
      res.status(200).json({
        status: {
          code: 200,
          message: 'Successfully fetched Character document'
        },
        character
      })
    } else {
      res.status(404).json({
        status: {
          code: 404,
          message: 'No Character document found for provided ID'
        }
      })
    }
  }
  catch (err) {
    res.status(400).json({
      status: {
        code: 400,
        message: 'Error getting Character document'
      }
    })
  }
}

const updateCharacterImage = async (req, res, next) => {
  try {
    const id = req.params.characterId
    const character = await Character.findById(id)
      .select('-__v')
      .exec()
    if (!character) {
      res.status(500).json({
        status: {
          code: 500,
          message: 'Character Image update failed: Character document not found'
        }
      })
    } else {
      const oldPic = character.picUrl
      if (!req.file) {
        if (req.body.characterPic && validator.isURL(req.body.characterPic)) {
          character.picUrl = await fetchImage(req.body.characterPic)
        } else {
          res.status(404).json({
            status: {
              code: 404,
              message: 'Character Image update failed: no valid image or URL found'
            }
          })
        }
      } else {
        character.picUrl = req.file.path.replace('\\', '/')
      }
      const update = await character.save()
      //TODO: delete oldPic
      const add = {
        request: {
          type: 'GET',
          url: endpoint + id
        }
      }
      res.status(200).json({
        status: {
          code: 200,
          message: 'Successfully updated Character Image'
        },
        character,
        ...{ _id: id, picUrl: character.picUrl },
        ...add
      })
    }
  }
  catch (err) {
    console.log(err)
    res.status(400).json({
      status: {
        code: 400,
        message: 'Error updating Character Image'
      }
    })
  }
}

const deleteAllCharacters = async (req, res, next) => {
  try {
    const result = await Character.remove().exec()
    res.status(200).json({
      status: {
        code: 200,
        message: 'Successfully deleted all Character documents'
      },
      ...result
    })
  }
  catch (err) {
    res.status(400).json({
      status: {
        code: 400,
        message: 'Error deleting all Character documents'
      }
    })
  }
}

module.exports = {
  createCharacter,
  updateCharacterImage,
  getAllCharacters,
  getUserCharacters,
  getCharacter,
  patchCharacter,
  deleteCharacter,
  deleteAllCharacters
}
