import React, { useEffect, useState, useRef, useCallback } from 'react'
import Form from 'react-bootstrap/Form'
import { socket, debounce } from '../constants'

export default function Game({ gameState, gameStarted }) {
  const [input, setInput] = useState('')
  const [quote, setQuote] = useState('')
  const inputRef = useRef()
  const quoteDisplay = useRef()

  useEffect(() => {
    setQuote(gameState.quote.split(''))
    setInput('')
    inputRef.current.focus()
  }, [])

  const performantUpdate = useCallback(
    debounce(() => updatePercent(), 1000), []
  )

  function updatePercent() {
    let percent = 0
    const inputValue = quoteDisplay.current?.querySelectorAll('.correct').length
    const quoteValue = gameState.quote.length
    percent = (inputValue / quoteValue).toFixed(1) * 100
    // check if percent is different
    const player = gameState.players.find(player => player.socketID === socket.id)
    if (player.percent !== percent && percent) {
      console.log('update', player.percent, 'to', percent)
      socket.emit('progress', { percent, gameID: gameState._id })
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
      updatePercent() // fast
    } else {
      performantUpdate() // performant
    }
  }
  
  return (
    <div className="mb-4">
      <div ref={quoteDisplay} className={`${gameStarted && 'text-muted'} quoteDisplay`}>
        {quote
          ? quote.map((char, index) => {
              return <span key={index}>{char}</span>
            })
          : <p>Loading</p>
        }
      </div>
      <p>{gameStarted ? 'started' : 'not started'}</p>
      <Form.Control as="textarea" value={input} ref={inputRef} disabled={!gameStarted} className="gameInput" onChange={changeInput} rows={4} />
      {/* <Form.Control className="" value={input} placeholder="" ref={inputRef} onChange={changeInput} /> */}
    </div>
  )
}