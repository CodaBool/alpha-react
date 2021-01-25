import axios from 'axios'
import React, { useState, useEffect, useRef } from 'react'
import Form from 'react-bootstrap/Form'
import Container from 'react-bootstrap/Container'
import Button from 'react-bootstrap/Button'
import io from 'socket.io-client'

// const socket = io('http://localhost:8080')

export default function App() {
  const [yourID, setYourId] = useState()
  const [messages, setMessages] = useState([])
  const [message, setMessage] = useState('')

  const socketRef = useRef()

  useEffect(() => {
    console.log('connect')
    socketRef.current = io.connect('http://localhost:8080')
    socketRef.current.on('connection', id => {
      console.log('got id =', id)
      setYourId(id)
    })
    socketRef.current.on('message', message => {
      console.log('got message =', message)
      receivedMessage(message)
    })
  }, [])

  function receivedMessage(message) {
    console.log('adding message =', message)
    setMessages(oldMsgs => [...oldMsgs, message])
  }

  function sendMessage(e) {
    e.preventDefault()
    console.log('sending final message =', message)
    const messageObject = {
      body: message,
      id: yourID,
    }
    setMessage('')
    socketRef.current.emit('send message', messageObject) // send to server
  }

  console.log(messages)

  return (
    <>
      <Container>
        {messages.length > 0 &&
          messages.map((message, index) => {
            if (message.id === yourID) {
              return (
                <p key={index}>{message.body}</p>
              )
            }
            return (
              <p key={index}>
                {message.body}
              </p>
            )
          })
        }
      </Container>
      <Form onSubmit={sendMessage}>
        <Form.Control placeholder="Enter Message" value={message} onChange={(e) => setMessage(e.target.value)} />
        <Button type="submit">Send</Button>
      </Form>
    </>
  )
}
