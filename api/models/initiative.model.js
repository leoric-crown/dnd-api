const mongoose = require('mongoose')

const initiativeSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  encounter: {type: mongoose.Schema.Types.ObjectId, ref: 'Encounter', required: true},
  character: {type: mongoose.Schema.Types.ObjectId, ref: 'Character', required: true},
  characterStamp: Object,
  initiative: {type: Number, required: true },
  active: {type: Boolean, default: false}
})

module.exports = mongoose.model('Initiative', initiativeSchema)
