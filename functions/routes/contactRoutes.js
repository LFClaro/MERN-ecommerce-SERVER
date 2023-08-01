const express = require("express"); // used for our server
const {check, validationResult} = require("express-validator");
// info.mernmaniacs@gmail.com
// MernManiacs123
//  app pass ngieginigtydgfrx
const nodemailer = require("nodemailer");

const Contact = require("../models/Contact");// get access to our contact model
const auth = require("../middlewares/auth"); // get access to our middleware
// eslint-disable-next-line new-cap
const router = express.Router(); // create router obj

// route Get api/contact
// desc Get all contacts from user id - for admin purposes
// access public
router.get("/", auth, async (req, res) => {
  try {
    const allContact = await Contact.find({user: req.user.id});
    // finds all contact in db by the user id
    res.send(allContact);
  } catch (err) {
    res.status(500).send("server error");
  }
});


// route Get api/contact
// desc Get all contact - for admin purposes
// access public
router.get("/all", async (req, res) => {
  try {
    const allUsersContact = await Contact.find(); // finds all contact in db
    res.send(allUsersContact);
  } catch (err) {
    res.status(500).send("server error");
  }
});

// route Get api/contact/:id
// desc Get contact by id - for admin purposes
// access public
router.get("/:id", async (req, res) => {
  try {
    const contactID = await Contact.findById(req.params.id);
    // find contact by id
    if (!contactID) {
      return res.status(404).send("contact message not found");
    }
    res.send(contactID);
  } catch (err) {
    res.status(500).send("server error");
  }
});

// route Post api/contact
// desc Add a contact - for users to submit a contact message
// access public
router.post(
    "/", auth,
    // checking for validation
    [check("name", "Your name is required").not().isEmpty()],
    [check("email", "Your email is required").not().isEmpty()],
    [check("email", "Please enter a valid email").isEmail()],
    [check("subject", "A subject is required").not().isEmpty()],
    [check("message", "A message is required").not().isEmpty()],
    [check("message", "Your message needs to be at least 10 char").isLength({
      min: 10,
    })],
    async (req, res) => {
      const errors = validationResult(req); // gets any errors that are created
      if (!errors.isEmpty()) {
        return res.status(400).json({errors: errors.array()});
        // returns the error in json format if the error obj is not empty
      }
      try {
        // if above is valid create a new contact
        const newContact = await Contact.create({
          user: req.user.id,
          name: req.body.name,
          email: req.body.email,
          subject: req.body.subject,
          message: req.body.message,
        });
        res.send(newContact); // save contact in db
        // how do i return a email or thank you message to the user?
        const transporter = nodemailer.createTransport({
          service: "gmail",

          auth: {
            user: "info.mernmaniacs@gmail.com",

            pass: "ngieginigtydgfrx",
          },
        });

        const mailOptions = {
          from: "info.mernmaniacs@gmail.com",

          to: req.body.email,

          subject: "Thank you " + req.body.name + " for messaging the team!",

          text: "We have received your message and " +
           "appreciate your feedback regarding " +
          req.body.subject +
         ".\n\nWe will get back to you shortly " +
         "regarding your feedback / concerns.\n\n" +
         "Thank You! \n\nYour message is as follows.\n\n\n" +
         req.body.message,
        };

        transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
            console.log(error);
            return res.send({status: "Error sending email"});
          } else {
            console.log("Email sent: " + info.response);
            return res.send({status: "success sending email"});
          }
        });
      } catch (err) {
        return res.status(500).json({error: "Server error"});
      }
    },
);

// route Delete api/contact
// desc delete contact by id - for admin purposes
// access public
router.delete("/", async (req, res) => {
  // find the element
  try {
    const contactMessage = await Contact.findOneAndRemove({_id: req.body.id});
    if (!contactMessage) {
      return res.status(404).send("contact message not found");
    }
    res.send("contact message has been deleted");
  } catch (err) {
    res.status(500).send("server error");
  }
});

// route PUT api/contact
// desc update contact by id - dont think we will need this
// access public
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
