const express = require('express');
const router = express.Router();
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');
const auth = require('../middlewares/auth');

// models
let Message = require("../models/message")
let User = require('../models/User');
const Profile = require('../models/Profile');

// Checks if user on the URL matches what's in the token
function isVerifiedUser(urlId, authId) {
    if (urlId === authId) {
        return true
    }

    return false
}

// get contacts
router.post("/contacts", auth, async (req, res) => {
    let err = validationResult(req);

    if (!err.isEmpty()) {
        return res.status(400).json({ errors: err.array() });
    }

    let senderId = mongoose.Types.ObjectId(req.user.id)

    try{ 
        // get all users except current user
        const profileDB = await Profile.find( { user: { $ne: senderId } } );
        res.send(profileDB); 

    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ error: 'SERVER ERROR: ' + err.message });
    }
    
})

// get all messages related to this senderId
router.post("/", auth, async (req, res) => {

    let err = validationResult(req);

    if (!err.isEmpty()) {
        return res.status(400).json({ errors: err.array() });
    }

    let senderId = req.user.id

    // get the messages this user sent and received
    await Message.find({ $or: [{ senderId: senderId }, { receiverId: senderId }] })
        .then((result) => {
            if (!result) {
                return res.send("Conversation not found")
            }

            return res.send(result)
        })
        .catch((err) => {
            // mongoose trying to convert string to object
            if (err instanceof mongoose.CastError)
                return res.send("Conversation not found")

            return res.status(500).send(err)
        })
})

// get all messages related to this sender and receiver
router.post("/to/:receiverId", auth, async (req, res) => {

    let err = validationResult(req);

    if (!err.isEmpty()) {
        return res.status(400).json({ errors: err.array() });
    }


    let senderId = mongoose.Types.ObjectId(req.user.id)
    let receiverId = mongoose.Types.ObjectId(req.params.receiverId)

    // get the messages this user sent and received
    await Message.find({ $or: [{ senderId: senderId, receiverId: receiverId }, { senderId: receiverId, receiverId: senderId }] })
        .then((result) => {
            if (!result) {
                return res.send("Conversation not found")
            }

            return res.send(result)
        })
        .catch((err) => {
            // mongoose trying to convert string to object
            if (err instanceof mongoose.CastError)
                return res.send("Conversation not found")

            return res.status(500).send(err)
        })
})

// new message
router.post("/create", auth,
    [
        check("receiverId", "receiverId is required").not().isEmpty(),
        check("messageData", "messageData is required").not().isEmpty()
    ],
    async (req, res) => {
        try {
            var err = validationResult(req);
            if (!err.isEmpty()) {
                return res.status(400).json({ errors: err.array() });
            }

            const message = new Message()
            message.senderId = mongoose.Types.ObjectId(req.user.id)
            message.receiverId = mongoose.Types.ObjectId(req.body.receiverId)
            message.messageData = req.body.messageData

            // get the name of the receiver
            const receiverDisplayName = await Profile.find( { user: message.receiverId } )
            message.receiverDisplayName = receiverDisplayName.firstname + " " + receiverDisplayName.lastname

            // get the name of the sender
            const senderDisplayName = await Profile.find( { user: message.senderId } )
            message.senderDisplayName = senderDisplayName.firstname + " " + senderDisplayName.lastname

            // save message
            message.save(message)
                .then((result) => {
                    return res.status(200).send(result)
                })

        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ error: 'SERVER ERROR: ' + err.message });
        }

    });

module.exports = router;