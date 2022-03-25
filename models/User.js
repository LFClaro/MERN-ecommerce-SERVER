const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userSchema = Schema({
    fname: {
        type: String,
        require: true,
    },
    lname: {
        type: String,
        require: true,
    },
    email: {
        type: String,
        require: true,
        unique: true,
    },
    password: {
        type: String,
        require: true,
    },
    date: {
        type: Date,
        default: Date.now(),
    },
});

module.exports = mongoose.model('User', userSchema);
