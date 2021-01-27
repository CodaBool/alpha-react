import React, { useEffect, useState } from 'react'
import { useHistory } from 'react-router-dom'

import { socket } from './constants'

import Menu from './Menu'
import Local from './Local'
import Lobby from './Lobby'
import About from './About'
import Navigation from './Components/Navigation'

/* Navigation */
import { Switch, Route } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
// import NavBox from './Components/NavBox'

export default function App() {
  const [gameState, setGameState] = useState({ _id: '', isOpen: false, players: [], words: [] })
  const history = useHistory()

  useEffect(()=>{
    socket.on('updateGame', (game) => {
      console.log(game)
      setGameState(game)
    })
    return () => {
      socket.removeAllListeners()
    }
  }, [])

  useEffect(()=>{
    if (gameState._id !== "") {
      console.log('found gameState', gameState)
      history.push(`/online/${gameState._id}`)
    }
  }, [gameState._id])

  return (
    <>
      <Navigation />
      {/* <NavBox /> */}
      <Container>
        <Switch>
          <Route path="/" exact component={Menu} />
          <Route path="/about" exact component={About} />
          <Route path="/local" exact component={Local} />
          <Route path="/online/:code"
            render={() => <Lobby gameState={gameState} />}
          />
        </Switch>
      </Container>
    </>
  )
}
