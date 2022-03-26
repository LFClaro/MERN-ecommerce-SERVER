const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const itemSchema = Schema({
    user: { type: Schema.Types.ObjectId, ref: 'users' },
    name: { type: String, require: [true, 'Item must have a Name'] },
    description: { type: String, require: [true, 'Item must have a Description'] },
    image: { type: String },
    price: { type: Number, required: true},
    overallRating: { type: [Number], required: true },
    isRented: { type: Boolean, required: true, default: false },
    updated: { type: Date, required: true, default: Date.now() },
});

module.exports = mongoose.model('Item', itemSchema);