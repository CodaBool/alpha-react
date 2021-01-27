require('dotenv').config()
const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const mongoose = require('mongoose')
const socket = require('socket.io')
const Game = require('./Models/Game')
const allData = require( './src/constants/data.json')
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@typeracerfree.jlmpb.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`
mongoose.connect(uri,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => console.log('successfully connected to database')
)
const io = socket(server, {
  cors: { origin: "*" }
})
const port = process.env.PORT || 8080

const cors = require('cors')
app.use(cors())

app.get('/', (req, res) => {
  res.send('as')
})

io.on('connection', (socket) => {
  socket.on('userInput', async ({ userInput, gameID }) => {
    try {
      // find the game
      let game = await Game.findById(gameID)
      // if game has started and game isn't over
      if (!game.isOpen && !game.isOver) {
        // get player making the request
        let player = game.players.find(player => player.socketID === socket.id)
        // get current word the user has to type
        let word = game.words[player.currentWordIndex]
        // if player typed word correctly
        if (word === userInput) {
          // advance player to next word
          player.currentWordIndex++
          // if user hasn't finished typing the sentence
          if (player.currentWordIndex !== game.words.length) {
            // save the game
            game = await game.save()
            // send updated game to all sockets within game
            io.to(gameID).emit('updateGame', game)
          }
          // player is done typing sentence
          else {
            // get timestamp of when the user finished
            let endTime = new Date().getTime()
            // get timestamp of when the game started
            let { startTime } = game
            // calculate Words Per Minute
            player.WPM = calculateWPM(endTime, startTime, player)
            // save game
            game = await game.save()
            // stops timer for that player
            socket.emit('done')
            // send updated game to all sockets within game
            io.to(gameID).emit('updateGame', game)
          }
        }
      }
    } catch (err) {
      console.log(err)
    }
  })

  socket.on('timer', async ({ gameID, playerID }) => {
    // time in seconds
    let countDown = 5
    // find game
    let game = await Game.findById(gameID)
    // find player who made request
    let player = game.players.id(playerID)
    // check if player has permission to start game
    if (player.isPartyLeader) {
      // start time countdown
      let timerID = setInterval(async () => {
        // keep counting down until we hit 0
        if (countDown >= 0) {
          // emit countDown to all players within game
          io.to(gameID).emit('timer', { countDown, msg: "Starting Game" })
          countDown--
        }
        // start time clock over, now time to start game
        else {
          // close game so no one else can join
          game.isOpen = false
          // save the game
          game = await game.save()
          // send updated game to all sockets within game
          io.to(gameID).emit('updateGame', game)
          // start game clock
          startGameClock(gameID)
          clearInterval(timerID)
        }
      }, 1000)
    }
  })

  socket.on('join-game', async ({ gameID: _id, nickName }) => {
    try {
      // get game
      let game = await Game.findById(_id)
      // check if game is allowing users to join
      if (game.isOpen) {
        // make players socket join the game room
        const gameID = game._id.toString()
        socket.join(gameID)
        // create our player
        let player = {
          socketID: socket.id,
          nickName
        }
        // add player to the game
        game.players.push(player)
        // save the game
        game = await game.save()
        // send updated game to all sockets within game
        io.to(gameID).emit('updateGame', game)
      }
    } catch (err) {
      console.log(err)
    }
  })

  socket.on('ready', async ({ gameID, playerID, ready }) => {
    try {
      let game = await Game.findById(gameID)
      let player = game.players.id(playerID)
      console.log('db ready =', player.ready, 'vs', ready, ' | ', player.ready !== ready)
      if (player.ready !== ready) {
        player.ready = ready
        game = await game.save()
        io.to(gameID).emit('updateGame', game)  
      }
    } catch (err) {
      console.log(err)
    }
  })

  socket.on('create-game', async (nickName) => {
    try {
      // get words that our users have to type out
      const randomQuote = allData[Math.floor(Math.random() * allData.length)]
      // create game
      let game = new Game()
      // set words
      game.words = randomQuote.quote
      // create player
      let player = {
        socketID: socket.id,
        isPartyLeader: true,
        nickName
      }
      // add player
      game.players.push(player)
      // save the game
      game = await game.save()
      // make players socket join the game room
      const gameID = game._id.toString()
      socket.join(gameID)
      // send updated game to all sockets within game
      io.to(gameID).emit('updateGame', game)
    } catch (err) {
      console.log(err)
    }
  })
})

async function startGameClock(gameID) {
  // get the game
  let game = await Game.findById(gameID)
  // get time stamp of when the game started
  game.startTime = new Date().getTime()
  // save teh game
  game = await game.save()
  // time is in seconds
  let time = 120
  // Start the Game Clock
  let timerID = setInterval(function gameIntervalFunc() {
    // keep countdown going
    if (time >= 0) {
      const formatTime = calculateTime(time)
      io.to(gameID).emit('timer', { countDown: formatTime, msg: "Time Remaining" })
      time--
    }
    // game clock has run out, game is over
    else {
      (async () => {
        // get time stamp of when the game ended
        let endTime = new Date().getTime()
        // find the game
        let game = await Game.findById(gameID)
        // get the game start time
        let { startTime } = game
        // game is officially over
        game.isOver = true
        // calculate all players WPM who haven't finished typing out sentence
        game.players.forEach((player, index) => {
          if (player.WPM === -1)
            game.players[index].WPM = calculateWPM(endTime, startTime, player)
        });
        // save the game
        game = await game.save()
        // send updated game to all sockets within game
        io.to(gameID).emit('updateGame', game)
        clearInterval(timerID)
      })()
    }
    return gameIntervalFunc
  }(), 1000)
}

function calculateTime(time) {
  let minutes = Math.floor(time / 60)
  let seconds = time % 60
  return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`
}

function calculateWPM(endTime, startTime, player) {
  let numOfWords = player.currentWordIndex
  const timeInSeconds = (endTime - startTime) / 1000
  const timeInMinutes = timeInSeconds / 60
  const WPM = Math.floor(numOfWords/ timeInMinutes)
  return WPM
}



server.listen(port, () => console.log(`---> http://localhost:${port}`))