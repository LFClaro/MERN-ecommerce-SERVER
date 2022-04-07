const express = require("express"); // used for our server
const path = require("path");
const fs = require("fs");
const NodeGeocoder = require('node-geocoder');
const { check, validationResult } = require("express-validator"); // used for validation

let Profile = require("../models/Profile"); // get access to our contact model
const auth = require('../middlewares/auth');; // get access to our middleware
const router = express.Router(); // create router obj

//ALex: setting for the geocode
const geocoder = NodeGeocoder({
  provider: 'google',
  apiKey: process.env.REACT_APP_GOOGLE_MAP_API_KEY,
  formatter: null
})

//Setting up Cloudinary for image storage
const cloudinary = require("cloudinary");
cloudinary.config({
  cloud_name: "mernmaniacs",
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
        console.log(result);
        resolve(result.secure_url);
        return result.secure_url;
      }
    );
  });
}

//route Get api/Profile
//desc Get all Profiles from user id - for admin purposes
//access public
router.get("/", auth, async (req, res) => {
  try {
    const profile = await Profile.find({ user: req.user.id }); // finds the Profile in db by the user id
    // res.send(profile);
    if (profile.length === 0) {
      res.send("null");
    } else {
      res.send(profile);
    }
  } catch (err) {
    res.status(500).send("server error");
  }
});

//route Get api/Profile
//desc Get all Profile - for admin purposes
//access public
router.get("/all", async (req, res) => {
  try {
    const allUsersProfile = await Profile.find(); // finds all Profile in db
    res.send(allUsersProfile);
  } catch (err) {
    res.status(500).send("server error");
  }
});

//route Get api/Profile/:id
//desc Get Profile by id - for admin purposes
//access public
router.get("/:id", async (req, res) => {
  try {
    const ProfileID = await Profile.findById(req.params.id); // find Profile by id
    if (!ProfileID) {
      return res.status(404).send("Profile not found");
    }
    res.send(ProfileID);
  } catch (err) {
    res.status(500).send("server error");
  }
});

//route Put api/Profile
//desc Add a Profile or update if it exists - for users to submit a Profile
//access public
router.put(
  "/",
  auth,
  [check("firstname", "Your first name is required").not().isEmpty()], // checking for validation
  [check("lastname", "Your last name is required").not().isEmpty()],
  [check("phone", "A phone is required").not().isEmpty()],
  [check("address", "A address is required").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req); // gets any errors that are created
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // returns the error in json format if the error obj is not empty
    }
    let imageUrl = '';
    let uploadPath = '';
    if (!req.files || Object.keys(req.files).length === 0) {
      // return res.status(400).send("No files were uploaded.");
      imageUrl = '';
      console.log("in first if check");
    }
    else {
      const file = req.files.myFile;
      console.log(file);
      console.log("reached the else statement");
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

    // const profile = await Profile.find({ user: req.user.id });

    //Alex: get the address's geolocation************************************
    let latitude;
    let longitude;
    try {
      let geolocation = await geocoder.geocode(req.body.address);
      latitude = geolocation[0].latitude;
      longitude = geolocation[0].longitude;
    } catch (e) {
      return res.status(500).json({ error: "The address is not found" })
    }
    //****************************************************************** */

    var query = { user: req.user.id };

    if (imageUrl == '') {
      try {
        const profile = await Profile.findOneAndUpdate(
          query,
          // { user: req.user.id },
          {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            phone: req.body.phone,
            address: req.body.address,
            lat: latitude,
            lng: longitude,
          },
          { upsert: true, new: true }
        );

        await profile.save();
        res.send(profile);
      } catch (err) {
        return res.status(500).json({ error: "Server error" });
      }
    }
    else {
      try {
        const profile = await Profile.findOneAndUpdate(
          query,
          // { user: req.user.id },
          {
            firstname: req.body.firstname,
            lastname: req.body.lastname,
            phone: req.body.phone,
            address: req.body.address,
            image: imageUrl,
          },
          { upsert: true, new: true }
        );

        await profile.save();
        res.send(profile);
      } catch (err) {
        return res.status(500).json({ error: "Server error" });
      }
      fs.rmSync(uploadPath);
    }

  }
);

