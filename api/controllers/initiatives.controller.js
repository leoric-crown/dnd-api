const config = require('../../config/main')
const endpoint = `${config.host}/initiatives/`
const encounterendpoint = `${config.host}/encounters/`
const characterendpoint = `${config.host}/characters/`
const mongoose = require('mongoose')
const Initiative = require('../models/initiative.model')
const Character = require('../models/character.model')
const wsTypes = require('../socket/wsTypes')

const returnError = (err, res) => {
   res.status(500).json({
      status: {
         code: 500,
         message: err.toString()
      }
   })
}

const bulkDeleteInitiatives = async (req, res, next) => {
   try {
      const ids = req.body.list

      if (ids.length > 0) {
         const initiatives = await Initiative.find({
            _id: {
               $in: ids
            }
         })

         const prevActive = initiatives.find(i => i.active === true)
         let newActiveIndex
         let encounterInitiatives = []
         let newActiveId
         if (prevActive) {
            encounterInitiatives = await Initiative
               .find({ encounter: prevActive.encounter })
               .select('-__v -encounter')
               .sort({ initiative: 'desc' })
               .exec()
            if (ids.length === encounterInitiatives.length) {
               newActiveId = -1
            } else {
               prevActiveIndex = encounterInitiatives.map(i => i._id.toString()).indexOf(prevActive._id.toString())
               const reorderEncounter = []
               for (let k = 0; k < encounterInitiatives.length; k++) {
                  reorderEncounter.push(encounterInitiatives[(prevActiveIndex + k) % encounterInitiatives.length])
               }
               newActiveId = reorderEncounter.map(i => i._id).find(id => {
                  return !ids.includes(id.toString())
               })
            }
         }
         const result = await Initiative.deleteMany({
            _id: {
               $in: ids
            }
         })
         if (result.ok && result.n > 0) {
            if (prevActive) {
               if (newActiveId === -1) {
                  req.app.io.emit(wsTypes.CLEAR_ACTIVE_ENCOUNTER, "Please clear active encounter")
               } else {
                  const newActive = await Initiative.findByIdAndUpdate(newActiveId, { $set: { active: true } })
                  req.app.io.emit(wsTypes.SET_NEXT_TURN, {
                     prevActive: null,
                     newActive: newActive
                  })
               }
            }
            req.app.io.emit(wsTypes.BULK_REMOVE_INITIATIVES, {
               list: ids,
               appId: req.headers.appid
            })
            res.status(200).json({
               status: {
                  code: 200,
                  message: "Successfully bulk deleted Initiative documents"
               },
               list: new Array(...ids)
            })
         } else {
            res.status(500).json({
               status: {
                  code: 500,
                  message: "Bulk delete failed, Initiative documents not found"
               }
            })
         }
      }
   } catch (err) {
      console.log(err)
      res.status(400).json({
         status: {
            code: 400,
            message: 'Error bulk deleting Initiative documents'
         }
      })
   }
}

const createInitiative = async (req, res, next) => {
   try {
      const character = await Character.findById(req.body.character)
         .select('-__v')
         .exec()

      const createdInitiatives = []
      const quantity = req.body.quantity > 0 ? req.body.quantity : 1
      const prefix = req.body.prefix ? req.body.prefix : ''
      for (var k = 0; k < quantity; k++) {
         var characterAdd = {}
         const newId = new mongoose.Types.ObjectId()
         if (!character.player) {
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
                  url: `${characterEndpoint}${character.id}`
               }
            }
         }

         const characterStamp = {
            ...character._doc,
            name: `${prefix} ` + (character.player ? character.name : `${character.name} ${k + 1}`),
            ...characterAdd
         }

         const initiative = {
            _id: newId,
            active: false,
            encounter: req.body.encounter._id ? req.body.encounter._id : req.body.encounter,
            character: req.body.character,
            initiative: req.body.initiative,
            active: req.body.active,
            characterStamp: characterStamp
         }

         const add = {
            request: {
               type: 'GET',
               url: endpoint + initiative._id
            }
         }
         createdInitiatives.push({
            initiative,
            character,
            add
         })
      }

      const result = await Initiative.insertMany(createdInitiatives.map(i => i.initiative))

      const responseBody = {
         status: {
            code: 201,
            message: 'Successfully created new Initiative document(s)'
         },
         count: createdInitiatives.length,
         createdInitiatives: createdInitiatives.map(i => {
            return {
               ...i.initiative,
               character,
               ...i.add
            }
         })
      }
      req.app.io.emit(wsTypes.CREATE_INITIATIVE, {
         initiatives: responseBody.createdInitiatives,
         appId: req.headers.appid
      })
      res.status(201).json(responseBody)
   }
   catch (err) {
      res.status(400).json({
         status: {
            code: 400,
            message: 'Error creating Initiative document'
         }
      })
   }
}

