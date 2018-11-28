const http = require('http')
const app = require('./app')

const port = process.env.PORT || 5000

const server = http.createServer(app)

console.log('Listening on: http://'+ process.env.HOST + ':' + process.env.PORT)
server.listen(port)
