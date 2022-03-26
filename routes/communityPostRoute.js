const express = require("express"); // used for our server
const uuid = require("uuid"); // for creating unique ids
const { check, validationResult } = require("express-validator"); // used for validation 

let Community = require("../models/CommunityPost");// get access to our community model
const auth = require("../middlewares/auth"); // get access to our middleware
const router = express.Router(); // create router obj

//route Get api/Community
//desc Get all Community from user id - for admin purposes 
//access public
router.get("/",auth, async (req, res) => {
  try {
    const allCommunityPosts = await Community.find({ user: req.user.id }); // finds all Community in db by the user id
    res.send(allCommunityPosts);
  } catch (err) {
    res.status(500).send("server error");
  }
});


//route Get api/Community
//desc Get all Community - for admin purposes
//access public
router.get("/all", async (req, res) => {
  try {
    const allPosts = await Community.find(); // finds all Community in db 
    res.send(allPosts);
  } catch (err) {
    res.status(500).send("server error");
  }
});

//route Get api/Community/:id
//desc Get Community by id - for admin purposes
//access public
router.get("/:id", async (req, res) => {
  try {
    const communityPostID = await Community.findById(req.params.id); // find Community by id
    if (!communityPostID) {
      return res.status(404).send("Community message not found");
    }
    res.send(communityPostID);
  } catch (err) {
    res.status(500).send("server error");
  }
});

//route Post api/Community
//desc Add a Community - for users to submit a Community message 
//access public
router.post(
  "/", auth, 
  [check("title", "Your title is required").not().isEmpty()], // checking for validation 
  [check("category", "Your category is required").not().isEmpty()],   
  [check("title", "Your title needs to be at least 5 char").isLength({
    min: 5,
  })],
  async (req, res) => {
    const errors = validationResult(req); // gets any errors that are created 
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // returns the error in json format if the error obj is not empty 
    }   
    try {
      var today = new Date();
      var dd = String(today.getDate()).padStart(2, '0');
      var mm = String(today.getMonth() + 1).padStart(2, '0'); //January is 0!
      var yyyy = today.getFullYear();
      today = mm + '/' + dd + '/' + yyyy;

      const newCommunity = await Community.create({ // if above is valid create a new Community
        user: req.user.id,
        username: req.user.name,
        title: req.body.title,
        category: req.body.category,
        picture: req.body.picture,
        date: today,
      });
      res.send(newCommunity); // save Community in db 
      // how do i return a email or thank you message to the user?
    } catch (err) {
      return res.status(500).json({ error: "Server error" });
    }
  }
);

//route Delete api/Community
//desc delete Community by id - for admin purposes
//access public
router.delete("/", async (req, res) => {
  //find the element
  try {
    const CommunityMessage = await Community.findOneAndRemove({ _id: req.body.id });
    if (!CommunityMessage) {
      return res.status(404).send("Community message not found");
    }
    res.send("Community message has been deleted");
  } catch (err) {
    res.status(500).send("server error");
  }
});

//route PUT api/contact
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
//     contactUpdate.message = req.body.message;

//     await contactUpdate.save();
//     res.send(contactUpdate);
//   } catch (err) {
//     return res.status(500).json({ error: "Server error" });
//   }
// });

module.exports = router;
