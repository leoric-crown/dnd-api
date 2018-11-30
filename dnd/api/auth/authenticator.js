const config = require('../../config/main')
const JwtStrategy = require('passport-jwt').Strategy
const ExtractJwt = require('passport-jwt').ExtractJwt
const User = require('../models/user.model')
const passport = require('passport')

const opts = {
  jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
  secretOrKey: config.jwt_key,
  passReqToCallback: true
}

module.exports = (passport) => {
  passport.use(new JwtStrategy(opts, function (payload, userInfo, done) {
    User.findById(userInfo.userId, (err, user) => {
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
