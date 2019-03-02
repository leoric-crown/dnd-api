const express = require('express')
require('express-ws')(express)
const router = express.Router()

router.ws('/echo', (ws, req) => {
    console.log(req)
    ws.on('message', (msg) => {
        console.log(msg)
        ws.send(JSON.stringify({
            message: msg
        }))
    })
})