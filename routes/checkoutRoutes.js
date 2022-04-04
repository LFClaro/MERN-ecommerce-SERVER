require('dotenv').config();
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { check, validationResult } = require('express-validator');
const auth = require('../middlewares/auth');

let Checkout = require('../models/Checkout');

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

router.post("/", auth,
    [
        check("stripeToken", "stripeToken is required").not().isEmpty(),
        check("checkoutItem.rentalId", "rentalId is required").not().isEmpty(),
        check("checkoutItem.price", "price is required").not().isEmpty(),
        check("checkoutItem.userId", "userId is required").not().isEmpty(),
        check("checkoutItem.address", "address is required").not().isEmpty(),
        check("checkoutItem.phoneNumber", "phoneNumber is required").not().isEmpty(),
    ],

    async (req, res) => {
        
        try {
            var err = validationResult(req);
            if (!err.isEmpty()) {
                return res.status(400).json({ errors: err.array() });
            }

            let stripeToken = req.body.stripeToken
            let checkoutItem = req.body.checkoutItem

            // push to stripe
            const charge = await stripe.charges.create({
                amount: checkoutItem.price*100,
                currency: 'CAD',
                source: stripeToken.id,
                description: "rentalId:" + checkoutItem.rentalId,
            });

            // insert details to DB
            const checkout = await Checkout.create({
                stripeToken: stripeToken,
                checkoutItem: checkoutItem,
            })

            res.send({
                "charge": charge,
                "checkout": checkout
            })

        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ error: 'SERVER ERROR: ' + err.message });
        }

    })


module.exports = router