const hbs = require("nodemailer-express-handlebars")
const nodemailer = require("nodemailer")
const config = require("../../config/main")

const smtpTransport = nodemailer.createTransport({
  service: config.mailService,
  auth: {
    user: config.userMail,
    pass: config.userPass
  }
})

const handlebarsOptions = {
  viewEngine: {
    extName: ".hbs",
    partialsDir: "./api/templates/"
  },
  viewPath: "./api/templates/",
  extName: ".html"
}



module.exports = smtpTransport.use("compile", hbs(handlebarsOptions))
