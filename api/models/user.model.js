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
  photoUrl: String,
  facebookProvider: {
    id: { type: String },
    select: false,
  }
})

module.exports = mongoose.model('User', userSchema)
