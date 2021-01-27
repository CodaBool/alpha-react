import io from 'socket.io-client'

// export function genCode() {
// 	const chars = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXTZ"
// 	const string_length = 5
//   let randomstring = ''
// 	for (let i = 0; i < string_length; i++) {
// 		var rnum = Math.floor(Math.random() * chars.length)
// 		randomstring += chars.substring(rnum,rnum+1)
// 	}
// 	return randomstring
// }

export const socket = io('http://localhost:8080')