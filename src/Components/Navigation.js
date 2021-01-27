import { NavLink } from 'react-router-dom'
import Navbar from 'react-bootstrap/Navbar'
import Nav from 'react-bootstrap/Nav'

export default function Navigation() {
  return (
    <Navbar bg="dark" variant="dark" expand="lg">
      <Navbar.Brand>
        <NavLink to='/' exact>Type Racer</NavLink>
      </Navbar.Brand>
      <Navbar.Toggle />
      <Navbar.Collapse>
        <Nav>
          <NavLink to='/about' exact activeClassName="selected">About</NavLink>
        </Nav>
      </Navbar.Collapse>
    </Navbar>
  )
}