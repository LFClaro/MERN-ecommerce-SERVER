const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const faqSchema = Schema({
    title: {
        type: String,
        require: true,
    },
    answer: String, //shorthand notation
    // category: String,
    // createAt: {
    //     type: Date,
    //     immutable,
    //     default: new Date.now(),
    // },
    // author: String,

})

module.exports = mongoose.model('Faq', faqSchema);