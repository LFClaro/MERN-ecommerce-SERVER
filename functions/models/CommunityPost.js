const mongoose = require("mongoose");
const Schema = mongoose.Schema;
//  this is for admin - they will be creating
// the post and the users can reply to posts
// eslint-disable-next-line new-cap
const communitySchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  username: {
    type: String,
    require: [true, "Please add your name"], // get this from db
  },
  title: {
    type: String,
    require: [true, "Please add a title"],
  },
  content: {
    type: String,
    require: [true, "Please add content"],
  },
  category: {
    type: String,
    require: [true, "Please add a category"],
  },
  picture: {
    type: String,
    require: [false, "Please add a picture"],
  },
  date: {
    type: String,
    require: [true, "Please add a date"],
  },
});

module.exports = mongoose.model("CommunityPost", communitySchema);
