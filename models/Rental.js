const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const rentalSchema = new Schema({
    item: { type: ObjectId, required: true, ref: 'items' },
    user: { type: ObjectId, required: true, ref: 'users' },
    date: { type: Date, required: true, default: Date.now() },
    days: { type: Number, required: true },
    rating: { type: Number, required: true}
})

module.exports = mongoose.model('Rental', rentalSchema);