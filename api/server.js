require('dotenv').config()
const cors = require('cors')
const express = require('express')
const http = require('http')
const bodyParser = require('body-parser')
const morganBody = require('morgan-body')
const encounterRoutes = require('./routes/encounters')
const characterRoutes = require('./routes/characters')
const initiativeRoutes = require('./routes/initiatives')
const conditionRoutes = require('./routes/conditions')
const userRoutes = require('./routes/users')
// const ws = require('express-ws')

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
    const server = http.createServer(this.app)
    this.app.io = require('socket.io').listen(server)
    const corsOptions = {
      credentials: true,
      origin: (origin, callback) => callback(null, true)
    }
    this.app.use(cors(corsOptions));

    this.app.use(bodyParser.json());
    // TODO: Use NODE_ENV to choose to use morganBody module
    morganBody(this.app, { logResponseBody: true })
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

    return server.listen(this.config.port, () => {
      
      this.app.io.on('connection', (socket) => {
        console.log(this.chalk.bold.magenta('WebSocket connection from Client: ' + socket.id))
      })

      console.log(this.chalk.bold.green(
        `Started DnD Express server listening to port ${this.config.port}`.trim()
      ))
    })
  }
}