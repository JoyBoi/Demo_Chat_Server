const { gql } = require("apollo-server-express");

const typeDefs = gql `
  type Room {
    id: ID!
    title: String!
    desc: String
    msgs: [Msg]
    activeusers: [User]
  }

  type User {
    id: ID!
    username: String!
  }

  type Msg {
    id: ID!
    sender: String!
    content: String!
    time: String!
  }

  type Query {
    hello: String

    getRoomList: [Room!]

    getRoomByID(id: ID!): Room

    getMsgListFromRoomByID(id: ID!, msgid: ID!): Msg

    getUserListFromRoom(id: ID!): [User]
  }

  input RoomInput {
    title: String!
    desc: String
  }

  input MsgInput {
    sender: String!
    content: String!
  }

  type Mutation {
    addRoom(room: RoomInput): Room

    addMsgToRoom(id: ID!, msgbody: MsgInput): Msg

    addUserToRoom(id: ID!, username: String!): User

    removeUserFromRoom(id: ID!, userid: ID!): String
  }

  type Subscription {
    msgList(id: ID!): Msg!

    userList(id: ID!): User!

    # deleteUser: User!
  }
`;

module.exports = typeDefs;