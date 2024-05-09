require('dotenv').config();

const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 3000;
// Initializing Express App
const app = express();
app.use(express.json());
app.use(express.static('../client'));

// Database Connection
const connectDB = require('./config/db')
connectDB();

// Template Engine
app.set('views', path.join(__dirname, '../client/views'));
app.set('view engine', 'ejs');

// API Routes
app.use('api/uploads', require('./routes/upload'));
app.use('/f', require('./routes/show'));
app.use('/f/download', require('./routes/download'));

// Page Rendering Router
app.get('/', (req,res) => {
    res.sendFile(path.join(__dirname, '../client/views/index.html'));
});

app.get('/upload', (req,res) => {
    res.sendFile(path.join(__dirname, '../client/views/uploads.html'));
});

app.get('/download', (req,res) => {
    res.sendFile(path.join(__dirname, '../client/views/download.html'));
});

app.get('/contact', (req,res) => {
    res.sendFile(path.join(__dirname, '../client/views/contact.html'));
});

app.listen(PORT, () => {
    console.log(`Listening to ${process.env.APP_BASE_URL}/`);
});