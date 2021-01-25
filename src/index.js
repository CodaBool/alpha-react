import React from 'react'
import ReactDOM from 'react-dom'
import 'bootstrap/dist/css/bootstrap.min.css'
import './global.css'

import App from './App'

/* Navigation */
import { BrowserRouter, Switch, Route, NavLink } from 'react-router-dom'
import Navbar from 'react-bootstrap/Navbar'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import NavBox from './Components/NavBox'
import Welcome from './Components/Welcome'

function Navigation() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand>
        <NavLink to='/' exact>Home</NavLink>
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Nav>
          <NavLink to='/' exact activeClassName="selected">app</NavLink>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}

ReactDOM.render(
  <BrowserRouter>
    <Navigation />
    <NavBox />
    <Welcome />
    <Container>
      <Switch>
        <Route path="/" exact component={App} />
      </Switch>
    </Container>
  </BrowserRouter>,
  document.getElementById('root')
)