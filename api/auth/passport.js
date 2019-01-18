const config = require('../../config/main')
const JwtStrategy = require('passport-jwt').Strategy
const FacebookTokenStrategy = require('passport-facebook-token')
const ExtractJwt = require('passport-jwt').ExtractJwt
const User = require('../models/user.model')
const passport = require('passport')
const mongoose = require('mongoose')
const UserController = require('../controllers/users.controller')

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwtKey,
  passReqToCallback: true
}

const facebookOpts = {
  clientID: config.facebookAuth.clientID,
  clientSecret: config.facebookAuth.clientSecret,
  includeEmail: true
}

const upsertFbUser = async (token, tokenSecret, profile, next) => {
  try {
    console.log('in upsertFbUser');
    console.log(profile)
    const user = await User.findOne({
      'facebookProvider.id': profile.id
    }).exec()

    if(!user) {
      const newUser = new User({
        _id: new mongoose.Types.ObjectId(),
        firstName: profile.name.givenName,
        lastName: profile.name.familyName,
        email: profile.emails[0].value,
        isDM: false,
        facebookProvider: {
          id: profile.id,
          select: true
        }
      })
      await newUser.save()
      return next(null, newUser)
    }
    else {
      return next(null, user)
    }
  }
  catch (err) {
    return next(err)
  }
}

module.exports = () => {

  passport.use(new JwtStrategy(opts, function (payload, userInfo, done) {
    User.findById(userInfo.user._id, (err, user) => {
      if(err) {
        done(err, false)
      }
      else if (user) {
        done(null, user)
      } else {
        done(null, false)
      }
    })
  }))

  passport.use(new FacebookTokenStrategy(facebookOpts, function (accessToken, refreshToken, profile, done) {
      upsertFbUser(accessToken, refreshToken, profile, (err, user) => {
        if(err) {
          done(err, false)
        }
        else if (user) {
          done(null, user)
        } else {
          done(null, false)
        }
      })
  }))
}
