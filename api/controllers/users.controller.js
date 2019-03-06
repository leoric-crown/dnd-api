const mongoose = require("mongoose")
const bcrypt = require("bcrypt")
const tokens = require("../auth/token.utils")
const config = require("../../config/main")
const endpoint = `http://${config.host}:${config.port}/users/`
const User = require("../models/user.model")
const emailClient = require("../utils/mailClient")

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
      message: "Authentication failed"
    }
  })
}

const readOnlyFields = ["email", "password", "facebookProvider"]

const patchUser = async (req, res, next) => {
  try {
    const id = req.params.userId
    if (req.user.id !== id) {
      res.status(403).json({
        status: {
          code: 403,
          message: "Patch failed: Insufficient privileges"
        }
      })
      return
    }
    const updateOps = {}
    for (const ops of req.body) {
      if (!readOnlyFields.includes(ops.propName))
        updateOps[ops.propName] = ops.value
    }

    const updated = await User.findOneAndUpdate(
      { _id: id },
      { $set: updateOps },
      { new: true }
    ).exec()
    if (updated.n === 0) {
      res.status(500).json({
        status: {
          code: 500,
          message: "Patch failed: User document not found"
        }
      })
    } else {
      const { __v, facebookProvider, password, ...user } = updated._doc
      req.user = user
      tokens.sendToken(req, res)
    }
  } catch (err) {
    console.log(err)
    res.status(400).json({
      status: {
        code: 400,
        message: "Error patching User document"
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
          message: "E-mail is already registered"
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
        password: hash
      })

      const result = await user.save()

      const { password, ...noPassword } = user._doc
      req.user = noPassword
      tokens.sendToken(req, res)
    }
  } catch (err) {
    returnError(err, res)
  }
}

const userLogin = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email })
      .select("-__v")
      .exec()
    if (user.length < 1) {
      returnAuthError(res)
    } else {
      const result = await bcrypt.compare(req.body.password, user.password)
      if (result) {
        const { password, ...noPassword } = user._doc
        req.user = noPassword
        tokens.sendToken(req, res)
      } else {
        returnAuthError(res)
      }
    }
  } catch (err) {
    returnAuthError(res)
  }
}

const userDelete = async (req, res, next) => {
  try {
    const result = await User.remove({ _id: req.params.userId })
    res.status(200).json({
      status: {
        code: 200,
        message: "User has been removed"
      }
    })
  } catch (err) {
    returnError(err, res)
  }
}

const userDeleteAll = async (req, res, next) => {
  try {
    const result = await User.remove()
    res.status(200).json({
      status: {
        code: 200,
        message: "All Users have been removed"
      }
    })
  } catch (err) {
    returnError(err, res)
  }
}

const forgotPassword = async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email })
      .select("-__v")
      .exec()
    if (user.length < 1) {
      returnAuthError(res)
    } else {
      const token = tokens.createToken(user)
      var data = {
        to: user.email,
        from: config.userMail,
        template: "forgot-password-email",
        subject: "DND Turn Tracker: Password help has arrived my adventurer!",
        context: {
          url: `http://localhost:3000/resetpassword?token=${token}`,
          name: user.firstName
        }
      }
      await emailClient.sendMail(data)
      res.status(200).json({
        status: {
          code: 200,
          message: "Please check your email and follow the instructions"
        }
      })
    }
  } catch (err) {
    returnError(err, res)
  }
}

const resetPassword = async (req, res, next) => {
  const hash = await bcrypt.hash(req.body.password, 10)
  try {
    const result = await User.updateOne(
      { _id: req.user._id },
      { $set: { password: hash } }
    ).exec()
    res.status(200).json({
      status: {
        code: 200,
        message: 'Password successfully changed'
      }
    })
  } catch (err) {
    returnError(err, res)
  }
}

module.exports = {
  userSignup,
  userLogin,
  patchUser,
  userDelete,
  userDeleteAll,
  forgotPassword,
  resetPassword
}
