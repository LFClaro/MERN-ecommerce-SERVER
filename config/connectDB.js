const mongoose = require('mongoose');
const dotenv = require('dotenv').config();

const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_DB_CONN, {
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log('Database Connected');

    } catch (err) {
        console.log('Unable to connect' + err.message);
    }
}

module.exports = connectDB;