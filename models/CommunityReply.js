const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const communitySchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
  username: { 
    type: String,
    require: [true], // get this from db
  }, 
  postid: {
    type: String,
    require: [true], // get this from db
  }, 
  reply: {
    type: String,
    require: [true, 'Please add a reply'], 
  },
  replyCount: {
    type: Number,
    require: [true],
  },
});

module.exports = mongoose.model('CommunityReply', communitySchema);
