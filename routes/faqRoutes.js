const express = require('express');
const { check, validationResult } = require('express-validator');
const dotenv = require('dotenv');
let Faq = require('../models/Faq');

const router = express.Router();

//GET
//read faqs info from mongoDB
router.get('/', async (req, res) => {
    try {
        const FaqDb = await Faq.find();
        // console.log(FaqDb);
        res.send(FaqDb);
    } catch (err) {
        console.log(err.message);
        return res.status(500).json({ error: 'Server error' });
    }
})

//POST
//add a faq info into mongoDB
//TODO: add validation
router.post('/',
    [
        check("title", "At least a title is required").not().isEmpty()
    ]
    , async (req, res) => {

        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        try {
            const newFaq = new Faq({
                title: req.body.title,
                answer: req.body.answer,
            })
            await newFaq.save();
            res.status(201).send("successful created");
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ error: 'Server error' });
        }
    })


//DELETE
//delete by  req.body.id
//****************has to add async and await to work */
router.delete('/', async (req, res) => {
    try {
        const faq = await Faq.findOneAndRemove({ _id: req.body.id });
        if (!faq) {
            return res.status(404).send('faq not found');
        } else {
            res.status(200).send("delete sucessful");
        }
    } catch (err) {
        res.status(500).send('server error');
    }
});

router.put('/', async (req, res) => {
    try {
        const faq = await Faq.findById(req.body.id);
        if (!faq) {
            return res.status(404).send('faq not found');
        }

        faq.title = req.body.title;
        faq.answer = req.body.answer;

        await faq.save();
        res.json(faq);
    } catch (err) {
        return res.status(500).json({ error: 'Server erroe' });
    }
})

module.exports = router;