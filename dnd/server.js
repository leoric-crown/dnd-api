const http = require('http')
const app = require('./app')

<<<<<<< HEAD
const port = process.env.PORT || 5000

const server = http.createServer(app)

console.log('Listening on: http://'+ process.env.HOST + ':' + process.env.PORT)
=======
const port = process.env.PORT || 3000

const server = http.createServer(app)

>>>>>>> 4380df16195b5b602e3b92999cd1346f03746724
server.listen(port)
