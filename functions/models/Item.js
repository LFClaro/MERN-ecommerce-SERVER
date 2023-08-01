const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// eslint-disable-next-line new-cap
const itemSchema = Schema({
  user: {type: Schema.Types.ObjectId, ref: "users"},
  name: {type: String, require: [true, "Item must have a Name"]},
  description: {type: String, require: [true, "Item must have a Description"]},
  category: {type: String, require: [true, "Item must have a Category"]},
  image: {type: String},
  price: {type: Number, required: true},
  overallRating: {type: [Number], required: true},
  isRented: {type: Boolean, required: true, default: false},
  currentRental: {type: Schema.Types.ObjectId, ref: "rentals"},
  updated: {type: Date, required: true, default: Date.now()},
  lat: {type: Number},
  lng: {type: Number},
});

module.exports = mongoose.model("Item", itemSchema);
