const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const communitySchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
  username: {
    type: String,
    require: [true, 'Please add your name'], // get this from db
  },  
  title: {
    type: String,
    require: [true, 'Please add a title'], 
  },
  content: {
    type: String,
    require: [true, 'Please add content'], 
  },
  category: {
    type: String,
    require: [true, 'Please add a category'], 
  },
  picture: {
    type: String,
    require: [false, 'Please add a picture'], 
  },
  date: {
    type:  String,
    require: [true, 'Please add a date'], 
  }, 
});

module.exports = mongoose.model('CommunityPost', communitySchema); 
