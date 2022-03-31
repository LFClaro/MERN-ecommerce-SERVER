const express = require('express');
const { check, validationResult } = require('express-validator');
const dotenv = require('dotenv').config();
let User = require('../models/User');
const bcrypt = require('bcryptjs');

const router = express.Router();

const jwt = require('jsonwebtoken');

//Route GET api/users
//model: Get all users
//Access: public
router.get('/', async (req, res) => {
    try {
        const userDB = await User.find();
        res.send(userDB);
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ error: 'SERVER ERROR: ' + err.message });
    }
});

//route Post api/users
//desc Add a user
//access public
router.post(
    '/',
    [
        check('email', 'Please enter valid email').isEmail(),
        check('password', 'Password needs to be at least 10 characters long.').isLength({
            min: 5,
        }),
    ],
    async (req, res) => {
        const errors = validationResult(req);

        //reutn result if there is any format errors
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            let user1 = await User.findOne({ email: req.body.email });
            if (user1) {
                return res.status(400).json({ errors: 'Email already exist' });
            }

            const salt = await bcrypt.genSalt(10);
            const password = await bcrypt.hash(req.body.password, salt);
            //create a new user and saved in the MongoDB
            const newUser = new User({
                email: req.body.email,
                password: password,
            });
            await newUser.save();

            // console.log('New User saved to mongoDB: ', newUser);

            const payload = {
                user: {
                    id: newUser.id,
                    email: newUser.email,
                },
            };

            jwt.sign(
                payload,
                process.env.JWT_SECRET,
                { expiresIn: 36000 },
                (err, token) => {
                    if (err) throw err;
                    res.json({ token });
                }
            );
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ error: 'SERVER ERROR: ' + err.message });
        }
    }
);

module.exports = router;
