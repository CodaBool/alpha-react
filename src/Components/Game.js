import React, { useEffect, useState, useRef } from 'react'
import Form from 'react-bootstrap/Form'

export default function Game({ gameState }) {
  const [input, setInput] = useState('')
  const [quote, setQuote] = useState([])
  const inputRef = useRef()
  const quoteDisplay = useRef()

  useEffect(() => {
    console.log(gameState.words[0])
    // const rawData = allData[Math.floor(Math.random() * allData.length)]
    setQuote(gameState.words[0].split(''))
    setInput('')
    inputRef.current.focus()
  }, [])

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

    if (correct) finish()
  }

  function finish() {

  }
  
  return (
    <div className="mb-4">
      <div ref={quoteDisplay} className="quoteDisplay">
        {quote
          ? quote.map((char, index) => {
              return <span key={index}>{char}</span>
            })
          : <p>Loading</p>
        }
      </div>
      <Form.Control as="textarea" value={input} ref={inputRef} className="gameInput" onChange={changeInput} rows={4} />
      {/* <Form.Control className="" value={input} placeholder="" ref={inputRef} onChange={changeInput} /> */}
    </div>
  )
}