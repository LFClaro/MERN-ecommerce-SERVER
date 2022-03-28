const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.ObjectId;

const messageSchema = Schema({
    senderId: {
        type: ObjectId,
        require: true
    },
    senderDisplayName: {
        type: String,
        require: true
    },
    receiverId: {
        type: ObjectId,
        require: true
    },
    receiverDisplayName: {
        type: String,
        require: true
    },
    messageData: {
        type: String,
        require: true
    },
    date: {
        type: Date,
        default: Date.now(),
    },
})

module.exports = mongoose.model('Message', messageSchema);