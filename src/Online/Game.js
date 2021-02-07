import React, { useEffect, useState, useRef, useCallback } from 'react'
import Form from 'react-bootstrap/Form'
import Button from 'react-bootstrap/Button'

// import Cars from '../Components/Cars'
import { socket } from '../constants'

export default function Game({ game }) {
  const [input, setInput] = useState('')
  const [quote, setQuote] = useState('')

  const inputRef = useRef()
  const quoteDisplay = useRef()

  useEffect(() => {
    setQuote(game.quote.split(''))
    setInput('')
    inputRef.current.focus()
  }, [])

  useEffect(() => inputRef.current.focus(), [game.isTypable])

  function updatePercent() {
    let percent = 0
    const inputValue = quoteDisplay.current?.querySelectorAll('.correct').length
    const quoteValue = game.quote.length
    percent = Math.floor((inputValue / quoteValue) * 100)
    // // check if percent is different
    const player = game.players.find(player => player.socketID === socket.id)
    if (player.percent !== percent && percent) {
      console.log('update', player.percent, 'to', percent)
      socket.emit('progress', { percent, gameID: game._id })
    }
  }

  function changeInput(e) {
    const arrayQuote = quoteDisplay.current.querySelectorAll('span')
    const arrayValue = e.target.value.split('')
    setInput(e.target.value)
  
    let correct = true
    arrayQuote.forEach((characterSpan, index) => {
      const character = arrayValue[index]
      if (character == null) {
        characterSpan.classList.remove('correct')
        characterSpan.classList.remove('incorrect')
        correct = false
      } else if (character === characterSpan.innerText) {
        characterSpan.classList.add('correct')
        characterSpan.classList.remove('incorrect')
      } else {
        characterSpan.classList.remove('correct')
        characterSpan.classList.add('incorrect')
        correct = false
      }
    })
    
    if (correct) {
      updatePercent() // complete
    } else {
      if (e.target.value?.slice(-1) == ' ') { // update progress on percentages
        updatePercent()
      }
    }
  }

  function giveUp() {
    const player = game.players.find(player => player.socketID === socket.id)
    socket.emit('give-up', { gameID: game._id, playerID: player._id })
  }
  
  return (
    <div className="mb-4">
      
      <div ref={quoteDisplay} className="quoteDisplay">
        {quote && quote.map((char, index) => <span key={index}>{char}</span>)}
      </div>
      <Form.Control 
        as="textarea" 
        onPaste={(e) => e.preventDefault()} 
        onDragStart={(e) => e.preventDefault()} 
        onDrop={(e) => e.preventDefault()} 
        autoComplete="off"
        value={input} 
        ref={inputRef} 
        disabled={!game.isTypable} 
        className="gameInput" 
        onChange={changeInput} 
        rows={4} 
      />
      {/* <Button variant='secondary-outline' onClick={giveUp}>Give Up</Button> */}
    </div>
  )
}