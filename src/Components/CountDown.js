import React, { useState, useEffect } from 'react'
import { socket } from '../constants'

export default function CountDown() {
  const [countDown, setCountDown] = useState('')
  const [msg, setMsg] = useState('')

  useEffect(() => {
    socket.on('timer', data => {
      setCountDown(data.countDown)
      setMsg(data.msg)
    })
    socket.on('done', () => {
      socket.removeListener('timer')
    })
  }, [])

  return (
    <>
      <h1>{countDown}</h1>
      <h3>{msg}</h3>
    </>
  )
}