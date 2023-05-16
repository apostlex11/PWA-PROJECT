// server/index.js

require('dotenv').config();
//console.log(process.env.HARPERDB_URL); // remove this after you've confirmed it working
//console.log(process.env.HARPERDB_PW);

const express = require('express');
const app = express();
const http = require('http');
const cors = require('cors');
const { Server } = require('socket.io');
const harperSaveMessage = require('./services/harper-save-messages'); 
const harperGetMessages = require('./services/harper-get-messages');
const leaveRoom = require('./utils/leave-room');

// we will need to integrate ApolloServer in order to utilize typeDefs, resolvers & authMiddleware context so that log in and sign up information is saved to the database (that same database will be needed in order to save W/L/T ratios and scoreboard/leaderboard info)

// will possibly need two apps, one for the chat functionality and one for the end-user to actually use that treats the former as if its an API or something

app.use(cors()); // Add cors middleware

const server = http.createServer(app);
const CHAT_BOT = 'ChatBot';

let chatRoom = ''; // E.g. javascript, node,...
let allUsers = []; // All users in current chat room

// Create an io server and allow for CORS from http://localhost:3000 with GET and POST methods
const io = new Server(server, {
    cors: {
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST'],
    },
})

  // Add a user to a room
// Listen for when the client connects via socket.io-client
io.on('connection', (socket) => {
    console.log(`User connected ${socket.id}`);

    // Add a user to a room
    socket.on('join_room', (data) => {
        const { username, room } = data; // Data sent from client when join_room event emitted
        socket.join(room); // Join the user to a socket room

        // Add this
        let __createdtime__ = Date.now(); // Current timestamp
        // Send message to all users currently in the room, apart from the user that just joined
        socket.to(room).emit('receive_message', {
            message: `${username} has joined the chat room`,
            username: CHAT_BOT,
            __createdtime__,
        });

        // Send welcome msg to user that just joined chat only
        socket.emit('receive_message', {
            message: `Welcome ${username}`,
            username: CHAT_BOT,
            __createdtime__,
        });

        // Save the new user to the room
        chatRoom = room;
        allUsers.push({ id: socket.id, username, room });
        chatRoomUsers = allUsers.filter((user) => user.room === room);
        socket.to(room).emit('chatroom_users', chatRoomUsers);
        socket.emit('chatroom_users', chatRoomUsers);

        //listen for the send_message event, then send the message to all users within the room
        socket.on('send_message', (data) => {
                const { message, username, room, __createdtime__ } = data;
                io.in(room).emit('receive_message', data); // Send to all users in room, including sender
                harperSaveMessage(message, username, room, __createdtime__) // Save message in db
                .then((response) => console.log(response))
                .catch((err) => console.log(err));
            });

         // Get last 100 messages sent in the chat room
        harperGetMessages(room)
        .then((last100Messages) => {
        // console.log('latest messages', last100Messages);
        socket.emit('last_100_messages', last100Messages);
        })
        .catch((err) => console.log(err));
    });

    socket.on('disconnect', () => {
        console.log('User disconnected from the chat');
        const user = allUsers.find((user) => user.id == socket.id);
        if (user?.username) {
            allUsers = leaveRoom(socket.id, allUsers);
            socket.to(chatRoom).emit('chatroom_users', allUsers);
            socket.to(chatRoom).emit('receive_message', {
                message: `${user.username} has disconnected from the chat.`,
            });
        }
    });
});

server.listen(4000, () => 'Server is running on port 4000');