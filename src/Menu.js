import Button from 'react-bootstrap/Button'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Popover from 'react-bootstrap/Popover'
import Form from 'react-bootstrap/Form'
import React, { useState } from 'react'
import { useHistory } from 'react-router-dom'
import { genCode, socket } from './constants'

export default function Menu() {
  const [gameID, setGameID] = useState('')
  const [nickName, setNickName] = useState('')
  const [error, setError] = useState('Enter a Name')
  const history = useHistory()

  function handleCode(e) {
    if (e.target.value.length > 24) {
      setError('Codes must be 24 digits long')
    } else {
      setError(null)
    }
    setGameID(e.target.value)
  }
  function handleName(e) {
    if (e.target.value.length > 11) {
      setError('Names must be max 12 characters')
    } else if (e.target.value.length == 0) {
      setError('Please Enter a Name')
    } else {
      setError(null)
    }
    setNickName(e.target.value)
  }

  function joinGame() {
    // TODO: should check if game exists before pushing
    // history.push(`/online/${code.toUpperCase()}`)
    console.log({ gameID, nickName })
    socket.emit('join-game', { gameID, nickName })
  }

  function createGame() {
    socket.emit('create-game', nickName)
    // history.push(`/online/lobby/${genCode()}`)
  }

  const popover = (
    <Popover>
      <Popover.Title as="h3" className="text-center">Join or Create</Popover.Title>
      <Popover.Content>
        &emsp;Join a room which someone has already created and provided you a 24 digit code for to join
        <Form.Control className="my-1" value={gameID} placeholder="24 Digit Code" onChange={handleCode} />
        {error && <p className="text-danger text-center">{error}</p> }
        <Button onClick={joinGame} className="w-100" disabled={gameID.length !== 24 || error || nickName.length == 0}>Join with Code</Button>
        <hr/>
        &emsp;Create a new room which generates a 24 digit code for you to provide to another player to join
        <Button onClick={createGame} disabled={error || nickName.length == 0} className="w-100 mt-3">Create New Room</Button>
      </Popover.Content>
    </Popover>
  )

  return (
    <>
      <div className="mt-5">
        <Form.Control className="my-1" value={nickName} placeholder="NickName" onChange={handleName} />
        <Button className="w-100 my-2" onClick={() => history.push('/local')}>Play Against AI</Button>
      </div>
      <div>
        <OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
          <Button className="w-100 my-2">Challenge Player</Button>
        </OverlayTrigger>
      </div>
    </>
  )
}
