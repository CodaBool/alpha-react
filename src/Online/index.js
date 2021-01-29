import React, { useState, useEffect } from 'react'
import Game from './Game'
import Lobby from './Lobby'
import { socket } from '../constants'
import { useHistory, useLocation } from 'react-router-dom'
import Spinner from 'react-bootstrap/Spinner'

const Loading = () => (
  <>
    <Spinner animation="border" variant="info" style={{margin: '20% auto 0 auto', display: 'block'}} />
    <h4 className="delayedFade mt-5 text-center">This game does not appear reachable</h4>
  </>
)

export default function index() {
  const history = useHistory()
  const [route, setRoute] = useState(history.location.pathname.split('/')[2])
  const [game, setGame] = useState({ _id: '', isOpen: false, isStarted: false, players: [] })
  const [gameStarted, setGameStarted] = useState(false)
  const query = new URLSearchParams(useLocation().search) // gets code from url query

  if (route === 'lobby' && game._id === "") {
    // console.log('creating new game with name', localStorage.getItem('name'))
    socket.emit('create-game', localStorage.getItem('name'))
  } else if (route === 'join' && game._id === "") {
    // console.log('join a game with code =', query.get('gameID'), 'and name', localStorage.getItem('name'))
    socket.emit('join-game', { gameID: query.get('gameID'), name: localStorage.getItem('name') })
  }

  useEffect(() => {
    socket.on('updateGame', (game) => {
      console.log(game)
      setGame(game)
    })
    socket.on('timer', data => {
      // console.log('timer emitted', gameStarted)
      if (data.msg === 'Time Remaining' && !gameStarted) {
        // console.log('allow typing')
        setGameStarted(true)
      }
    })
    // TODO: should find a solution to not need client to finish the game for everyone
    socket.on('done', gameID => {
      console.log(gameID)
      socket.emit('done', gameID)
      setGameStarted(false)
    })
    return () => socket.removeAllListeners()
  }, [])

  return (
    <>
      {(game._id && !game.isStarted) && <Lobby game={game} />}
      {game._id == '' && <Loading />}
      {game.isStarted && <Game game={game} loading={Loading} />}
    </>
  )
}
