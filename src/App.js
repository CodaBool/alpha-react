import React from 'react'
import Menu from './Menu'
// import Local from './Local'
import Online from './Online'
import About from './About'

/* Navigation */
import { Switch, Route } from 'react-router-dom'
// import NavBox from './Components/NavBox'

export default function App() {
  return (
    <>
      {/* <NavBox /> */}
      <Switch>
        <Route exact path="/" component={Menu} />
        {/* <Container> */}
          <Route exact path="/about" component={About} />
          {/* <Route exact path="/local" component={Local} /> */}
          <Route path="/online" component={Online} />
        {/* </Container> */}
      </Switch>
    </>
  )
}
