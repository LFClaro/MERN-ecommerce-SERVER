const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const profileSchema = Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'users',
  },
  firstname: {
    type: String,
    require: [true, 'Please add your first name'],
  },
  lastname: {
    type: String,
    require: [true, 'Please add your last name'],
  },  
  phone: {
    type: String,
    require: [true, 'Please add a phone'],
  },
  address: { 
    type: String,
    require: [true, 'Please add a address'],
  },
  likedList: {
    type: [Schema.Types.ObjectId],
    ref: 'items',
    default: []
  }, 
  image: { 
    type: String,
    default: 'https://res.cloudinary.com/mernmaniacs/image/upload/v1649119596/profile_ftjfbn.jpg'
  },
});

module.exports = mongoose.model('Profile', profileSchema);
