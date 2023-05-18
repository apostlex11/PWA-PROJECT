require('dotenv').config();
const express = require('express');
const { createServer } = require('http');
const { ApolloServer } = require('apollo-server-express');
const { execute, subscribe } = require('graphql');
const { makeExecutableSchema } = require('@graphql-tools/schema')
const { createServer: createGraphQLServer } = require('graphql-ws/lib')
const { PubSub } = require('graphql-subscriptions');
const { ApolloServerPluginLandingPageGraphQLPlayground } = require('apollo-server-core');
const harperSaveMessage = require('./services/harper-save-messages');
const harperGetMessages = require('./services/harper-get-messages');
const leaveRoom = require('./utils/leave-room');
const { Server: SocketIOServer } = require('socket.io');

const pubsub = new PubSub();

const typeDefs = `
    type Query {
        hello: String
    }

    type Subscription {
        count: Int
    }
`;

const resolvers = {
    Query: {
        hello: () => 'Hello, world!'
    },
    Subscription: {
        count: {
            subscribe: () => pubsub.asyncIterator('COUNT_UPDATED')
        }
    }
};

const schema = makeExecutableSchema({ typeDefs, resolvers });

const app = express();

const apolloServer = new ApolloServer({
    schema,
    plugins: [
        ApolloServerPluginLandingPageGraphQLPlayground()
    ]
});

apolloServer.start().then(() => {
    apolloServer.applyMiddleware({ app });

    const httpServer = createServer(app);

    const subscriptionServer = createGraphQLServer(
        {
            schema,
            execute,
            subscribe,
            onConnect: () => console.log('Client connected to subscriptions.')
        }
    );

    subscriptionServer.installSubscriptionHandlers(httpServer);

    httpServer.listen(4000, () => {
        console.log('Server listening on port 4000!')
    });

    const io = new SocketIOServer(httpServer);
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

});