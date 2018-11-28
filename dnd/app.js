const express = require('express')
const app = express()
const server = require('http').createServer(app)
const morgan = require('morgan')
const bodyParser = require ('body-parser')
const mongoose = require ('mongoose')

const encounterRoutes = require('./api/routes/encounters')
const characterRoutes = require('./api/routes/characters')
const initiativeRoutes = require('./api/routes/initiatives')
const userRoutes = require('./api/routes/users')

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use('/encounters', encounterRoutes)
app.use('/characters', characterRoutes)
app.use('/initiatives', initiativeRoutes)
app.use('/users', userRoutes)

mongoose.connection
.once('open', () => {
  console.log('Successfully connected to MongoDB')
  app.emit('ready')
})
.on('error', err => {
  console.error('Error connecting to MongoDB: ' + err)
  server.close()
})
console.log('Connecting to MongoDB at: '+process.env.DBPATH)
mongoose.connect(
  process.env.DBPATH,
  { useNewUrlParser: true, useCreateIndex: true }
)

app.on('ready', () => {
  console.log('Express App is ready.')
  server.listen(process.env.PORT || 5000, () => {
    console.log('Server listening on: http://'
    +process.env.HOST + ':' + process.env.PORT)
  })
})
/*
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
*/
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
