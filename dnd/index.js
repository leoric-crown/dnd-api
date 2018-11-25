const express = require('express')
const app = express()
const cors = require('cors')
const bodyParser = require('body-parser')
const PORT = 5000

const characters = []

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
})
app.use(bodyParser.json())

app.get('/', (req, res) => {
  res.json({name: 'PlayerName'})
})
app.post('/post', (req, res) => {
  console.log(req.body)
  if(characters.map(a => a.name).indexOf(req.body.name) === -1){
    characters.push(req.body)
    characters.sort((a,b) => {
      return b.initiative - a.initiative
    })
  }
  console.log(characters)

  res.json(characters)
})

app.get('/characters', (req, res) => {
  res.json(characters)
})

app.post('/remove', (req, res) => {
  console.log('Removing: "' + req.body.name + '"')
  console.log("indexOf: " + characters.map(a => a.name).indexOf(req.body.name))
  if(characters.map(a => a.name).indexOf(req.body.name) > -1) {
    characters.splice(
      characters.map(a => a.name).indexOf(req.body.name),
      1
    )
  }

  console.log(characters)
  res.json(characters)
})

app.listen(PORT);