//route Post api/Profile
//desc Add a Profile - for users to submit a Profile
//access public
// router.post(
//   "/", auth,
//   [check("firstname", "Your first name is required").not().isEmpty()], // checking for validation
//   [check("lastname", "Your last name is required").not().isEmpty()],
//   [check("email", "Your email is required").not().isEmpty()],
//   [check("email", "Please enter a valid email").isEmail()],
//   [check("phone", "A phone is required").not().isEmpty()],
//   [check("address", "A address is required").not().isEmpty()],
//   async (req, res) => {
//     const errors = validationResult(req); // gets any errors that are created
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() }); // returns the error in json format if the error obj is not empty
//     }
//     try {
//       const newProfile = await Profile.create({ // if above is valid create a new Profile
//         user: req.user.id,
//         firstname: req.body.firstname,
//         lastname: req.body.lastname,
//         email: req.body.email,
//         phone: req.body.phone,
//         address: req.body.address,
//       });
//       res.send(newProfile); // save Profile in db
//       // how do i return a email or thank you  to the user?
//     } catch (err) {
//       return res.status(500).json({ error: "Server error" });
//     }
//   }
// );

// router.post(
//   "/",
//   auth,
//   [check("firstname", "Your first name is required").not().isEmpty()], // checking for validation
//   [check("lastname", "Your last name is required").not().isEmpty()],
//   [check("email", "Your email is required").not().isEmpty()],
//   [check("email", "Please enter a valid email").isEmail()],
//   [check("phone", "A phone is required").not().isEmpty()],
//   [check("address", "A address is required").not().isEmpty()],
//   async (req, res) => {
//     const errors = validationResult(req); // gets any errors that are created
//     if (!errors.isEmpty()) {
//       return res.status(400).json({ errors: errors.array() }); // returns the error in json format if the error obj is not empty
//     }
//     try {
//       const profile = await Profile.find({ user: req.user.id });
//       if (profile.length === 0) {
//         // res.send("null");
//         const newProfile = await Profile.create({
//           // if above is valid create a new Profile
//           user: req.user.id,
//           firstname: req.body.firstname,
//           lastname: req.body.lastname,
//           email: req.body.email,
//           phone: req.body.phone,
//           address: req.body.address,
//         });
//         res.send(newProfile); // save Profile in db
//       } else {
//         // res.send("profile exists");
//         const newProfile = await Profile.update({
//           // if above is valid create a new Profile
//           user: req.user.id,
//           firstname: req.body.firstname,
//           lastname: req.body.lastname,
//           email: req.body.email,
//           phone: req.body.phone,
//           address: req.body.address,
//         });
//         await newProfile.save();
//         res.send(newProfile);
//       }

//       // how do i return a email or thank you  to the user?
//     } catch (err) {
//       return res.status(500).json({ error: "Server error" });
//     }
//   }
// );

//route Delete api/Profile
//desc delete Profile by id - for admin purposes
//access public
router.delete("/", async (req, res) => {
  //find the element
  try {
    const ProfileDel = await Profile.findOneAndRemove({ _id: req.body.id });
    if (!ProfileDel) {
      return res.status(404).send("Profile not found");
    }
    res.send("Profile has been deleted");
  } catch (err) {
    res.status(500).send("server error");
  }
});

//route PUT api/Profile
//desc update contact by id - dont think we will need this
//access public
// router.put("/", async (req, res) => {
//   try {
//     const contactUpdate = await Contact.findById(req.body.id);
//     if (!contactUpdate) {
//       return res.status(404).send("contact not found");
//     }

//     contactUpdate.name = req.body.name;
//     contactUpdate.email = req.body.email;
//     contactUpdate.subject = req.body.subject;
//     contactUpdate. = req.body.;

//     await contactUpdate.save();
//     res.send(contactUpdate);
//   } catch (err) {
//     return res.status(500).json({ error: "Server error" });
//   }
// });

module.exports = router;
