const config = require('../../config/main')
const endpoint = `http://${config.host}:${config.port}/characters/`
const mongoose = require('mongoose')
const Condition = require('../models/condition.model')
const MongoSetting = require('../models/mongoSetting.model')

const returnError = (err, res) => {
  console.log(err)
  res.status(500).json({
    error: err.toString()
  })
}

const getAllConditions = async (req, res, next) => {
  try {
    const docs = await Condition.find().select('-__v').exec()
    const response = {
      message: 'Fetched all Condition Documents',
      count: docs.length,
      conditions: docs.map(doc => {
        const add = {
          request: {
            type: 'GET',
            url:endpoint + doc._id
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
      console.log('No Conditions in Condition Collection')
      res.status(404).json({
        message: 'No Conditions in Condition Collection'
      })
    }
  }
  catch (err) {
    returnError(err, res)
  }
}

const deleteAllConditions = async (req, res, next) => {
  try {
    const result = await Condition.deleteMany().exec()
    const setting = await MongoSetting.deleteOne({ name: 'haveFetchedConditions' }).exec()
    res.status(200).json(result)
  }
  catch (err) {
    returnError(err, res)
  }
}

module.exports = {
  getAllConditions,
  deleteAllConditions
}
