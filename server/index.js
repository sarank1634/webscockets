import express from 'express'
import {Server} from 'socket.io'
import path from 'path'
import { fileURLToPath } from 'url'

const  __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const PORT = process.env.PORT || 3500
const ADMIN = "Admin"

const app = express()

app.use(express.static(path.join(__dirname, 'public')))

const expressServer = app.listen(PORT, () => {
    console.log(`listening on port ${PORT}`)
})

// state 
const users = {
    users: [],
    setUser: function(newUsersArray) {
        this.users = newUsersArray
    }
}

const io = new Server(expressServer, {
    cors: {
        origin: process.env.NODE_ENV === "production" ? false :
         ["http://localhost:5500","http://127.0.0.1:5500"]
    }
})

io.on('connection', socket => {

    console.log(`User ${socket.id} connected`) // get user id 

    //upon connection 
     socket.emit('messgae', buildMsg(ADMIN, "Welcome to the chat!"))

     socket.on(`enterRoom`, ({name, room}) => {

        //leave previous room
        const prevRoom = getUser(socket.id)?.room

        if(prevRoom) {
            socket.leave(prevRoom)
            io.to(prevRoom).emit('message', buildMsg(ADMIN, `${name}
                has left the room`))
            }

        const user = activateUser(socket.id, name, room)
          // cannot  update previous room user list after the state update in activate user
          if(prevRoom) {
            io.to(prevRoom).emit('userList', {
                users: getUsersInRoom(prevRoom)
            })
          }

          //join room
          socket.join(user.room)

          // to user who joined
          socket.emit(`message`, buildMsg(ADMIN, 'You have joined  the  ${user.room} chat Room'))

          // To every else
          socket.broadcast.to(user.room).emit('message', buildMsg(ADMIN, `${user.name} has joined the room`))

          //Update user list for room
          io.to(user.room).emit('userList', {
            users: getUsersInRoom(user.room)
          })

          //Update rooms list for every one
          io.to('roomsList', {
            roomlist: getAllActiveRooms()
          })
        
     })

   //When the user is disconnected to all others
    socket.on('disconnect', () => {
        const usere = getUser(socket.id)
        userLeavesApp(socket.id)

        if(user) {
            io.to(user.room).emit('message', buildMsg(Admin,`{
              user.name } has been left the room`))

              io.to(user.room).emit('userList', {
                users: getUsersInRoom(user.room)
              })

              io.emit('roomList', {
                room: getAllActiveRooms()
              })
        }
        console.log(`User ${socket.id} disconnected`) // get user id 
    })

     //Listing for a message event
    socket.on('message', ({name, text}) => {
       const room = getUser(socket.id)?.room
       if(room) {
        io.to(room).emit('message', buildMsg(name, text))
       }
    })

    //Listing for activity
    socket.on('activity', (name) => {
        const room = getUser(socket.id)?.room
        if(room) {
            socket.broadcast.to(room).emit('activity', name)
        }
    })
})


function buildMsg(name, text){
    return {
        name,
        text,
        time: new Intl.DateTimeFormat('default', {
            hour: 'numeric',
            minute: 'numeric',
            second: 'numeric'
        }).format(new Date())
    }
}
    
//user function
function activateUser(id, name, room) {
    const user ={id, name, room}
    userState.setUser([
        ...userState.users.filter(user => user.id !== id),
        user 
    ])
    return user
}

function userLeavesApp(id){
    userState.setUser(
        userState.users.filter(user => user.id !== id)
    )
}

function getUser(id){
    return userState.users.find(user => user.id === id)
}


function getUsersInRoom(room){
    return userState.users.filter(user => user.room === room)
}

function getAllActiveRooms() {
    return Array.from(new Set(userState.users.map(user => user.room)))
}