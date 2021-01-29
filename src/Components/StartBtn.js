import React, { useState, useEffect } from 'react'
import { socket } from '../constants'
import Button from 'react-bootstrap/Button'

export default function StartBtn({ player, game }) {
  const [show, setShow] = useState(false)

  useEffect(() => {
    let allReady = true
    game.players.forEach(player => {
      if (!player.isReady) {
        allReady = false
      }
    })
    if (!game.isStarted) {
      setShow(allReady)
    }
  }, [game])

  function start() {
    socket.emit('timer', { playerID: player._id, gameID: game._id })
    setShow(false)
  }

  return (
    (player.isLeader && show)
      ? <Button className="my-5 w-100" variant="danger" onClick={start}>Start Race</Button>
      : <div style={{height: '134px'}}></div>
  )
}