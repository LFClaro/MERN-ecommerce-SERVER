const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/auth');
const {check, validationResult} = require('express-validator');  //it is a middleware to validate

let User = require('../models/User');

router.post('/', 
[
    check('email')
                .not().isEmpty()
                .withMessage('Email is required.')
                .isEmail()
                .withMessage('Please provide a valid email address'),
    check('password', 'Enter password').not().isEmpty(),
], 
async (req,res)=> {
    const errors = validationResult(req);
    if(!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
    }
   
    try {
        //This will check the email of the user
        const {email, password} = req.body;
        let user = await User.findOne({email});
        if(!user) {
            return res.status(400).json({errors:"No user found"});
        }

        //This will check the password of the user
        const isMatch = await bcrypt.compare(password, user.password);
        if(!isMatch) {
            return res.status(400).json({errors:"Invalid Password"});
        }

        //This will check the role of the user
        // const role = user.role;
        // if(role != "admin") {
        //     return res.status(400).json({errors:"Credentials are not enought to see this page"});
        // }

        const payload = {
            user: {
                id: user.id,
                name: user.name,
            },
        };
        
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: 36000},
            (err, token) => {
                if(err) throw err;
                res.json({token});
            }
        );
    } catch (err) {
       return res.status(500).send('Server error');
    }

});

router.get('/',
authMiddleware,
async (req, res) => {
    
    try{
        const user = await User.findById(req.user.id).select('-password') ; //It wont send password
        res.send(user);
    } catch(err) {
        return res.status(500).send('server error');
    }
});

router.get('/all',
authMiddleware,
async(req,res) => {
    try {
        const users = await User.find({user: req.user.id});
        res.send(users);    
    } catch (error) {
        res.status(500).send('server error');        
    }
}
);

router.put('/',
authMiddleware,
async (req,res) => { //Used to update the data
    try {
        const user = await User.findById(req.body._id);
        if(!user) {
            return res.status(404).send('Usr does not exist');
        }  
            user.role = req.body.role;
        await user.save();
        res.send(user);
    } catch (err) {
        res.status(500).send('server error');
    }
});

module.exports = router;