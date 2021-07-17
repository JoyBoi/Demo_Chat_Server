const { Schema, model } = require("mongoose");

const msgSchema = require("./msgSchema");
const userSchema = require("./userSchema");

const roomSchema = new Schema({
    title: {
        type: String,
        require: true,
    },
    desc: {
        type: String,
    },
    msgs: [msgSchema],
    activeusers: [userSchema],
});

const Room = model('room', roomSchema);
// const Msg = model('msg', msgSchema);
// const User = model('user', userSchema);
// module.exports = { Room, Msg, User };
module.exports = Room;

//mongodb+srv://adminJoy:<password>@demonchatcluster.cuyem.mongodb.net/test

