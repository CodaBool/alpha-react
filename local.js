// const express = require('express')
// const cors = require('cors')
// const app = express()
// const port = process.env.PORT || 8080
 
// app.use(cors())

// // middleware
// const http = require('http').Server(app)

// const io = require('socket.io')(http)
// const STATIC_CHANNELS = ['global_notifications', 'global_chat']

// app.get('/', (req, res) => {
//   // console.log(__dirname)
//   res.send('hi')

//   // res.sendFile(__dirname + 'index.html')
// })

// // http.listen(port, () => console.log(`---> http://localhost:${port}`))

// app.listen(port, () => console.log(`---> http://localhost:${port}`))

// /* socket object may be used to send specific messages to the new connected client */
// io.on('connection', (socket) => {
  // console.log('new client connected')
  // socket.emit('connection', null)
// })

// const express = require('express')
// const cors = require('cors')
// const app = express()
// const server = require('http').createServer(app)
// const io = require("socket.io")(server)
// const port = process.env.PORT || 8080

// app.use(cors())
// io.origins('*:*') // for latest version
// app.get('/', (req, res) => {
//   res.send('hi')
// })

// io.on('connection', () => {
//   console.log('new client connected')
//   socket.emit('connection', null)
// })

// server.listen(port, () => console.log(`---> http://localhost:${port}`))

const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const socket = require('socket.io')
const io = socket(server, {
  cors: { origin: "*" }
})
const port = process.env.PORT || 8080

const cors = require('cors')
app.use(cors())

app.get('/', (req, res) => {
  res.send('hi')
})

io.on('connection', socket => {
  console.log('new client connected')
  socket.emit('connection', socket.id)
  socket.on('send message', body => {
    io.emit('message', body)
  })
})

server.listen(port, () => console.log(`---> http://localhost:${port}`))