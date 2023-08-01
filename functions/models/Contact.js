const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// eslint-disable-next-line new-cap
const contactSchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  name: {
    type: String,
    require: [true, "Please add your name"],
  },
  email: {
    type: String,
    require: [true, "Please add your email"],
  },
  subject: {
    type: String,
    require: [true, "Please add a subject"],
  },
  message: {
    type: String,
    require: [true, "Please add a message"],
  },
});

module.exports = mongoose.model("Contact", contactSchema);
