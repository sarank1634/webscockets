const socket = io('ws://localhost:3500') //env

const msgInput = document.querySelector('#message')
const nameInput = document.querySelector('#name')
const chatRoom = document.querySelector('#room')
const activity = document.querySelector('.activity')
const userlist = document.querySelector('.user-list')
const roomlist = document.querySelector('.room-list')



function sendMessage(e) {
    e.preventDefault()
    if(msgInput.value){
        socket.emit('message',msgInput.value)
           msgInput.value = ''
    }
    msgInput.focus()
}

document.querySelector('form')
 .addEventListener('submit',sendMessage)

 //listen for messages on 
 socket.on("message", (data) => {  
   activity.textContent = ""
    const li = document.createElement('li')
    li.textContent = data 
    document.querySelector('ul').appendChild(li)
 })

 //track who is curently active
 msgInput.addEventListener('keypress', () => {
    socket.emit('activity', socket.id.substring(0,5))
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