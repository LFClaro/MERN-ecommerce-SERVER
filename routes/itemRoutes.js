const express = require('express');
const uuid = require('uuid');
const { check, validationResult } = require('express-validator');

let Item = require('../models/Item');

//Adding Middleware for Auth
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

//Route GET api/items
//model: Get all items
//Access: per user
router.get('/', authMiddleware, async (req, res) => {
    try {
        const itemDB = await Item.find({ user: req.user.id });
        res.send(itemDB);
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ error: 'SERVER ERROR: ' + err.message });
    }
});

//Route GET api/items/:id
//model: Get Item by id
//Access: public
router.get('/:id', async (req, res) => {
    try {
        const itemDB = await Item.findById(req.params.id);
        if (!itemDB) {
            return res.status(404).send('Item not found');
        }
        res.send(itemDB);
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ error: 'SERVER ERROR: ' + err.message });
    }
});

//Route POST api/items/
//model: Add item
//Access: public
router.post(
    '/',
    authMiddleware,
    [
        check('name', 'Name is required').not().isEmpty(),
        check('description', 'Description is required').not().isEmpty(),
        check('price', 'Price is required').not().isEmpty(),
        check('price', 'Price needs to be in a valid currency').isCurrency()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const newItem = await Item.create({
                user: req.user.id,
                name: req.body.name,
                description: req.body.description,
                image: req.body.image,
                price: req.body.price,
            });
            res.send(newItem);
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ error: 'SERVER ERROR: ' + err.message });
        }
    });

//Route DELETE api/items/
//model: Delete item
//Access: public
router.delete(
    '/',
    async (req, res) => {
        //find the element
        try {
            const item = await Item.findOneAndRemove({ _id: req.body.id });
            if (!item) {
                return res.status(404).send('Item not found');
            }
            res.send('Item deleted');
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ error: 'SERVER ERROR: ' + err.message });
        }
    });

//Route PUT api/items/
//model: Update Item by ID
//Access: public
router.put(
    '/',
    authMiddleware,
    [
        check('name', 'Name is required').not().isEmpty(),
        check('description', 'Description is required').not().isEmpty(),
        check('price', 'Price is required').not().isEmpty(),
        check('price', 'Price needs to be in a valid currency').isCurrency()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const item = await Item.findById(req.body.id);
            if (!item) {
                return res.status(404).send('Item not found');
            }

            item.user = req.user.id;
            item.name = req.body.name;
            item.description = req.body.description;
            item.image = req.body.image;
            item.price = req.body.price;

            await item.save();
            res.send(item);
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ error: 'SERVER ERROR: ' + err.message });
        }
    });

module.exports = router;
