//connect to server and retain the socket
//connect to same host that served the document

//const socket = io('http://' + window.document.location.host)
const socket = io() //by default connects to same server that served the page
let username = null
messageArea = document.getElementById('create_message')

socket.on("verified", bool =>{

	if(bool){
		document.getElementById('createuser').style.display = 'none'
		messageArea.style.display = 'block'
		socket.emit('signUp', username)
	}else{
		alert("username already taken")
		username = null
	}
})

socket.on('serverSays', function (message, bool) {
	let msgDiv = document.createElement('div')
	/*
	What is the distinction among the following options to set
	the content? That is, the difference among:
	.innerHTML, .innerText, .textContent
	*/
	//msgDiv.innerHTML = message
	//msgDiv.innerText = message


	msgDiv.textContent = message
	if(message.includes(username)&&username!=null){
		msgDiv.id = "user"
	}else{
		msgDiv.id = "other"
	}

	msgDiv.style.color = bool
	if(username!=null){
		document.getElementById('messages').appendChild(msgDiv)
	}
})
hjfhg

function sendMessage() {

	let message =  document.getElementById('msgBox').value.trim()
	let temp = null
	if(message.includes(':')){
		temp = message.split(':')[0].split(',')
		message = message.split(':')
		message = username+":"+message[1]
	}else{
		message = username+": "+message
	}
	
	if (message === ''||username ==null) return //do nothing
	socket.emit('clientSays', message,temp)
	document.getElementById('msgBox').value = ''
}


function handleKeyDown(event) {
	const ENTER_KEY = 13 //keycode for enter key
	if (event.keyCode === ENTER_KEY) {
		if(messageArea.style.display == 'none'){
			createUser()
		}else{
			sendMessage()
		}
		return false //don't propogate event
	}
}

//clears screen of messages
function clear(){
	document.getElementById('messages').innerHTML =""
}

//creates a user and saves their username  
function createUser() {
	username = document.getElementById('userbox').value.trim('')
	//checking input
	let temp = username.charAt(0); 
	if (!isNaN(temp)) {
		alert('Username must start with a letter.');
		return;
	}	

	if (username === '') {
		alert("must put a username")
		return 
	}

	socket.emit('verify_user', username)
	
}

//Add event listeners
document.addEventListener('DOMContentLoaded', function () {
	//This function is called after the browser has loaded the web page

	//add listener to buttons
	document.getElementById('send_button').addEventListener('click', sendMessage)
	document.getElementById('user_button').addEventListener('click', createUser)
	document.getElementById('clear_button').addEventListener('click', clear)
	//add keyboard handler for the document as a whole, not separate elements.
	document.addEventListener('keydown', handleKeyDown)
	//document.addEventListener('keyup', handleKeyUp)
})