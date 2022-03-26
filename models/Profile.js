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
  email: {
    type: String,
    require: [true, 'Please add your email'],
  },
  phone: {
    type: String,
    require: [true, 'Please add a phone'],
  },
  address: {
    type: String,
    require: [true, 'Please add a address'],
  },
  // productsRenting: { // how do i define what is inside this array?
  //   type: Array,
  //   require: [false],
  // },
  // productsLeasing: { // how do i define what is inside this array?
  //   type: Array,
  //   require: [false],
  // },
});

module.exports = mongoose.model('Profile', profileSchema);