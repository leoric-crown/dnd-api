const mongoose = require('mongoose')

const userSchema = mongoose.Schema({
    _id: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/
    },
    password: {type: String},
    facebookProvider: {
      id: {type: String},
      token: {type: String},
      select: false
    }
})

userSchema.statics.upsertFbUser = (token, tokenSecret, profile, cb) => {
  console.log('profile:', profile)
  const that = this
  return this.findOne({
    'facebookProvider.id': profile.id
  }), (err, user) => {
    if(!user) {
      const newUser = new that({
        email: profile.emails[0].value,
        facebookProvider: {
          id: profile.id,
          token: token
        }
      })

      newUser.save((err, savedUser) => {
        if(err) console.log(err)
        return cb(err, savedUser)
      })
    }
    else return cb(err, user)
  }
}

module.exports = mongoose.model('User', userSchema)
