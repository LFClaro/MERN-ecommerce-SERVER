const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// eslint-disable-next-line new-cap
const userSchema = Schema({
  // fname: String, //shorthand notation
  // lname: String,
  email: {
    type: String,
    require: true,
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    require: true,
  },
  role: {
    type: String,
    require: true,
    default: "guest",
  },
  createAt: {
    type: Date,
    required: true,
    default: Date.now,
    immutable: true, // so this value can never be changed
  },
  date: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("User", userSchema);
