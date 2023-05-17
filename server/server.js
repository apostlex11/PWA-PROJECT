// need .env, cors and express for starters
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const http = require('http');

// ApolloServer stuff
const { ApolloServer } = require('apollo-server-express');
const path = require('path');
const { typeDefs, resolvers } = require('./schemas');
const { authMiddleware } = require('./utils/auth');
const db = require('./config/connectMongo');

// socket.io stuff
const { Server } = require('socket.io');
const ioApp = http.createServer(app);
const io = new Server(ioApp, {
    cors: {
        origin: 'http://localhost:3000',
        methods: ['GET', 'POST'],
    },
});

// HarperDB stuff
const harperSaveMessage = require('./services/harper-save-messages');
const harperGetMessages = require('./services/harper-get-messages');
const leaveRoom = require('./utils/leave-room');

// adding cors middleware
app.use(cors());

// general stuff
const app = express();
// const httpServer = require('http').createServer(app);
const cookieParser = require('cookie-parser');
const CHAT_BOT = 'ChatBot';

// chat stuff
let chatRoom = '';
let allUsers = [];

io.on('connection', (socket) => {
    console.log(`User connected ${socket.id}`);

    socket.on('join_room', (data) => {
        const { username, room } = data;
        socket.join(room);

        let __createdtime__ = Date.now();

        socket.to(room).emit('receive_message', {
            message: `${username} has joined the chat room`,
            username: CHAT_BOT, 
            __createdtime__,
        });

        chatRoom = room;
        allUsers.push({ id: socket.id, username, room });
        chatRoomUsers = allUsers.filter((user) => user.room === room);
        socket.to(room).emit('chatroom_users', chatRoomUsers);
        socket.emit('chatroom_users', chatRoomUsers);

        socket.on('send_message', (data) => {
            const { message, username, room, __createdtime__ } = data;
            io.in(room).emit('receive_message', data);
            harperSaveMessage(message, username, room, __createdtime__).then((response) => console.log(response)).catch((err) => console.log(err));
        });

        harperGetMessages(room).then((last100Messages) => {
            socket.emit('last_100_messages', last100Messages);
        }).catch((err) => console.log(err));
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

if (process.env.NODE_ENV === 'production') {
    app.use(express.static(path.join(__dirname, '../client/build')));
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/build/index.html'));
    });
} else {
    app.get('/', (req, res) => {
        res.sendFile(path.join(__dirname, '../client/public/index.html'));
    });
}

// not sure what this does but it's in the walkthrough
app.use(cookieParser());

const server = new ApolloServer({
    typeDefs,
    resolvers,
    context: authMiddleware,
});

const startApolloServer = async () => {
    await server.start();
    server.applyMiddleware({
        app,
        path: '/graphql',
        // not sure if we need cors middleware here if it's already being called in an app.use above
        // cors: {
        //     credentials: true,
        //     origin: process.env.DOMAIN_FULL + ':' + process.env.PORT || '3000'
        // }
    });

    db.once('open', () => {
        app.listen(PORT, () => {
            console.log(`API server running on port ${PORT}!`);
            console.log(`Use GraphQL at http://localhost:${PORT}${server.graphqlPath}`);
        });
        server.listen(4000, () => 'Server is running on port 4000');
    });
};

startApolloServer();