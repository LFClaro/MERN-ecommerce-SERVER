const express = require('express');
const bcrypt = require('bcryptjs');
const router = express.Router();
const jwt = require('jsonwebtoken');
const authMiddleware = require('../middlewares/auth');
const {check, validationResult} = require('express-validator');  //it is a middleware to validate

let User = require('../models/User');

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