const patchInitiative = async (req, res, next) => {
   try {
      const id = req.params.initiativeId
      const updateOps = {}
      for (const ops of req.body) {
         updateOps[ops.propName] = ops.value
      }
      const result = await Initiative.updateOne({ _id: id }, { $set: updateOps }).exec()
      if (result.n === 0) {
         res.status(500).json({
            status: {
               code: 500,
               message: 'Patch failed: Initiative document not found'
            }
         })
      } else {
         const add = {
            request: {
               type: 'GET',
               url: endpoint + id
            }
         }
         req.app.io.emit(wsTypes.UPDATE_INITIATIVE, {
            id,
            appId: req.headers.appid,
            payload: req.body
         })
         res.status(200).json({
            status: {
               code: 200,
               message: 'Successfully patched Initiative document'
            },
            ...result,
            ...{ _id: id },
            ...add
         })
      }
   }
   catch (err) {
      res.status(400).json({
         status: {
            code: 400,
            message: 'Error patching Initiative document'
         }
      })
   }
}

const deleteInitiative = async (req, res, next) => {
   try {
      const id = req.params.initiativeId
      const result = await Initiative.deleteOne({ _id: id }).exec()
      req.app.io.emit(wsTypes.REMOVE_INITIATIVE, {
         id,
         appId: req.headers.appid
      })
      res.status(200).json({
         status: {
            code: 200,
            message: 'Successfully deleted Initiative document'
         },
         ...result
      })
   }
   catch (err) {
      res.status(400).json({
         status: {
            code: 400,
            message: 'Error deleting Initiative document'
         }
      })
   }
}

const setEncounterNextTurn = async (req, res, next) => {
   try {
      const encounterId = req.params.encounterId
      const encounterInitiatives = await Initiative
         .find({ encounter: encounterId })
         .select('-__v -encounter')
         .sort({ initiative: 'desc' })
         .exec()

      const activeInitiative = encounterInitiatives.find(i => i.active === true)
      if (!activeInitiative) {
         const update = await Initiative.findByIdAndUpdate(encounterInitiatives[0]._id, { $set: { active: true } })
         update.active = true
         req.app.io.emit(wsTypes.SET_NEXT_TURN, {
            prevActive: null,
            newActive: update,
            appId: req.headers.appid
         })
         res.status(200).json({
            status: {
               code: 200,
               message: 'Successfully set initial Active Initiative'
            },
            activeInitiative: update
         })
      }
      else {
         const update = await Initiative.findByIdAndUpdate(activeInitiative._id, { $set: { active: false } })
         update.active = false

         index = (encounterInitiatives.indexOf(activeInitiative) + 1) % encounterInitiatives.length
         const newActiveInitiative = await Initiative.findByIdAndUpdate(encounterInitiatives[index]._id,
            { $set: { active: true } })
         newActiveInitiative.active = true

         const prevId = activeInitiative._id
         const add = {}
         if (req.body.deletePrevious) {
            await Initiative.deleteOne({ _id: prevId })
            add.deleted = prevId
         }

         const responseBody = {
            status: {
               code: 200,
               message: 'Successfully updated Active Initiative'
            },
            activeInitiative: encounterInitiatives.length === 1 ? activeInitiative : newActiveInitiative,
            ...add
         }
         const wsMessage = {
            prevActive: activeInitiative._doc,
            newActive: responseBody.activeInitiative,
            appId: req.headers.appid,
            ...add
         }
         req.app.io.emit(wsTypes.SET_NEXT_TURN, wsMessage)
         res.status(200).json(responseBody)
      }

   }
   catch (err) {
      res.status(400).json({
         status: {
            code: 400,
            message: "Error setting Encounter's active turn"
         }
      })
   }
}

