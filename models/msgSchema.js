const { Schema } = require("mongoose");

const msgSchema = new Schema({
    sender: {
        type: String,
        require: true,
    },
    content: {
        type: String,
        require: true,
    },
    time: {
        type: Date,
        default: Date.now,
    }
},
    // { timestamps: true }
);

module.exports = msgSchema;