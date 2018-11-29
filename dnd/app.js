const express = require('express')
const app = express()
const morgan = require('morgan')
const bodyParser = require ('body-parser')
const mongoose = require ('mongoose')

const encounterRoutes = require('./api/routes/encounters')
const characterRoutes = require('./api/routes/characters')
const initiativeRoutes = require('./api/routes/initiatives')

mongoose.connect(
  'mongodb://localhost:27017/dndb',
  {
    useNewUrlParser: true
  }
)

app.use(morgan("dev"))
app.use(bodyParser.json())

app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

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

app.use('/encounters', encounterRoutes)
app.use('/characters', characterRoutes)
app.use('/initiatives', initiativeRoutes)

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
