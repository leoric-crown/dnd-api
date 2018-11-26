const mongoose = require('mongoose')

const characterSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type:String, required: true },
  level: { type: Number, required: true },
  armorclass: { type: Number, required: true },
  hitpoints: { type: Number, required: true },
  maxhitpoints: { type: Number, required: true },
  condition: {type: String, default: 'none'}, //make enum
  player: Boolean
})

module.exports = mongoose.model('Character', characterSchema)
