const { Socket } = require('dgram')
const ws = require('ws')
const server = new ws.Server({ port: '3000' })

server.on('connection', Socket => {
    Socket.on('message', message => {
        const b = Buffer.from(message)
        console.log(b.toString())
        Socket.send(`${message}`)
    })
})