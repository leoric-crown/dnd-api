const mongoose = require('mongoose')

const conditionSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true, unique: true },
  desc: { type: mongoose.Schema.Types.Mixed, required: true },
  fromApi: { type: Boolean, default: false }
})

module.exports = mongoose.model('Condition', conditionSchema)
