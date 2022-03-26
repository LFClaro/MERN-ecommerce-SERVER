const express = require('express');
const { check, validationResult } = require('express-validator');
const dotenv = require('dotenv').config();
let User = require('../models/User');
const authMiddleware = require('../middlewares/auth');

const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

//auth
//Post
//validate and authorize users by jwt
router.post('/',
    [
        check('email', 'Please enter valid email').isEmail(),
        check('password', 'Password need to be at least 12 Chars long').isLength({ min: 5 })
    ],
    async (req, res) => {
        const errors = validationResult(req); //Returns: a Result object
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() }) //Returns: an array of validation errors.
        }

        try {
            const { email, password } = req.body;
            let user = await User.findOne({ email });
            if (!user) {
                return res.status(400).json({ errors: 'Invalid credential' });
            }

            await bcrypt.compare(password, user.password, (err, result) => {
                if (!result) {
                    return res.status(401).json({ errors: 'That password is incorrect, please try again' })
                }

                const payload = {
                    user: {
                        id: user.id,
                        email: user.email,
                    }
                }

                //issue the jwt
                jwt.sign(
                    payload,
                    process.env.JWT_SECRET,
                    { expiresIn: 360000 },
                    (err, token) => {
                        if (err) throw err;
                        res.status(200).json({ token })
                    }
                );
            });

            // if (!isMatch) {
            //     return res.status(400).json({ errors: 'Invalid credential 2' });
            // }

        } catch (err) {
            console.log(err.message);
            const errMsg = err.message;
            return res.status(500).json({ error: errMsg })
        }

    })

module.exports = router;