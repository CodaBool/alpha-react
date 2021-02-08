import React, { useState, useEffect } from 'react'
import Game from './Game'
import Lobby from './Lobby'
import { socket } from '../constants'
import Cars from '../Components/Cars'
import Chat from '../Components/Chat'
import CountDown from '../Components/CountDown'
import Stats from '../Components/Stats'
import { useHistory, useLocation } from 'react-router-dom'
import Spinner from 'react-bootstrap/Spinner'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import Navigation from '../Components/Navigation'
import Container from 'react-bootstrap/Container'

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
  const [winnerSocket, setWinnerSocket] = useState(null)
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
    socket.on('done', data => {
      socket.emit('done', data.gameID)
      setWinnerSocket(data.socketID)
      setGameStarted(false)
    })
    return () => socket.removeAllListeners()
  }, [])

  return (
    <>
      <Navigation />
      <Container>
        <Row>
          <Col md={8} className="">
            {(game._id && !game.isStarted) && <Lobby game={game} />}
            {game.isStarted && <CountDown />}
            {game._id == '' 
              ? <Loading />
              : <Cars game={game} />
            }
            <Stats game={game} gameStarted={gameStarted} winnerSocket={winnerSocket} setWinnerSocket={setWinnerSocket} />
            {game.isStarted && <Game game={game} loading={Loading} />}
          </Col>
          <Col md={4} className="mt-4">
            {game._id !== '' && <Chat game={game} />}
          </Col>
        </Row>
      </Container>
    </>
  )
}
