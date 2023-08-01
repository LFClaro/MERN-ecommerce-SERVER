const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// eslint-disable-next-line new-cap
const checkoutSchema = Schema({
  // stripe details
  stripeToken: {
    type: Object,
    require: true,
  },

  // checkout item
  checkoutItem: {
    type: Object,
    require: true,
  },
});

module.exports = mongoose.model("Checkout", checkoutSchema);
