const express = require('express');
const { check, validationResult } = require('express-validator');

let Rental = require('../models/Rental');
let Item = require('../models/Item');

//Adding Middleware for Auth
const authMiddleware = require('../middlewares/authMiddleware');

const router = express.Router();

//Route GET api/rentals
//model: Get all rentals by user id
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
        check('itemId', 'Item ID is required').not().isEmpty(),
        check('rentalDate', 'Date is required').not().isEmpty(),
        check('rentalDate', 'Date needs to be valid').isDate(),
        check('returnDate', 'Date is required').not().isEmpty(),
        check('returnDate', 'Date needs to be valid').isDate()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const newRental = await Rental.create({
                item: req.body.itemId,
                user: req.user.id,
                rentalDate: req.body.rentalDate,
                returnDate: req.body.returnDate,
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
        check('itemId', 'Item ID is required').not().isEmpty(),
        check('rentalDate', 'Date is required').not().isEmpty(),
        check('rentalDate', 'Date needs to be valid').isDate(),
        check('returnDate', 'Date is required').not().isEmpty(),
        check('returnDate', 'Date needs to be valid').isDate()
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

            rental.item = req.body.itemId,
                rental.user = req.user.id;
            rental.rentalDate = req.body.rentalDate;
            rental.returnDate = req.body.returnDate;

            await rental.save();
            res.send(rental);
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ error: 'SERVER ERROR: ' + err.message });
        }
    });

//Route PATCH api/rentals/changeReturn/:id/:date
//model: Update Rental by ID and reset returnDate
//Access: public
router.patch(
    '/changeReturn/:id/:returnDate',
    [
        check('id', 'Rental id is required').not().isEmpty(),
        check('returnDate', 'Date is required').not().isEmpty(),
        check('returnDate', 'Date needs to be valid').isDate()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        var returnDate = req.params.returnDate;
        try {
            const rental = await Rental.findByIdAndUpdate(req.params.id, { $set: { returnDate: returnDate } });
            if (!rental) {
                return res.status(404).send('Rental not found');
            }
            await rental.save();
            await res.send(rental);
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ error: 'SERVER ERROR: ' + err.message });
        }
    }
);

//Route PATCH api/comment/:id
//model: Update Rental by ID and insert comment
//Access: public
router.patch(
    '/comment/:id',
    [
        check('id', 'Rental id is required').not().isEmpty(),
        check('title', 'Title is required').not().isEmpty(),
        check('text', 'Text body is required').not().isEmpty(),
        check('rating', 'Rating is required').not().isEmpty(),
        check('rating', 'Rating needs to be a valid number between 0 and 5').isInt({ min: 0, max: 5 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        var title = req.body.title;
        var text = req.body.text;
        var rating = req.body.rating;
        var date = Date.now();

        try {
            const rental = await Rental.findByIdAndUpdate(req.params.id, { $set: { comment: { title: title, text: text, rating: rating, date: date } } });
            if (!rental) {
                return res.status(404).send('Rental not found');
            }
            await rental.save();

            // The rating in this comment will go straight to the overallRating arry in the item Object
            const item = await Item.findByIdAndUpdate(rental.item.toString(), { $push: { overallRating: rating } });
            if (!item) {
                return res.status(404).send('Item not found');
            }
            await item.save();

            res.send(rental);
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ error: 'SERVER ERROR: ' + err.message });
        }
    }
);

module.exports = router;
