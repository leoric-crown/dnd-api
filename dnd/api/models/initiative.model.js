const mongoose = require('mongoose')

const initiativeSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  encounter: {type: mongoose.Schema.Types.ObjectId, ref: 'Encounter'},
  character: {type: mongoose.Schema.Types.ObjectId, ref: 'Character'},
  initiative: {type: Number, required: true },
  active: {type: Boolean, default: true}
})

module.exports = mongoose.model('Initiative', initiativeSchema)
