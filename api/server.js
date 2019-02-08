require('dotenv').config()
const cors = require('cors')
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const bodyParser = require ('body-parser')
const mongoose = require ('mongoose')
const morganBody = require('morgan-body')
//const morgan = require('morgan')
//app.use(morgan('dev'))
const encounterRoutes = require('./routes/encounters')
const characterRoutes = require('./routes/characters')
const initiativeRoutes = require('./routes/initiatives')
const conditionRoutes = require('./routes/conditions')
const userRoutes = require('./routes/users')

module.exports = class ServerApp {
    /**
     * @param  {Object} config single object containing configurations
     * @param  {chalk} chalk for terminal styling
     * @return {App}    Server application wrapper
     */
    constructor(config, chalk) {
        this.config = config;
        this.chalk = chalk
    }

    start() {
      this.app = express();
      this.app.use(cors());
      this.app.use(bodyParser.json());
      // TODO: Use NODE_ENV to choose to use morganBody module
      morganBody(this.app, {logResponseBody: true})
      this.app.use('/uploads', express.static('uploads'))

      // Routes
      this.app.use('/users', userRoutes)
      this.app.use('/encounters', encounterRoutes)
      this.app.use('/characters', characterRoutes)
      this.app.use('/initiatives', initiativeRoutes)
      this.app.use('/conditions', conditionRoutes)

      this.app.use((req, res, next) => {
        const error = new Error('Resource not found')
        error.status = 404
        next(error)
      })

      this.app.use((error, req, res, next) => {
        res.status(error.status || 500)
        res.json({
          error: {
            message: error.message
          }
        })
      })


      return this.app.listen(this.config.port, () => {
          console.log(this.chalk.bold.green(`
              Started DnD Express server listening to port ${this.config.port}
          `.trim()));
      });
    }
  }
