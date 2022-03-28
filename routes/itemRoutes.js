const express = require('express');
const path = require('path');
const fs = require('fs');
const { check, validationResult } = require('express-validator');

let Item = require('../models/Item');

//Adding Middleware for Auth
const authMiddleware = require('../middlewares/auth');

const router = express.Router();

//Setting up Cloudinary for image storage
const cloudinary = require('cloudinary');
cloudinary.config({
    cloud_name: 'mernmaniacs',
    api_key: '661941435579653',
    api_secret: 'iA-_PVMI1J-7A5b777HvHmF3Uls'
});

// Cloudinary helper function
async function uploadImage(file) {
    return new Promise(resolve => {
        cloudinary.v2.uploader.upload(
            file,
            { public_id: file.name },
            function (error, result) {

                console.log(result);
                resolve(result.secure_url);
                return result.secure_url;
            }
        );
    });
}

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

        if (!req.files || Object.keys(req.files).length === 0) {
            return res.status(400).send('No files were uploaded.');
        }

        const file = req.files.myFile;
        const extfile = path.extname(file.name);
        const allowedext = ['.png', '.jpg', '.gif'];

        if (!allowedext.includes(extfile)) {
            return res.status(400).send('Invalid image format.');
        }

        const uploadPath = 'public/uploads/' + file.name;

        // Using the mv() method to temporariyl store the file in the server
        file.mv(uploadPath, function (err) {
            if (err) return res.status(500).send(err);
        });

        // Using the Cloudinary helper function to place the file in the cloud server
        const imageUrl = await uploadImage(uploadPath);

        try {
            const newItem = await Item.create({
                user: req.user.id,
                name: req.body.name,
                description: req.body.description,
                image: imageUrl,
                price: req.body.price,
            });
            res.send(newItem);
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ error: 'SERVER ERROR: ' + err.message });
        }

        // Deleting the file temporarily stored in the server
        fs.rmSync(uploadPath)
    }
);

//Route DELETE api/items/
//model: Delete item
//Access: public
router.delete(
    '/',
    async (req, res) => {
        //find the element
        try {
            const item = await Item.findByIdAndDelete(req.body.id);
            if (!item) {
                return res.status(404).send('Item not found');
            }
            res.send('Item deleted');
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ error: 'SERVER ERROR: ' + err.message });
        }
    }
);

//Route PUT api/items/
//model: Update Item by ID
//Access: public
router.put(
    '/',
    authMiddleware,
    [
        check('id', 'Item ID is required').not().isEmpty(),
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

            if (!req.files || Object.keys(req.files).length === 0) {
                return res.status(400).send('No files were uploaded.');
            }
    
            const file = req.files.myFile;
            const extfile = path.extname(file.name);
            const allowedext = ['.png', '.jpg', '.gif'];
    
            if (!allowedext.includes(extfile)) {
                return res.status(400).send('Invalid image format.');
            }
    
            const uploadPath = 'public/uploads/' + file.name;
    
            // Using the mv() method to temporariyl store the file in the server
            file.mv(uploadPath, function (err) {
                if (err) return res.status(500).send(err);
            });
    
            // Using the Cloudinary helper function to place the file in the cloud server
            const imageUrl = await uploadImage(uploadPath);

            item.user = req.user.id;
            item.name = req.body.name;
            item.description = req.body.description;
            item.image = imageUrl;
            item.price = req.body.price;
            item.updated = Date.now();

            // Deleting the file temporarily stored in the server
            fs.rmSync(uploadPath)

            await item.save();
            res.send(item);
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ error: 'SERVER ERROR: ' + err.message });
        }
    }
);

//Route PATCH api/items/:id/:rating
//model: Update Item by ID and insert rate
//Access: public
router.patch(
    '/rate/:id/:rating',
    [
        check('id', 'Item id is required').not().isEmpty(),
        check('rating', 'Rating is required').not().isEmpty(),
        check('rating', 'Rating needs to be a valid number between 0 and 5').isInt({ min: 0, max: 5 })
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        var rating = req.params.rating;
        try {
            const item = await Item.findByIdAndUpdate(req.params.id, { $push: { overallRating: rating } });
            if (!item) {
                return res.status(404).send('Item not found');
            }
            await item.save();
            res.send(item);
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ error: 'SERVER ERROR: ' + err.message });
        }
    }
);

//Route PATCH api/items/:id
//model: Update Item by ID to toggle rent status
//Access: public
router.patch(
    '/isRented/:id',
    [
        check('id', 'Item id is required').not().isEmpty()
    ],
    async (req, res) => {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }
        try {
            const item = await Item.findById(req.params.id);
            if (!item) {
                return res.status(404).send('Item not found');
            }
            item.isRented = !item.isRented;

            await item.save();
            res.send(item);
        } catch (err) {
            console.log(err.message);
            return res.status(500).json({ error: 'SERVER ERROR: ' + err.message });
        }
    }
);

module.exports = router;
