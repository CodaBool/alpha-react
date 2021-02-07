require('dotenv').config()
const express = require('express')
const http = require('http')
const app = express()
const server = http.createServer(app)
const mongoose = require('mongoose')
const socket = require('socket.io')
const Game = require('./Models/Game')
const favicon = require('express-favicon')
const path = require('path')
const cors = require('cors')
const allData = require( './src/constants/data.json')
const uri = `mongodb+srv://${process.env.USER}:${process.env.PASS}@typeracerfree.jlmpb.mongodb.net/${process.env.DB}?retryWrites=true&w=majority`
mongoose.connect(uri,
  { useNewUrlParser: true, useUnifiedTopology: true },
  () => console.log('Successfully connected to database')
)
const io = socket(server, {
  cors: { origin: "*" }
})
const port = process.env.PORT || 8080

// middleware
app.use(cors())
app.use(favicon(__dirname + '/build/favicon-32x32.gif'))
app.use(express.static(__dirname))
app.use(express.static(path.join(__dirname, 'build')))

app.get('/*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'))
})

io.on('connection', (socket) => {
  let gameTime
  socket.on('progress', async ({ percent, gameID }) => {
    try {
      let game = await Game.findById(gameID)
      if (game.isStarted) {
        const player = game.players.find(player => player.socketID === socket.id)
        // console.log('progress', player.name, 'is at', percent)
        for (const index in game.players) {
          if (game.players[index]._id == player._id) {
            if (percent < 100) { // unfinished and verify that there was a change
              if (game.players[index].percent !== percent) {
                // console.log('progress change game state =', game)
                // console.log('progress for', player.name, game.players[index].percent, '->', percent)
                game.players[index].percent = percent
                game = await game.save() // too many calls to perform a save every progress
                io.to(gameID).emit('updateGame', game)
              }
            } else {
              // get timestamp of when the user finished
              let endTime = new Date().getTime()
              // get timestamp of when the game started
              let { startTime } = game
              // calculate Words Per Minute
              game.players[index].WPM = calculateWPM(endTime, startTime, player, game.words)
              game.players[index].percent = 100

              // if no one is winner set winner
              let existsWinner = false
              for (const player of game.players) {
                if (player.isWinner) {
                  existsWinner = true
                }
              }
              if (!existsWinner) {
                game.players[index].wins++
                game.players[index].isWinner = true
              }

              // find if all players have finished
              let allDone = true
              for (const player of game.players) {
                if (player.percent !== 100 && !player.givenUp) {
                  allDone = false
                }
              }
              if (allDone) {
                // console.log('everyone finished or gave up')
                // reset game
                game.isOpen = true
                game.isStarted = false
                game.players[index].percent = 0
                game.players[index].isReady = false
                // console.log('finishing game with winner as', player.name, 'with wpm =', game.players[index].WPM)
                io.to(gameID).emit('done', { gameID: game._id, socketID: game.players[index].socketID })
              }
              // save game
              game = await game.save()
              io.to(gameID).emit('updateGame', game)
            }
          }
        }
      } else {
        // console.log('game either over or not started')
      }
    } catch (err) {
      console.log(err)
    }
  })

  socket.on('done', async gameID => {
    let game = await Game.findById(gameID)
    for (const player of game.players) {
      // skip wpm to display as stat in lobby
      player.percent = 0
      player.givenUp = false
      player.ready = false
    }
    game.isTypable = false
    game.isStarted = false
    game = await game.save()
    io.to(gameID).emit('updateGame', game)
    clearInterval(gameTime)
  })

  socket.on('give-up', async ({ gameID, playerID }) => {
    try {
      let game = await Game.findById(gameID)
      for (const index in game.players) {
        let allDone = true
        if (game.players[index]._id !== playerID) {
          if (game.players[index].percent !== 100 && !game.players[index].givenUp) {
            allDone = false
          }
        }
        game.players[index].givenUp = true
        if (allDone) {
          // console.log('last player gave up')
          // console.log('finishing game')
          game.isOpen = true
          game.isStarted = false
          io.to(gameID).emit('done', game._id)
        }
        game = await game.save()
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

    let allReady = true
    // check if everyone is ready
    game.players.forEach(player => {
      if (!player.isReady) {
        allReady = false
      }
    })

    if (player.isLeader && allReady) {

      if (countDown == 5) { // move from lobby to game
        // reset player stats
        // console.log('reseting player stats, starting game in', countDown)
        for (const player of game.players) {
          player.WPM = -1
          player.percent = 0
          player.givenUp = false
          player.ready = false
          player.isWinner = false
          // prod data
          const excerpt = allData[Math.floor(Math.random() * allData.length)]
          // test data
          // const excerpt = simpleData[Math.floor(Math.random() * simpleData.length)]
          
          game.quote = excerpt.quote
          game.source = excerpt.source
          game.speed = excerpt.speed
          game.words = excerpt.quote.split(' ').length
        }
        game.isTypable = false
        game.isStarted = true
        game = await game.save()
        io.to(gameID).emit('updateGame', game)
      }
      
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
          io.to(gameID).emit('start-race')
          // close game so no one else can join
          game.isOpen = false
          game.isTypable = true

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
  
  socket.on('join-game', async ({ gameID, name }) => {
    try {
      // get game
      // console.log('gameID =', gameID)
      let game = await Game.findById(gameID)
      // check if game is allowing users to join
      if (game.isOpen) {
        // make players socket join the game room
        socket.join(gameID)
        // create our player
        let player = {
          socketID: socket.id,
          name
        }
        // add player to the game
        game.players.push(player)
        // save the game
        game = await game.save()
        // send updated game to all sockets within game

        io.to(gameID).emit('updateGame', game)
      } else {
        // deny request
        // console.log('game closed id =', gameID)
        throw 'Game Closed'
      }
    } catch (err) {
      // io.to(gameID).emit('closed', { msg: "Code Invalid or Game Closed" })
      console.log(err)
    }
  })

  socket.on('change-ready', async ({ gameID, playerID, isReady }) => {
    try {
      let game = await Game.findById(gameID)
      for (const index in game.players) {
        if (game.players[index]._id == playerID) {
          if (game.players[index].isReady !== isReady) {
            game.players[index].isReady = isReady
            game = await game.save()
            // console.log('updated Game Ready state', playerID, 'to', isReady)
            io.to(gameID).emit('updateGame', game)
          }
        }
      }
    } catch (err) {
      console.log(err)
    }
  })

  socket.on('change-open', async ({ gameID, isOpen }) => {
    try {
      let game = await Game.findById(gameID)
      if (game.isOpen !== isOpen) {
        game.isOpen = isOpen
        game = await game.save()
        // console.log('updated Game Open state', gameID, 'to', isOpen)
        io.to(gameID).emit('updateGame', game) 
      }
    } catch (err) {
      console.log(err)
    }
  })

  socket.on('send-message', body => {
    io.emit('get-message', body)
  })

  socket.on('create-game', async (name) => {
    try {
      // create game
      let game = new Game()
      // production data
      const excerpt = allData[Math.floor(Math.random() * allData.length)]
      // test data
      // const excerpt = simpleData[Math.floor(Math.random() * simpleData.length)]
      
      game.quote = excerpt.quote
      game.source = excerpt.source
      game.speed = excerpt.speed
      game.words = excerpt.quote.split(' ').length

      // create player
      let player = {
        socketID: socket.id,
        isLeader: true,
        name
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

  async function startGameClock(gameID) {
    // get the game
    let game = await Game.findById(gameID)
    // get time stamp of when the game started
    game.startTime = new Date().getTime()
    // save the game
    game = await game.save()
    // time is in seconds
    let time = 120
    // Start the Game Clock
    gameTime = setInterval(() => {
      // keep countdown going
      if (time >= 0) {
        const formatTime = calculateTime(time)
        console.log('time left', formatTime)
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
          // calculate all players WPM who haven't finished typing out sentence
          game.players.forEach((player, index) => {
            if (player.WPM === -1)
              game.players[index].WPM = calculateWPM(endTime, startTime, player, game.words)
          })
          // save the game
          game = await game.save()
          // send updated game to all sockets within game
          io.to(gameID).emit('updateGame', game)
          clearInterval(gameTime)
        })()
      }
    }, 1000)
  }
})

function calculateTime(time) {
  let minutes = Math.floor(time / 60)
  let seconds = time % 60
  return `${minutes}:${seconds < 10 ? "0" + seconds : seconds}`
}

function calculateWPM(endTime, startTime, player, words, finished) {
  let numOfWords = 0
  if (finished) {
    numOfWords = words
  } else {
    numOfWords = player.percent / 100 * words
  }
  const timeInSeconds = (endTime - startTime) / 1000
  const timeInMinutes = timeInSeconds / 60
  const WPM = Math.floor(numOfWords/ timeInMinutes)
  return WPM
}

server.listen(port, () => console.log(`---> http://localhost:${port}`))