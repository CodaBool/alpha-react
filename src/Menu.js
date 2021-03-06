import Button from 'react-bootstrap/Button'
import OverlayTrigger from 'react-bootstrap/OverlayTrigger'
import Modal from 'react-bootstrap/Modal'
import Popover from 'react-bootstrap/Popover'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import Col from 'react-bootstrap/Col'
import React, { useState, useEffect } from 'react'
import { useHistory } from 'react-router-dom'

export default function Menu() {
  const [gameID, setGameID] = useState('')
  // const [gameID, setGameID] = useState('')
  const [wins, setWins] = useState(null)
  const [nameError, setNameError] = useState('')
  const [error, setError] = useState('')
  const [name, setName] = useState(localStorage.getItem('name') || '')
  const [show, setShow] = useState(() => {if (localStorage.getItem('name')) return false; else return true})
  const history = useHistory()

  useEffect(() => {
    setWins(localStorage.getItem('wins') || 0)
  }, [])

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
      setNameError('Names must be max 12 characters')
    } else if (e.target.value.length == 0) {
      setNameError('Please Enter a Name')
      setName('')
    } else {
      setNameError(null)
      const char = e.target.value.slice(-1)
      if (char >= 'A' && char <= 'Z' || char >= 'a' && char <= 'z' || char == ' ') {
        localStorage.setItem('name', e.target.value)
        setName(e.target.value)
      } else {
        setNameError('Only letter characters Allowed')
      }
    }
  }

  function joinGame() {
    if (localStorage.getItem('name') && gameID) {
      history.push(`/online/join?gameID=${gameID}`)
    }
  }

  function createGame() {
    if (localStorage.getItem('name')) {
      history.push('/online/lobby')
    }
  }

  const popover = (
    <Popover>
      <Popover.Title as="h3" className="text-center">Join or Create</Popover.Title>
      <Popover.Content>
        &emsp;Join a room which someone has already created and provided you a 24 digit code for to join
        <Form.Control className="my-1" value={gameID} placeholder="24 Digit Code" onChange={handleCode} />
        {error && <p className="text-danger text-center">{error}</p> }
        <Button onClick={joinGame} className="w-100" disabled={gameID.length !== 24 || error || name.length == 0}>Join with Code</Button>
        <hr/>
        &emsp;Create a new room which generates a 24 digit code for you to provide to another player to join
        <Button onClick={createGame} disabled={error || name.length == 0} className="w-100 mt-3">Create New Room</Button>
      </Popover.Content>
    </Popover>
  )

  return (
    <div className="menuPage">
      <Row className="pt-5 m-0">
        <Col>
          <Button className="nameButton ml-auto d-block" onClick={() => setShow(true)}>{`${name ? name : 'Click to Enter Name'}`}</Button>
          <Button className="leftOtherButton my-3 ml-auto d-block">{wins ? wins : '0'} Wins</Button>
        </Col>
        <Col>
          <OverlayTrigger trigger="click" placement="bottom" overlay={popover}>
            <Button className="playButton">Play Now</Button>
          </OverlayTrigger>
          <Button className="rightOtherButton my-3 mr-auto d-block" onClick={() => history.push('/about')}>About</Button>
        </Col>
      </Row>
      
      <Row className="p-0 m-0">
        <video autoPlay loop src="/video/title.mp4" className="w-75 mx-auto"></video>
      </Row>
      <Modal show={show} onHide={() => { if (name.length > 0) setShow(false) }}>
        <Modal.Header>
          <Modal.Title>Enter a Name</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p className="text-danger">{nameError}</p>
          <Form.Control className="" value={name} placeholder="Name" onChange={handleName} />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" className="w-100" disabled={name.length == 0} onClick={() => setShow(false)}>Play</Button>
        </Modal.Footer>
      </Modal>
    </div>
  )
}
