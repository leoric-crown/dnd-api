const http = require('http')
const app = require('./app')

const config = require('./main')

const port = config.port || 5000

const server = http.createServer(app)
