const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const { connect } = require("mongoose");

const typeDefs = require("./schema/typeDefs");
const resolvers = require("./schema/resolvers");
const { userJoin, getRoomUsers, userLeave } = require("./utils/users");
const formatMessage = require("./utils/messages");

async function startServer() {
    const app = express();
    const httpServer = require("http").createServer(app);
    const PORT = process.env.PORT || 3000;

    const apolloServer = new ApolloServer({
        typeDefs,
        resolvers,
        cors: {
            origin: "*",
        },
        // tracing: true,
        // subscriptions: {
        //     // path: '/subscriptions',
        //     onConnect: (connectionParams, webSocket, context) => {
        //         console.log(webSocket)
        //     },
        //     onDisconnect: (webSocket, context) => {
        //         // console.log(context)
        //     },
        // }
    });
    try {
        await apolloServer.start();
        apolloServer.applyMiddleware({ app });

        // apolloServer.installSubscriptionHandlers(app);
        // apolloServer.installSubscriptionHandlers(httpServer);

        await connect(
            `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PW}@demonchatcluster.cuyem.mongodb.net/${process.env.MONGO_DB}?retryWrites=true&w=majority`, {
                useUnifiedTopology: true,
                useNewUrlParser: true,
                useFindAndModify: false,
            }
        );
        console.log(`Mongoose Connected...\nAPI at: ${PORT}/graphql`);

        const options = {
            // path: "/socket.io",
            cors: {
                origin: "*",
            },
        };
        const io = require("socket.io")(httpServer, options);

        // app.get('/socket.io', (req, res) => {
        //     res.sendFile(__dirname + '/index.html');
        // });
        // io.use((socket, next) => {
        //     const username = socket.handshake.auth.username;
        //     if (!username) {
        //         return next(new Error("invalid username"));
        //     }
        //     socket.username = username;
        //     next();
        // });
        const botName = "Chat-Bot";

        io.on("connection", (socket) => {
            let user;
            socket.on("joinRoom", ({ username, room }) => {
                user = userJoin(socket.id, username, room);

                socket.join(user.room);
                // console.log(user);

                socket.emit(
                    "botMsg",
                    formatMessage(botName, `Welcome to ${user.room} chat room.`)
                );

                socket.broadcast
                    .to(user.room)
                    .emit(
                        "botMsg",
                        formatMessage(botName, `${user.username} has joind the chat.`)
                    );

                io.to(user.room).emit("roomUsers", getRoomUsers(user.room));
            });

            socket.on("chatMsg", ({ msgid }) => {
                // console.log(msgid);
                socket.broadcast.to(user.room).emit("newMsg", msgid);
            });

            socket.on("disconnect", () => {
                const user = userLeave(socket.id);
                if (user) {
                    io.to(user.room).emit(
                        "botMsg",
                        formatMessage(botName, `${user.username} has left the chat`)
                    );
                    io.to(user.room).emit("roomUsers", getRoomUsers(user.room));
                }
            });
            // console.log("New Socket Connection at: " + socket.username);
            // const users = [];
            // for (let [id, socket] of io.of("/").sockets) {
            //     users.push({
            //         userID: id,
            //         username: socket.username,
            //     });
            // }
            // socket.emit("users", users);

            // socket.broadcast.emit("userConnected", {
            //     userID: socket.id,
            //     username: socket.username,
            // });

            // socket.on("newMsg", () => {
            //     socket.broadcast.emit("getNewMsg");
            // });

            // socket.on("disconnect", () => {
            //     console.log(socket.username + " disconnected");
            //     socket.broadcast.emit("userDisconnected", {
            //         userID: socket.id,
            //         username: socket.username,
            //     });
            // });
        });

        httpServer.listen(PORT, () => console.log(`Socket at: ${PORT}`));

        return httpServer
        // app.use((req, res) => {
        //     res.send("From Express server");
        // });

        // app.listen(4000, () => console.log("Server is running on port 4000"));
    } catch (error) {
        console.log(error);
    }
}
const app = await startServer();

export default app
