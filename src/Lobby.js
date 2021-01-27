import React, { useState, useEffect } from 'react'
import { useHistory, Redirect } from 'react-router-dom'
import Form from 'react-bootstrap/Form'
import InputGroup from 'react-bootstrap/InputGroup'
import Row from 'react-bootstrap/Row'
import Toast from 'react-bootstrap/Toast'
import Col from 'react-bootstrap/Col'
import Chat from './Components/Chat'
import Game from './Components/Game'
import CountDown from './Components/CountDown'
import StartBtn from './Components/StartBtn'
import { socket } from './constants'

function getPlayer(players) {
  return players.find(player => player.socketID === socket.id)
}

export default function Lobby({ gameState }) {
  // const query = new URLSearchParams(useLocation().search) // gets code from url query
  const history = useHistory()
  const [open, setOpen] = useState(true)
  const [ready, setReady] = useState(false)
  const [show, setShow] = useState(false)
  const [roomCode, setRoomCode] = useState(history.location.pathname.split('/')[2])
  const player = getPlayer(gameState.players)

  useEffect(() => {
    if (player) {
      socket.emit('ready', { gameID: gameState._id, playerID: player._id, ready })
    }
  }, [ready])

  function copyCode() {
    navigator.clipboard.writeText(roomCode)
    setShow(true)
  }

  if (gameState._id === "") {
    return <Redirect to="/"/>
  }

  return (
    <>
      <h1 className="display-1">Lobby</h1>
      <Row className="my-2">
        <p className="d-inline mx-4 text-primary shareCode" onClick={copyCode}>Code</p>
        <span className="border-right mr-3"></span>
        <Form.Check
          type="switch"
          id="ready"
          className="mr-3"
          label="Ready"
          checked={ready}
          onChange={() => setReady(prev => !prev)}
        />
        <span className="border-right mr-3"></span>
        <Form.Check
          checked={open}
          onChange={() => setOpen(prev => !prev)}
          type="switch"
          id="open"
          label="Open"
        />
      </Row>
      <Row>
        <Col md={8} className="">
          {/* <InputGroup /> */}
          <CountDown />
          {gameState.players.map((player, index) => (
            <p key={player._id}>Player {index + 1}: {player.nickName}</p>
          ))}
          <StartBtn player={player} gameID={gameState._id}/>
          <Game gameState={gameState} />
        </Col>
        <Col md={4} className="">
          {/* <Chat /> */}
        </Col>
      </Row>

      {/* Copied Room Code Notification */}
      <div style={{position: 'fixed', top: '10%', left: '10px', zIndex: '2'}}>
        <Toast onClose={() => setShow(false)} show={show} delay={8000} autohide>
          <Toast.Header>
            <strong className="mr-auto">Room Code Copied</strong>
          </Toast.Header>
          <Toast.Body className="bg-white">Share this code to someone to versus them</Toast.Body>
        </Toast>
      </div>
    </>
  )
}
