const socket = io('ws://localhost:3500') //env

const msgInput = document.querySelector('#message')
const nameInput = document.querySelector('#name')
const chatRoom = document.querySelector('#room')
const activity = document.querySelector('.activity')
const userlist = document.querySelector('.user-list')
const roomlist = document.querySelector('.room-list')
const chatDisplay = document.querySelector('.Chat-display')

function sendMessage(e) {
    e.preventDefault()
    if(nameInput.value && msgInput.value && chatRoom.value){
        socket.emit('message', {
        name: nameInput.value ,
        text: msgInput.value
    })
   msgInput.value= ""
    }
    nameInput.focus()
}

function enterRoom(e){
   e.preventDefault()
   if(nameInput.value && chatRoom.value) {
      socket.emit('join', {
         name: nameInput.value,
         room: chatRoom.value
      })
   }
}

document.querySelector('.form-msg')
 .addEventListener('submit',sendMessage)

 document.querySelector('.form-join')
 .addEventListener('submit',enterRoom)

 //track who is curently active
 msgInput.addEventListener('keypress', () => {
   socket.emit('activity', nameInput.value)
})

 //listen for messages on 
 socket.on("message", (data) => {  
   activity.textContent = ""
   const {name, text, time} = data
    const li = document.createElement('li')
    li. className = 'post'
    if(name === nameInput.value) li.className = `psot post--left`
    if(name !== nameInput.value && name !== ADMIN) 
      li.className = `post post--right`
     if(name !== 'Admin') {
      li.innerHTML = `<div class="post__header ${name ===
         nameInput.value
         ? 'post__header--user'
         : 'post__header--reply'
      }">
      <span class="post__header--name">${name}</span>
      <span class="post__header--time">${time}</span>
      </div>
      <div class="post__text">${text}</div> `
     } else {
      li.innerHTML = `<div className="post__text">${text}</div>`
     }
    document.querySelector('.chat-display').appendChild(li)

    chatDisplay.scrollTop = chatDisplay.scrollHeight
 })

 let activityTimer ;
 socket.on('activity', (name) => {
    activity.textContent = `${name} is typing...`

    //clear after 3 seconds
    clearTimeout(activityTimer)
    activityTimer = setTimeout(() => {
      activity.textContent = ""
    }, 3000)
 })

socket.on('userList', ({users}) => {
   showusers(users)
})

socket.on('roomList', ({rooms}) => {
   showRooms(rooms)
})

 function showusers(users){
   userlist.textContent = ""
   if(users) {
      userlist.innerHTML = `<em>Users in ${chatRoom.value}</em> `
      users.forEach((user,id) => {
       userlist.textContent +=  ` ${user.name}`
       if(users.length > 1 && id !== users.length -1) {
       userlist.textContent += ", "
       }

   })
  }
 }

 function showRooms(rooms){
   userlist.textContent = ""
   if(rooms) {
      userlist.innerHTML = `<em>Users in ${chatRoom.value}</em> `
      rooms.forEach((room,id) => {
       userlist.textContent +=  ` ${room.name}`
       if(rooms.length > 1 && id !== rooms.length -1) {
       userlist.textContent += ", "
       }

   })
}
 }