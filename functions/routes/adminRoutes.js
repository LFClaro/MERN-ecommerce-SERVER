const express = require("express");
// eslint-disable-next-line new-cap
const router = express.Router();
const authMiddleware = require("../middlewares/auth");

const User = require("../models/User");

router.get("/",
    authMiddleware,
    async (req, res) => {
      try {
        const user = await User.findById(req.user.id).select("-password");
        res.send(user);
      } catch (err) {
        return res.status(500).send("server error");
      }
    });

router.get("/all",
    authMiddleware,
    async (req, res) => {
      try {
        const users = await User.find({user: req.user.id});
        res.send(users);
      } catch (error) {
        res.status(500).send("server error");
      }
    },
);

router.put("/",
    authMiddleware,
    async (req, res) => { // Used to update the data
      try {
        const user = await User.findById(req.body._id);
        if (!user) {
          return res.status(404).send("Usr does not exist");
        }
        user.role = req.body.role;
        await user.save();
        res.send(user);
      } catch (err) {
        res.status(500).send("server error");
      }
    });

module.exports = router;
