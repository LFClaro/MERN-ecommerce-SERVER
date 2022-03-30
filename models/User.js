const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = Schema({
    fname: {
        type: String,
    },
    lname: {
        type: String,
    },
    email: {
        type: String,
        require: true,
        unique: true,
        lowercase: true,
    },
    password: {
        type: String,
        require: true,
    },
    role: {
        type: String,
        require: true,
        default: "guest",
    },
    date: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = mongoose.model('User', userSchema);
