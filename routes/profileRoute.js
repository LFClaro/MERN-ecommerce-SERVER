const express = require("express"); // used for our server
const uuid = require("uuid"); // for creating unique ids
const { check, validationResult } = require("express-validator"); // used for validation

let Profile = require("../models/Profile"); // get access to our contact model
let Item = require('../models/Item'); // get access to our item model
const auth = require("../middlewares/auth"); // get access to our middleware
const router = express.Router(); // create router obj

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
  [check("email", "Your email is required").not().isEmpty()],
  [check("email", "Please enter a valid email").isEmail()],
  [check("phone", "A phone is required").not().isEmpty()],
  [check("address", "A address is required").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req); // gets any errors that are created
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // returns the error in json format if the error obj is not empty
    }

    // const profile = await Profile.find({ user: req.user.id });
    var query = { 'user': req.user.id };
    try {
      const profile = await Profile.findOneAndUpdate(query,
        // { user: req.user.id },
        {
          firstname: req.body.firstname,
          lastname: req.body.lastname,
          email: req.body.email,
          phone: req.body.phone,
          address: req.body.address
        },
        { upsert: true, new: true },
      );

      await profile.save();
      res.send(profile);
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  }
);

//Route PATCH api/profile/liked/:id
//model: Update Rental by ID and insert comment
//Access: public
router.patch(
  '/liked/:itemId',
  auth,
  [
    check('itemId', 'Item id is required').not().isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    var query = { user: req.user.id };
    try {
      const item = await Item.findById(req.params.itemId)
      if (!item) {
          return res.status(404).send('Item not found');
      }

      const profile = await Profile.findOneAndUpdate(query, { $push: { likedList: req.params.itemId } });
      if (!profile) {
        return res.status(404).send('Profile not found');
      }
      await profile.save();

      res.send(profile);
    } catch (err) {
      console.log(err.message);
      return res.status(500).json({ error: 'SERVER ERROR: ' + err.message });
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
