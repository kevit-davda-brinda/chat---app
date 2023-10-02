const path = require('path');
const express = require('express');
const http = require("http");
const socketio = require("socket.io");
const Filter = require("bad-words");
//import utis/messgaes
const { generateMessage, generateLocationMessage } = require('../src/utils/messages');
const { addUser, removeUser, getUser, getUserInRoom } = require('../src/utils/user');


const PORT = process.env.PORT || 3000;

const app = express();

const publicDirPath = path.join(__dirname, '../public')

app.use(express.static(publicDirPath))

const server = http.createServer(app);
const io = socketio(server);

let no_of_new_client = 0;

io.on('connection', (server_socket) => {
    console.log(' Server Socket Connnected Suceesfuly');

    server_socket.on('join', ({ username, room }, callback) => {

        //add user
        const { error, user } = addUser({ id: server_socket.id, userName: username, room });

        if (error) {
            return callback(error);
        }

        server_socket.join(user.room);
        server_socket.emit('message', generateMessage('Admin','Welcome!'))
        server_socket.broadcast.to(user.room).emit('message', generateMessage('Admin', `${user.userName} has joined!`));

        io.to(user.room).emit('roomData' , {
            room : user.room,
            users : getUserInRoom(user.room),
        })

        callback();
    })

    server_socket.on('sendMessage', (message, callback) => {

        const user = getUser(server_socket.id);

        // console.log(user.userName);

        const filter = new Filter();

        if (filter.isProfane(message)) {
            return callback('Profanity is not allowed!')
        }

        io.to(user.room).emit('message', generateMessage(user.userName, message ))
        callback();
    })

    server_socket.on('disconnect', () => {
        //remove user
        const user = removeUser(server_socket.id);

        if (user) {
            io.to(user.room).emit('message', generateMessage('Admin',`${user.userName} has left!` ));
            io.to(user.room).emit('roomData' , {
                room : user.room,
                users : getUserInRoom(user.room),
            })
    
        }
    })

    server_socket.on('sendLocation', ({ lat, long }, callback) => {
        const user = getUser(server_socket.id);

        io.to(user.room).emit('locationMessage', generateLocationMessage(user.userName, `https://google.com/maps?q=${lat},${long}`));
        callback();
    })



})

app.get("", (req, res) => {
    res.sendFile('./index.html');
});

server.listen(PORT, () => {
    console.log('server is running on port : ' + PORT)
})