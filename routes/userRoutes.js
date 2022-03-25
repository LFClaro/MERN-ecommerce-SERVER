const express = require('express');
const { check, validationResult } = require('express-validator');
const dotenv = require('dotenv').config();
let User = require('../models/User');
const bcrypt = require('bcryptjs');

const router = express.Router();

const jwt = require('jsonwebtoken');

//route Post /user
//desc Add a user
//access public
router.post(
    '/',
    [
        check('email', 'Please enter valid email').isEmail(),
        check('password', 'password need to be at least 12 char').isLength({
            min: 5,
        }),
    ],
    async (req, res) => {
        const errors = validationResult(req);

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
            const newUser = new User({
                email: req.body.email,
                password: password,
            });
            await newUser.save();

            const payload = {
                user: {
                    id: newUser.id,
                    name: newUser.name,
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
            return res.status(500).json({ error: 'Server erroe' });
        }
    }
);

module.exports = router;
