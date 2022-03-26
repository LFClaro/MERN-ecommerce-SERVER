const express = require("express"); // used for our server
const uuid = require("uuid"); // for creating unique ids
const { check, validationResult } = require("express-validator"); // used for validation 

let Community = require("../models/CommunityReply");// get access to our community model
const auth = require("../middlewares/auth"); // get access to our middleware
const router = express.Router(); // create router obj

//route Get api/Community 
//desc Get all Community replies from user id - for admin purposes 
//access public
router.get("/",auth, async (req, res) => {
  try {
    const allCommunity = await Community.find({ user: req.user.id }); // finds all Community in db by the user id
    res.send(allCommunity);
  } catch (err) {
    res.status(500).send("server error");
  }
});



//route Get api/Community 
//desc Get all Community replies for post id - to display all replies to post
//access public
router.get("/compost/:postid", async (req, res) => {
  try {
    const CommunityPostID = await Community.find().where(req.params.postid); // find Community replies by post id
    if (!CommunityPostID) {
      return res.status(404).send("Community post not found");
    }
    res.send(CommunityPostID);
  } catch (err) {
    res.status(500).send("server error");
  }
});
// issues with the above - not working - gives server error 
// TODO: ask prof for help on this one 


//route Get api/Community
//desc Get all Community replies for all users - for admin purposes
//access public
router.get("/all", async (req, res) => {
  try {
    const allUsersCommunity = await Community.find(); // finds all Community in db 
    res.send(allUsersCommunity);
  } catch (err) {
    res.status(500).send("server error");
  }
});

//route Get api/Community/:id
//desc Get Community reply by id - for admin purposes
//access public
router.get("/:id", async (req, res) => {
  try {
    const CommunityID = await Community.findById(req.params.id); // find Community by id
    if (!CommunityID) {
      return res.status(404).send("Community reply not found");
    }
    res.send(CommunityID);
  } catch (err) {
    res.status(500).send("server error");
  }
});

//route Post api/Community
//desc Add a Community - for users to submit a Community message 
//access public
router.post(
  "/", auth, 
  [check("reply", "Your reply is required").not().isEmpty()], // checking for validation   
  [check("reply", "Your reply needs to be at least 10 char").isLength({
    min: 10,
  })],
  // [check("user", "Your user id is required").not().isEmpty()],
  // [check("username", "Your username is required").not().isEmpty()],
  [check("postid", "The postid is required").not().isEmpty()],
  [check("replyCount", "The replyCount is required").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req); // gets any errors that are created 
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() }); // returns the error in json format if the error obj is not empty 
    }   
    try {
      let rCount = req.body.replyCount; // trying to get current count then increase by one for response to db 
      rCount++;
      const newCommunityReply = await Community.create({ // if above is valid create a new Community
        user: req.user.id,
        username: req.user.name,
        postid: req.body.postid,
        reply: req.body.reply,
        replyCount: rCount,        
      });
      res.send(newCommunityReply); // save Community in db 
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
      return res.status(404).send("Community reply not found");
    }
    res.send("Community reply has been deleted");
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
