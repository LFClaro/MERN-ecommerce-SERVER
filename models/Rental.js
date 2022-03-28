const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const rentalSchema = new Schema({
    item: { type: ObjectId, required: true, ref: 'items' },
    user: { type: ObjectId, required: true, ref: 'users' },
    rentalDate: { type: Date, default: Date.now() },
    returnDate: { type: Date, default: Date.now() + 1 },
    comment: {
        title: { type: String },
        text: { type: String },
        rating: { type: Number },
        date: { type: Date }
    }
})

module.exports = mongoose.model('Rental', rentalSchema);