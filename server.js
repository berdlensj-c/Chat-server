/*
(c) 2023 Louis D. Nel
Based on:
https://socket.io
see in particular:
https://socket.io/docs/
https://socket.io/get-started/chat/

Before you run this app first execute
>npm install
to install npm modules dependencies listed in package.json file
Then launch this server:
>node server.js

To test open several browsers to: http://localhost:3000/chatClient.html

*/
const server = require('http').createServer(handler)
const io = require('socket.io')(server) //wrap server app in socket io capability
const fs = require('fs') //file system to server static files
const url = require('url'); //to parse url strings
const PORT = process.argv[2] || process.env.PORT || 3000 //useful if you want to specify port through environment variable
//or command-line arguments

const ROOT_DIR = 'html' //dir to serve static files from
let usernames = {}
function UserObj(id, username) {
    this.id = id;
    this.username = username;
}
const MIME_TYPES = {
    'css': 'text/css',
    'gif': 'image/gif',
    'htm': 'text/html',
    'html': 'text/html',
    'ico': 'image/x-icon',
    'jpeg': 'image/jpeg',
    'jpg': 'image/jpeg',
    'js': 'application/javascript',
    'json': 'application/json',
    'png': 'image/png',
    'svg': 'image/svg+xml',
    'txt': 'text/plain'
}

function get_mime(filename) {
    for (let ext in MIME_TYPES) {
        if (filename.indexOf(ext, filename.length - ext.length) !== -1) {
            return MIME_TYPES[ext]
        }
    }
    return MIME_TYPES['txt']
}

server.listen(PORT) //start http server listening on PORT

function handler(request, response) {
    //handler for http server requests including static files
    let urlObj = url.parse(request.url, true, false)
    console.log('\n============================')
    console.log("PATHNAME: " + urlObj.pathname)
    console.log("REQUEST: " + ROOT_DIR + urlObj.pathname)
    console.log("METHOD: " + request.method)

    let filePath = ROOT_DIR + urlObj.pathname
    if (urlObj.pathname === '/') filePath = ROOT_DIR + '/index.html'

    fs.readFile(filePath, function (err, data) {
        if (err) {
            //report error to console
            console.log('ERROR: ' + JSON.stringify(err))
            //respond with not found 404 to client
            response.writeHead(404);
            response.end(JSON.stringify(err))
            return
        }
        response.writeHead(200, {
            'Content-Type': get_mime(filePath)
        })
        response.end(data)
    })

}

//Socket Server
io.on('connection', function (socket) {
    console.log('client connected')
    //console.dir(socket)

    //socket.emit('serverSays', 'You are connected to CHAT SERVER')

    socket.on('clientSays', (data,private)=> {
        console.log('RECEIVED: ' + data)
        //to broadcast messages to verified users

        if(private == null){
            
            socket.broadcast.to('valid_users').emit('serverSays', data,'black')
            socket.emit('serverSays', data,'blue')
        }else{
            for(let i=0; i<private.length;i++){
                
                if(private[i].trim() in usernames){
                    socket.to(usernames[private[i].trim()].id).emit('serverSays', data,'red')
                }
            }
            socket.emit('serverSays', data,'red')
        }
           
        //alternatively to broadcast to everyone except the sender
        //socket.broadcast.emit('serverSays', data)
    })

    //when a user confirms a user sign up and adds id and username to array
    socket.on('signUp', user => {
        const newUser = new UserObj(socket.id,user)
        usernames[user] = newUser
        socket.emit('serverSays', 'You are connected to CHAT SERVER')
        socket.join("valid_users")
    })

    //checks to see if someone already has that username 
    socket.on('verify_user', username =>{
        if(username in usernames){
            socket.emit('verified',false)
        }else{
            socket.emit('verified',true)
        }
    })

    socket.on('disconnect', data=> {
        
        console.log('client disconnected')
    })
})

console.log(`Server Running at port ${PORT}  CNTL-C to quit`)
console.log(`To Test:`)
console.log(`Open several browsers to: http://localhost:${PORT}/chatClient.html`)