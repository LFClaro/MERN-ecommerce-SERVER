const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const ObjectId = Schema.Types.ObjectId;

const rentalSchema = new Schema({
    item: { type: ObjectId, required: true, ref: 'items' },
    user: { type: ObjectId, required: true, ref: 'users' },
    rentalDate: { type: Date },
    returnDate: { type: Date },
    comment: {
        title: { type: String },
        text: { type: String },
        rating: { type: Number },
        date: { type: Date }
    }
})

module.exports = mongoose.model('Rental', rentalSchema);