const patchCharacterStamp = async (req, res, next) => {
   try {
      const id = req.params.initiativeId
      var initiative = await Initiative.findById(id).exec()
      if (initiative.n === 0) {
         res.status(500).json({
            error: 'Patch failed: Initiative document not found.'
         })
      }
      if (initiative._doc.characterStamp.player) {
         res.status(500).json({
            error: 'Character is Player Character, use /character endpoint instead.'
         })
      } else {
         const { characterStamp } = initiative._doc
         for (const ops of req.body) {
            characterStamp[ops.propName] = ops.value
         }

         const result = await Initiative.updateOne({ _id: id }, { characterStamp }).exec()
         if (result.n !== 0) {
            const add = {
               request: {
                  type: 'GET',
                  url: endpoint + id
               }
            }
            req.app.io.emit(wsTypes.UPDATE_INITIATIVE_STAMP, {
               id,
               appId: req.headers.appid,
               payload: req.body
            })
            res.status(200).json({
               status: {
                  code: 200,
                  message: 'Successfully patched Initiative Character stamp'
               },
               ...result,
               ...{ _id: id },
               ...add
            })
         }
      }
   }
   catch (err) {
      res.status(400).json({
         status: {
            code: 400,
            message: 'Error patching Initiative document'
         }
      })
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
               message: 'Successfully fetched all Initiative documents'
            },
            ...response
         })
      } else {
         res.status(404).json({
            status: {
               code: 404,
               message: 'No documents in Initiative collection'
            }
         })
      }
   }
   catch (err) {
      res.status(400).json({
         status: {
            code: 400,
            message: 'Error getting Initiative documents'
         }
      })
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
      if (doc) {
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
            request: {
               type: 'GET',
               url: endpoint + doc._id
            }
         }
         const initiativeDoc = { ...doc._doc, ...add }
         res.status(200).json({
            status: {
               code: 200,
               message: 'Successfully fetched Initiative document'
            },
            initiative: initiativeDoc
         })
      }
      else {
         res.status(404).json({
            status: {
               code: 404,
               message: 'No Initiative document found for provided ID'
            }
         })
      }
   }
   catch (err) {
      res.status(400).json({
         status: {
            code: 400,
            message: 'Error getting Initiative document'
         }
      })
   }
}

const getEncounterInitiative = async (req, res, next) => {
   try {
      const encounterId = req.params.encounterId
      const docs = await Initiative.find({ encounter: encounterId })
         .select('-__v -encounter')
         .populate('character encounter')
         .sort({ initiative: 'desc' })
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
               character: { ...character, ...characterRequest },
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
               message: 'Successfully fetched Initiative documents for given Encounter'
            },
            ...response
         })
      } else {
         res.status(404).json({
            status: {
               code: 404,
               message: 'No Initiative documents found for provided ID'
            }
         })
      }
   }
   catch (err) {
      res.status(400).json({
         status: {
            code: 400,
            message: 'Error getting Initiative documents for Encounter'
         }
      })
   }
}

const deleteAllInitiatives = async (req, res, next) => {
   try {
      const result = await Initiative.remove().exec()
      res.status(200).json({
         status: {
            code: 200,
            message: 'Successfully deleted all Initiative documents'
         },
         ...result
      })
   }
   catch (err) {
      res.status(400).json({
         status: {
            code: 400,
            message: 'Error deleting all Initiative documents'
         }
      })
   }
}

module.exports = {
   createInitiative,
   getAllInitiatives,
   getInitiative,
   getEncounterInitiative,
   setEncounterNextTurn,
   patchInitiative,
   patchCharacterStamp,
   deleteInitiative,
   deleteAllInitiatives,
   bulkDeleteInitiatives
}
