const express = require('express');
const uuid = require('uuid');
const { check, validationResult } = require('express-validator');

let Rental = require('../models/Rental');

//Adding Middleware for Auth
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

//Route GET api/rentals
//model: Get all rentals
//Access: public
router.get('/', authMiddleware, async (req, res) => {
    try {
        const rentalDB = await Rental.find({ user: req.user.id });
        res.send(rentalDB);
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ error: 'SERVER ERROR: ' + err.message });
    }
});

//Route GET api/rentals/:id
//model: Get Rental by id
//Access: public
router.get('/:id', async (req, res) => {
    try {
        const rentalDB = await Rental.findById(req.params.id);
        if (!rentalDB) {
            return res.status(404).send('Rental not found');
        }
        res.send(rentalDB);
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ error: 'SERVER ERROR: ' + err.message });
    }
});

//Route POST api/rentals/
//model: Add rental
//Access: public
router.post(
    '/',
    authMiddleware,
    [
        check('date', 'Date is required').not().isEmpty(),
        check('date', 'Date needs to be valid').isDate(),
        check('days', 'Amount of days is required').not().isEmpty(),
        check('days', 'Amoutn of days nees to be a valid number').isInt()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const newRental = await Rental.create({
                item: req.item.id,
                user: req.user.id,
                date: req.body.date,
                days: req.body.days,
            });
            res.send(newRental);
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ error: 'SERVER ERROR: ' + err.message });
        }
    });

//Route DELETE api/rentals/
//model: Delete rental
//Access: public
router.delete(
    '/',
    async (req, res) => {
        //find the element
        try {
            const rental = await Rental.findOneAndRemove({ _id: req.body.id });
            if (!rental) {
                return res.status(404).send('Rental not found');
            }
            res.send('Rental deleted');
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ error: 'SERVER ERROR: ' + err.message });
        }
    });

//Route PUT api/rentals/
//model: Update Rental by ID
//Access: public
router.put(
    '/',
    authMiddleware,
    [
        check('date', 'Date is required').not().isEmpty(),
        check('date', 'Date must be valid').isDate(),
        check('days', 'Amount of days is required').not().isEmpty(),
        check('days', 'Amount of days must be a number').isInt()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const rental = await Rental.findById(req.body.id);
            if (!rental) {
                return res.status(404).send('Rental not found');
            }

            rental.item = req.item.id;
            rental.user = req.user.id;
            rental.date = req.body.date;
            rental.days = req.body.days;

            await rental.save();
            res.send(rental);
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ error: 'SERVER ERROR: ' + err.message });
        }
    });

module.exports = router;
