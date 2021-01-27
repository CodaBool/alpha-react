import React, { useState } from 'react'
import { socket } from '../constants'
import Button from 'react-bootstrap/Button'

export default function StartBtn({ player, gameID, start }) {
  const [show, setShow] = useState(true)
  const { isPartyLeader } = player

  function start() {
    socket.emit('timer', { playerID: player._id, gameID })
    setShow(false)
  }

  return (
    isPartyLeader && show 
      ? <Button onClick={start}>Start Game</Button>
      : null
  )
}