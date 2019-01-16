const config = require('../../config/main')
const endpoint = `http://${config.host}:${config.port}/conditions/`
const mongoose = require('mongoose')
const Condition = require('../models/condition.model')
const MongoSetting = require('../models/mongoSetting.model')

const returnError = (err, res) => {
  res.status(500).json({
    error: err.toString()
  })
}

const createCondition = async (req, res, next) => {
  try {
    const condition = new Condition({
      _id: new mongoose.Types.ObjectId(),
      name: req.body.name,
      desc: req.body.desc,
      fromApi: false
    })
    const result = await condition.save()

    const add = {
      request: {
        type: 'GET',
        url: endpoint + condition._id
      }
    }

    res.status(201).json({
      status: {
        code: 201,
        message: 'Successfully created new Condition document.'
      },
      createdCondition: {
        ...condition._doc,
        ...add
      }
    })
  }
  catch (err) {
    res.status(400).json({
      status:{
        code: 400,
        message: 'Error creating Condition document'
      }
    })
  }
}

const getAllConditions = async (req, res, next) => {
  try {
    const docs = await Condition.find().select('-__v').exec()
    const response = {
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
      res.status(200).json({
        status: {
          code: 200,
          message: 'Successfully fetched all Condition documents'
        },
        ...response
      })
    } else {
      res.status(404).json({
        status: {
          code: 404,
          message: 'No documents in Condition collection'
        }
      })
    }
  }
  catch (err) {
    res.status(400).json({
      status:{
        code: 400,
        message: 'Error getting Condition documents'
      }
    })
  }
}

const getCondition = async (req, res, next) => {
  try {
    const id = req.params.conditionId
    const doc = await Condition.findById(id)
    .select('-__v')
    .exec()
    if(doc) {
      res.status(200).json({
        status: {
          code: 200,
          message: 'Successfully fecthed Condition document'
        },
        ...doc._doc
      })
    } else {
      res.status(404).json({
        status: {
          code: 404,
          message: 'No Condition document found for provided ID'
        }
      })
    }
  }
  catch (err) {
    res.status(400).json({
      status:{
        code: 400,
        message: 'Error fetching Condition document'
      }
    })
  }
}

const patchCondition = async (req, res, next) => {
  try {
    const id = req.params.conditionId
    const updateOps = {}
    for(const ops of req.body) {
      updateOps[ops.propName] = ops.value
    }
    const result = await Condition.updateOne({ _id: id }, { $set: updateOps }).exec()
    if(result.n === 0) {
      res.status(500).json({
        status: {
          code: 500,
          message: 'Patch failed: Condition document not found.'
        }
      })
    } else {
      const add = {
        request:{
          type: 'GET',
          url: endpoint + id
        }
      }
      res.status(200).json({
        status: {
          code: 200,
          message: 'Successfully patched Condition document'
        },
        ...result,
        ...{_id: id},
        ...add
      })
    }
  }
  catch (err) {
    res.status(400).json({
      status:{
        code: 400,
        message: 'Error patching Condition document'
      }
    })
  }
}

const deleteCondition = async (req, res, next) => {
  try {
    const id = req.params.conditionId
    const result = await Condition.deleteOne({ _id: id }).exec()
    res.status(200).json({
      status: {
        code: 200,
        message: 'Successfully deleted Condition document'
      },
      ...result
    })
  }
  catch (err) {
    res.status(400).json({
      status:{
        code: 400,
        message: 'Error deleting Condition document'
      }
    })
  }
}

const deleteAllConditions = async (req, res, next) => {
  try {
    const result = await Condition.deleteMany().exec()
    const setting = await MongoSetting.deleteOne({ name: 'haveFetchedConditions' }).exec()
    res.status(200).json({
      status: {
        code: 200,
        message: 'Successfully deleted all Condition documents'
      },
      ...result
    })
  }
  catch (err) {
    res.status(400).json({
      status:{
        code: 400,
        message: 'Error deleting all Condition documents'
      }
    })
  }
}

module.exports = {
  createCondition,
  getAllConditions,
  getCondition,
  patchCondition,
  deleteCondition,
  deleteAllConditions
}
