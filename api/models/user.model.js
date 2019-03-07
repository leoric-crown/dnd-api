const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    required: true
  },
  firstName: String,
  lastName: String,
  email: {
    type: String,
    required: true,
    unique: true,
    match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
  },
  password: { type: String },
  isDM: { type: Boolean, default: false },
  photoURL: String,
  facebookProvider: {
    id: { type: String },
    select: false,
  },
  verified: { type: Boolean, default: false },
  forgotPassword: {type: Boolean, default: false}
})

module.exports = mongoose.model('User', userSchema)
