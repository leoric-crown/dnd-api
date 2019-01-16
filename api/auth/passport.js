const config = require('../../config/main')
const JwtStrategy = require('passport-jwt').Strategy
const FacebookTokenStrategy = require('passport-facebook-token')
const ExtractJwt = require('passport-jwt').ExtractJwt
const User = require('../models/user.model')
const passport = require('passport')

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

console.log('in authenticator.js', facebookOpts)

module.exports = () => {
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

  passport.use(new FacebookTokenStrategy(facebookOpts, function (accessToken, refreshToken, profile, done) {
      console.log('in facebook strategy')
      User.upsertFbUser(accessToken, refreshToken, profile,
        (err, user) => {
          return done(err, user)
        })
  }))
}
