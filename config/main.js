module.exports = {
  host:  process.env.HOST,
  port:  process.env.PORT,
  dbpath:  process.env.MONGODB_URI,
  jwtKey:  process.env.JWT_KEY,
  facebookAuth: {
    clientID: process.env.FACEBOOK_CLIENT_ID,
    clientSecret: process.env.FACEBOOK_CLIENT_SECRET
  },
  mailService: process.env.EMAIL_SERVICE,
  userMail: process.env.EMAIL_USER,
  userPass: process.env.EMAIL_PASS,
  awsSecret: process.env.AWS_SECRET,
  awsKey: process.env.AWS_KEY
}
