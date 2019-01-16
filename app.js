require('dotenv').config()
const config = require('./config/main')
const express = require('express')
const app = express()
const server = require('http').createServer(app)
const bodyParser = require ('body-parser')
const mongoose = require ('mongoose')
const mongoConfig = require('./config/mongo')
const chalk = require('chalk')
const encounterRoutes = require('./api/routes/encounters')
const characterRoutes = require('./api/routes/characters')
const initiativeRoutes = require('./api/routes/initiatives')
const conditionRoutes = require('./api/routes/conditions')
const userRoutes = require('./api/routes/users')
const morganBody = require('morgan-body')
morganBody(app, {logResponseBody: true})
//const morgan = require('morgan')
//app.use(morgan('dev'))

console.log('CONFIG', config)

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  if (req.method === "OPTIONS") {
    res.header("Access-Control-Allow-Methods", "PUT, POST, PATCH, DELETE, GET");
    return res.status(200).json({});
  }
  next();
});


app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use('/users', userRoutes)
app.use('/encounters', encounterRoutes)
app.use('/characters', characterRoutes)
app.use('/initiatives', initiativeRoutes)
app.use('/conditions', conditionRoutes)

mongoose.connection
.once('open', () => {
  console.log(chalk.bold.green('Successfully connected to MongoDB!'))
  app.emit('ready')
})
.on('disconnect', () => {
  console.log('mongoose disconnected')
})
.on('reconnect', () => {
  console.log('mongoose reconnected')
})
.on('error', err => {
  console.error(chalk.bold.red('Error connecting to MongoDB: ' + err))
  server.close()
})
console.log(chalk.yellow('Connecting to MongoDB at: '+config.dbpath))
mongoose.connect(
  config.dbpath,
  { useNewUrlParser: true, useCreateIndex: true }
)

app.on('ready', async () => {
  console.log(chalk.cyan('Express App is ready.'))
  await mongoConfig()
  server.listen(config.port || 5000, () => {
    console.log(chalk.bold.magenta(`Server listening on: http://${config.host}:${config.port}...`))
  })
})

app.use((req, res, next) => {
  const error = new Error('Resource not found')
  error.status = 404
  next(error)
})

app.use((error, req, res, next) => {
  res.status(error.status || 500)
  res.json({
    error: {
      message: error.message
    }
  })
})

module.exports = app
