const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const config = require('../../config/main')
const User = require('../models/user.model');

const returnError = (err, res) => {
  console.log(err)
  res.status(500).json({
    error: err.toString()
  })
}

const returnAuthError = res => {
  res.status(401).json({
    message: 'Authentication failed.'
  })
}


const userSignup = async (req, res, next) => {
  try {
    const user = await User.find({ email: req.body.email }).exec()
    if(user.length >= 1) {
      return res.status(409).json({
        message: 'E-mail is already registered.'
      })
    } else {
      const hash = await bcrypt.hash(req.body.password, 10)
      const user = new User({
        _id: new mongoose.Types.ObjectId(),
        email: req.body.email,
        password: hash,
      })

      const result = await user.save()
      res.status(201).json({
        message: 'User created'
      });
    }
  }
  catch (err) {
    returnError(err, res)
  }
}

const userLogin = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email }).exec()
    if (user.length < 1) {
      returnAuthError(res)
    } else {
      const result = await bcrypt.compare(req.body.password, user.password)
      if(result) {
        const token = jwt.sign(
          {
            email: user.email,
            userId: user._id
          },
          config.jwtKey,
          {
            expiresIn: '4h'
          }
        )
        return res.status(200).json({
          message: 'Authentication successful.',
          token: token
        })
      }
      else{
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
      message: 'User has been removed.'
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
      message: 'All Users have been removed.'
    })
  }
  catch (err) {
    returnError(err, res)
  }
}

module.exports = {
  userSignup,
  userLogin,
  userDelete,
  userDeleteAll
}
