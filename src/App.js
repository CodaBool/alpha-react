import React from 'react'
import Menu from './Menu'
import Local from './Local'
import Online from './Online'
import About from './About'
import Navigation from './Components/Navigation'

/* Navigation */
import { Switch, Route } from 'react-router-dom'
import Container from 'react-bootstrap/Container'
// import NavBox from './Components/NavBox'

export default function App() {
  return (
    <>
      <Navigation />
      {/* <NavBox /> */}
      <Container>
        <Switch>
          <Route exact path="/" component={Menu} />
          <Route exact path="/about" component={About} />
          <Route exact path="/local" component={Local} />
          <Route path="/online" component={Online} />
        </Switch>
      </Container>
    </>
  )
}
