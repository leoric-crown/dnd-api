const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const tokens = require('../auth/token.utils')
const config = require('../../config/main')
const endpoint = `http://${config.host}:${config.port}/users/`
const User = require('../models/user.model');
const ExtractJwt = require('passport-jwt').ExtractJwt

const returnError = (err, res) => {
  res.status(500).json({
    status: {
      code: 500,
      message: err.toString()
    }
  })
}

const returnAuthError = res => {
  res.status(401).json({
    status: {
      code: 401,
      message: 'Authentication failed'
    }
  })
}

const readOnlyFields = [
  'email',
  'password',
  'facebookProvider'
]

const patchUser = async (req, res, next) => {
  try {
    const id = req.params.userId
    if (req.user.id !== id) {
      res.status(403).json({
        status: {
          code: 403,
          message: 'Patch failed: Insufficient privileges'
        }
      })
    }
    const updateOps = {}
    for (const ops of req.body) {
      if (!readOnlyFields.includes(ops.propName))
        updateOps[ops.propName] = ops.value
    }

    const result = await User.updateOne({ _id: id }, { $set: updateOps }).exec()
    if (result.n === 0) {
      res.status(500).json({
        status: {
          code: 500,
          message: 'Patch failed: User document not found'
        }
      })
    }
    else {
      res.status(200).json({
        status: {
          code: 200,
          message: 'Successfully patched User document'
        },
        ...result,
        _id: id,
        request: {
          type: 'GET',
          url: endpoint + id
        }
      })
    }
  } catch (err) {
    console.log(err)
    res.status(400).json({
      status: {
        code: 400,
        message: 'Error patching User document'
      }
    })
  }
}

const userSignup = async (req, res, next) => {
  try {
    const user = await User.find({ email: req.body.email }).exec()
    if (user.length >= 1) {
      return res.status(409).json({
        status: {
          code: 409,
          message: 'E-mail is already registered'
        }
      })
    } else {
      const hash = await bcrypt.hash(req.body.password, 10)
      const user = new User({
        _id: new mongoose.Types.ObjectId(),
        email: req.body.email,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        isDM: !req.body.isDM ? false : req.body.isDM,
        password: hash,
      })

      const result = await user.save()

      const { password, ...noPassword } = user._doc
      req.user = noPassword
      tokens.sendToken(req, res)
    }
  }
  catch (err) {
    returnError(err, res)
  }
}

const userLogin = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email })
      .select('-__v')
      .exec()
    if (user.length < 1) {
      returnAuthError(res)
    } else {
      const result = await bcrypt.compare(req.body.password, user.password)
      if (result) {
        const { password, ...noPassword } = user._doc
        req.user = noPassword
        tokens.sendToken(req, res)
      }
      else {
        returnAuthError(res)
      }
    }
  }
  catch (err) {
    returnAuthError(res)
  }
}

const userDelete = async (req, res, next) => {
  try {
    const result = await User.remove({ _id: req.params.userId })
    res.status(200).json({
      status: {
        code: 200,
        message: 'User has been removed'
      }
    })
  }
  catch (err) {
    returnError(err, res)
  }
}

const userDeleteAll = async (req, res, next) => {
  try {
    const result = await User.remove()
    res.status(200).json({
      status: {
        code: 200,
        message: 'All Users have been removed'
      }
    })
  }
  catch (err) {
    returnError(err, res)
  }
}

module.exports = {
  userSignup,
  userLogin,
  patchUser,
  userDelete,
  userDeleteAll
}
