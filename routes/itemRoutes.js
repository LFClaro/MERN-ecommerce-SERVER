const express = require("express");
const path = require("path");
const fs = require("fs");
const { check, validationResult } = require("express-validator");
const dotenv = require('dotenv').config();

let Item = require("../models/Item");
let Profile = require("../models/Profile");

//Adding Middleware for Auth
const authMiddleware = require("../middlewares/auth");

const router = express.Router();

//Setting up Cloudinary for image storage
const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "mernmaniacs",
//   api_key: process.env.CLOUDINARY_API_KEY,
//   api_secret: process.env.CLOUDINARY_API_KEY,
  api_key: "661941435579653",
  api_secret: "iA-_PVMI1J-7A5b777HvHmF3Uls",
});

// Cloudinary helper function
async function uploadImage(file) {
  return new Promise((resolve) => {
    cloudinary.v2.uploader.upload(
      file,
      { public_id: file.name },
      function (error, result) {
        console.log(file.name);
        console.log(result);
        console.log("CLOUDINARY ERROR: " + error);
        resolve(result.secure_url);
        return result.secure_url;
      }
    );
  });
}

//Route GET api/items
//model: Get all items
//Access: per user
router.get("/", authMiddleware, async (req, res) => {
  try {
    const itemDB = await Item.find({ user: req.user.id });
    //         const itemDB = await Item.find();
    res.send(itemDB);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: "SERVER ERROR: " + err.message });
  }
});

//Route GET api/items
//model: Get all items from other users
//Access: per user
router.get("/products", authMiddleware, async (req, res) => {
  try {
    const itemDB = await Item.find({ user: { $ne: req.user.id } });
    res.send(itemDB);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: "SERVER ERROR: " + err.message });
  }
});

//Route GET api/items/:id
//model: Get Item by id
//Access: public
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const itemDB = await Item.findById(req.params.id);
    const userID = req.user.id
    if (!itemDB) {
      return res.status(404).send("Item not found");
    }
    console.log(itemDB);
    console.log(userID);

    let itemAndUser = Object.assign({}, {"queryUser": userID}, itemDB); // Adding User who querid to the JSON response
    // res.send(itemAndUser);
    res.send(itemDB);
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: "SERVER ERROR: " + err.message });
  }
});

//Route POST api/items/
//model: Add item
//Access: public
router.post(
  "/",
  authMiddleware,
  [
    check("name", "Name is required").not().isEmpty(),
    check("description", "Description is required").not().isEmpty(),
    check("category", "Category is required").not().isEmpty(),
    check("price", "Price is required").not().isEmpty(),
    check("price", "Price needs to be in a valid currency").isCurrency(),
  ],
  async (req, res) => {
    console.log("req.user: ", req.user);
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    if (!req.files || Object.keys(req.files).length === 0) {
      return res.status(400).send("No files were uploaded.");
    }

    const file = req.files.myFile;
    const extfile = path.extname(file.name);
    const allowedext = [".png", ".jpg", ".jpeg", ".gif", ".webp"];

    if (!allowedext.includes(extfile)) {
      return res.status(400).send("Invalid image format.");
    }

    const uploadPath = ("public/uploads/" + file.name).replace(/\s/g, "");

    // Using the mv() method to temporariyl store the file in the server
    file.mv(uploadPath, function (err) {
      if (err) return res.status(500).send(err);
    });

    console.log(uploadPath);

    const profile = await Profile.find({ user: req.user.id }); // find Profile by id, mainly want the geolocation

    // Using the Cloudinary helper function to place the file in the cloud server
    const imageUrl = await uploadImage(uploadPath);

    try {
      const newItem = await Item.create({
        user: req.user.id,
        name: req.body.name,
        description: req.body.description,
        category: req.body.category,
        image: imageUrl,
        price: req.body.price,
        lat: profile[0].lat,
        lng: profile[0].lng,
      });
      console.log("new item just added:", newItem);
      res.send(newItem);
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({ error: "SERVER ERROR: " + err.message });
    }

    // Deleting the file temporarily stored in the server
    fs.rmSync(uploadPath);
  }
);

//Route DELETE api/items/
//model: Delete item
//Access: public
router.delete("/", async (req, res) => {
  //find the element
  try {
    const item = await Item.findByIdAndDelete(req.body.id);
    if (!item) {
      return res.status(404).send("Item not found");
    }
    res.send("Item deleted");
  } catch (err) {
    console.log(err.message);
    return res.status(500).json({ error: "SERVER ERROR: " + err.message });
  }
});

//Route PUT api/items/
//model: Update Item by ID
//Access: public
router.put(
  "/",
  authMiddleware,
  [
    check("id", "Item ID is required").not().isEmpty(),
    check("name", "Name is required").not().isEmpty(),
    check("description", "Description is required").not().isEmpty(),
    check("category", "Category is required").not().isEmpty(),
    check("price", "Price is required").not().isEmpty(),
    check("price", "Price needs to be in a valid currency").isCurrency(),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    // Image Uploading Starts here
    let imageUrl = "";
    let uploadPath = "";
    // we'll only proceed with image upload if we have a new file
    if (req.files) {
      const file = req.files.myFile;
      const extfile = path.extname(file.name);
      const allowedext = [".png", ".jpg", ".jpeg", ".gif", ".webp"];

      if (!allowedext.includes(extfile)) {
        return res.status(400).send("Invalid image format.");
      }

      uploadPath = "public/uploads/" + file.name;

      // Using the mv() method to temporariyl store the file in the server
      file.mv(uploadPath, function (err) {
        if (err) return res.status(500).send(err);
      });

      // Using the Cloudinary helper function to place the file in the cloud server
      imageUrl = await uploadImage(uploadPath);
    }

    try {
      const item = await Item.findById(req.body.id);

      if (!item) {
        return res.status(404).send("Item not found");
      }

      item.user = req.user.id;
      item.name = req.body.name;
      item.description = req.body.description;
      item.category = req.body.category;
      item.price = req.body.price;
      item.updated = Date.now();

      //We'll set the image only if not undefined
      if (imageUrl !== "") {
        item.image = imageUrl;
      }

      // Deleting the file temporarily stored in the server - if there's one
      if (uploadPath != "") {
        fs.rmSync(uploadPath);
      }

      await item.save();
      res.send(item);
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({ error: "SERVER ERROR: " + err.message });
    }
  }
);

//Route PATCH api/items/:id/:rating
//model: Update Item by ID and insert rate
//Access: public
router.patch(
  "/rate/:id/:rating",
  [
    check("id", "Item id is required").not().isEmpty(),
    check("rating", "Rating is required").not().isEmpty(),
    check("rating", "Rating needs to be a valid number between 0 and 5").isInt({
      min: 0,
      max: 5,
    }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    var rating = req.params.rating;
    try {
      const item = await Item.findByIdAndUpdate(req.params.id, {
        $push: { overallRating: rating },
      });
      if (!item) {
        return res.status(404).send("Item not found");
      }
      await item.save();
      res.send(item);
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({ error: "SERVER ERROR: " + err.message });
    }
  }
);

//Route PATCH api/items/:id
//model: Update Item by ID to toggle rent status
//Access: public
router.patch(
  "/isRented/:id",
  [check("id", "Item id is required").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      const item = await Item.findById(req.params.id);
      if (!item) {
        return res.status(404).send("Item not found");
      }
      item.isRented = !item.isRented;
      item.updated = Date.now();

      await item.save();
      res.send(item);
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({ error: "SERVER ERROR: " + err.message });
    }
  }
);

module.exports = router;
