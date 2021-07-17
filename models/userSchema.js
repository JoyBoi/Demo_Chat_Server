const { Schema } = require("mongoose");

const userSchema = new Schema({
    username: {
        type: String,
        require: true,
    }
});

module.exports = userSchema;