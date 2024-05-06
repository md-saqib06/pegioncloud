require('dotenv').config();
const mongoose = require('mongoose');

function connectDB() {
    try {
        mongoose.connect(process.env.DB_URL);
        console.log('Successfully connected to MongoDB!')
    } catch(err) {
        console.log(`Unable to connect to database!\n\n${err.message}`);
    }
}

module.exports = connectDB;
