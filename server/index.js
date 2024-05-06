require('dotenv').config();

const express = require('express');
const multer = require('multer');

const PORT = process.env.PORT || 3000;
const app = express();

const connectDB = require('./config/db')
connectDB();

// Routes

app.use('/uploads', require('./routes/upload'));

app.listen(PORT, () => {
    console.log(`Listening to port ${PORT}`);
});