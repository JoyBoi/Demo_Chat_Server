const { PubSub, withFilter } = require("apollo-server-express");

const Room = require("../models/roomModel");
const pubsub = new PubSub();

const resolvers = {
    Query: {
        hello: () => {
            return "Hello World!";
        },

        getRoomList: async() => {
            try {
                return await Room.find();
            } catch (error) {
                console.log(error);
            }
        },

        getRoomByID: async(_, { id }) => {
            try {
                const room = await Room.findById(id);
                if (!room) {
                    throw new Error("Room not found");
                }
                return room;
            } catch (error) {
                console.log(error);
            }
        },

        getMsgListFromRoomByID: async(_, { id, msgid }) => {
            try {
                const room = await Room.findById(id);
                if (!room) {
                    throw new Error("Room not found");
                }
                const msg = room.msgs.find((o) => o.id === msgid);
                return msg;
            } catch (error) {
                console.log(error);
            }
        },

        getUserListFromRoom: async(_, { id }) => {
            try {
                const room = await Room.findById(id);
                if (!room) {
                    throw new Error("Room not found");
                }
                const userList = room.activeusers;
                return userList;
            } catch (error) {
                console.log(error);
            }
        },
    },

    Mutation: {
        addRoom: async(_, args) => {
            try {
                const { title, desc } = args.room;
                const room = new Room({ title, desc });
                await room.save();
                return room;
            } catch (error) {
                console.log(error);
            }
        },

        addMsgToRoom: async(_, { id, msgbody }) => {
            try {
                const room = await Room.findById(id);
                if (!room) {
                    throw new Error("Room not found");
                }
                const msgCount = room.msgs.push({
                    sender: msgbody.sender,
                    content: msgbody.content,
                });
                await room.save();
                pubsub.publish("MSG_UPDATE", {
                    roomID: id,
                    msgList: room.msgs[msgCount - 1],
                });
                //console.log(room.msgs[msgCount - 1])
                return room.msgs[msgCount - 1];
            } catch (error) {
                console.log(error);
            }
        },

        addUserToRoom: async(_, { id, username }) => {
            try {
                const room = await Room.findById(id);
                if (!room) {
                    throw new Error("Room not found");
                }
                const existUser = room.activeusers.find((o) => o.username === username);
                if (existUser) {
                    throw new Error("UserName already in use");
                }
                const userCount = room.activeusers.push({ username });
                await room.save();
                pubsub.publish("USER_UPDATE", {
                    roomID: id,
                    userList: room.activeusers[userCount - 1],
                });
                return room.activeusers[userCount - 1];
            } catch (error) {
                console.log(error);
            }
        },

        removeUserFromRoom: async(_, { id, userid }) => {
            try {
                const room = await Room.findById(id);
                if (!room) {
                    throw new Error("Room not found");
                }
                const existUser = room.activeusers.find((o) => o.id === userid);
                if (!existUser) {
                    throw new Error("User not found");
                }
                room.activeusers.pull({ _id: userid });
                await room.save();
                pubsub.publish("USER_UPDATE", { roomID: id, userList: existUser });
                // console.log(user);
                return "User Deleted";
            } catch (error) {
                console.log(error);
            }
        },
    },

    Subscription: {
        msgList: {
            subscribe: withFilter(
                () => pubsub.asyncIterator(["MSG_UPDATE"]),
                (payload, variables) => {
                    return payload.roomID === variables.id;
                }
            ),
        },

        userList: {
            subscribe: withFilter(
                () => pubsub.asyncIterator(["USER_UPDATE"]),
                (payload, variables) => {
                    // Only push an update if the comment is on
                    // the correct repository for this operation
                    return payload.roomID === variables.id;
                }
            ),
        },

        // deleteUser: {
        //     subscribe: () => pubsub.asyncIterator(['DELETE_USER']),
        // }
    },
};

module.exports = resolvers;