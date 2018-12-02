const mongoose = require('mongoose')

const mongoSettingSchema = mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  name: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed
})

module.exports = mongoose.model('MongoSetting', mongoSettingSchema)
