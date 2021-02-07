import React, { useState, useEffect } from 'react'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Toast from 'react-bootstrap/Toast'
import Spinner from 'react-bootstrap/Spinner'
import StartBtn from '../Components/StartBtn'
import { socket } from '../constants'

function getPlayer(players) {
  return players.find(player => player.socketID === socket.id)
}

export default function Lobby({ game }) {
  const [isOpen, setIsOpen] = useState(true)
  const [isReady, setIsReady] = useState(false)
  const [show, setShow] = useState(false)
  const player = getPlayer(game?.players)

  useEffect(() => {
    if (player) {
      // console.log('changing ready', { gameID: game._id, playerID: player._id, isReady })
      socket.emit('change-ready', { gameID: game._id, playerID: player._id, isReady })
    }
  }, [isReady])
  
  useEffect(() => {
    if (player) {
      // console.log('changing open', { gameID: game._id, isOpen })
      socket.emit('change-open', { gameID: game._id, isOpen })
    }
  }, [isOpen])


  function copyCode() {
    navigator.clipboard.writeText(game._id)
    setShow(true)
  }

  if (!player) {
    return (
      <>
        <Spinner animation="border" variant="info" style={{margin: '20% auto 0 auto', display: 'block'}} />
        <h4 className="delayedFade mt-5 text-center">Cannot connect to lobby</h4>
      </>
    )
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
          checked={isReady}
          onChange={() => setIsReady(prev => !prev)}
        />
        {player.isLeader &&
          <>
            <span className="border-right mr-3"></span>
            <Form.Check
              checked={isOpen}
              onChange={() => setIsOpen(prev => !prev)}
              type="switch"
              id="open"
              label="Open"
            />
            <span className="border-right mx-3"></span>
            <StartBtn player={player} game={game} />
          </>
        }
        
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
