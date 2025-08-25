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
    const li = document.createElement('li')
    li.textContent = data 
    document.querySelector('ul').appendChild(li)
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