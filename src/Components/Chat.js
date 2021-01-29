// import React, { useState, useEffect, useRef } from 'react'
// import Form from 'react-bootstrap/Form'
// // import Col from 'react-bootstrap/Col'
// import Button from 'react-bootstrap/Button'
// import InputGroup from 'react-bootstrap/InputGroup'
// import io from 'socket.io-client'
// // import axios from 'axios'

// export default function Chat() {
//   const [yourID, setYourId] = useState()
//   const [messages, setMessages] = useState([])
//   const [message, setMessage] = useState('')

//   const socketRef = useRef()

//   useEffect(() => {
//     console.log('connect')
//     socketRef.current = io.connect('http://localhost:8080')
//     socketRef.current.on('connection', id => {
//       console.log('got id =', id)
//       setYourId(id)
//     })
//     socketRef.current.on('message', message => {
//       console.log('got message =', message)
//       receivedMessage(message)
//     })
//   }, [])

//   function receivedMessage(message) {
//     console.log('adding message =', message)
//     setMessages(oldMsgs => [...oldMsgs, message])
//   }

//   function sendMessage(e) {
//     e.preventDefault()
//     console.log('sending final message =', message)
//     const messageObject = {
//       body: message,
//       id: yourID,
//     }
//     setMessage('')
//     socketRef.current.emit('send message', messageObject) // send to server
//   }

//   return (
//     <div className="chat">
//       <div className="messages">
//         {messages.length > 0 &&
//           messages.map((message, index) => {
//             if (message.id === yourID) {
//               console.log('internal message')
//               return (
//                 <p key={index} className="myMsg rounded text-right">{message.body}</p>
//               )
//             }
//             return (
//               <p key={index} className="otherMsg">
//                 {message.body}
//               </p>
//             )
//           })
//         }
//       </div>
//       <div className="chatControls">
//         <Form onSubmit={sendMessage}>
//           <InputGroup className="">
//               <Form.Control placeholder="Enter Message" value={message} onChange={(e) => setMessage(e.target.value)} />
//             <InputGroup.Append>
//               <Button type="submit" variant="outline-primary">Send</Button>
//             </InputGroup.Append>
//           </InputGroup>
//         </Form>
//       </div>
//     </div>
//   )
// }