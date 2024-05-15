require('dotenv').config();

const express = require('express');
const path = require('path');

const PORT = process.env.PORT || 3000;
// Initializing Express App
const app = express();
app.use(express.json());

// CORS Config 
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', 'http://127.0.0.1:3001');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    next();
});

// Serve static files from the src folder
app.use(express.static(path.join(__dirname, 'public')));

// Database Connection
const connectDB = require('./config/db');
connectDB();

// Template Engine
app.set('views', path.join(__dirname, './views'));
app.set('view engine', 'ejs');

// API Routes
app.use('/api/upload', require('./routes/upload'));
app.use('/f', require('./routes/show'));
app.use('/f/download', require('./routes/download'));

// Page Rendering Router
app.get('/', (req,res) => {
    res.set('Content-Type', 'text/html');
    res.sendFile(path.join(__dirname, './public/index.html'));
});

// app.get('/upload', (req,res) => {
//     res.sendFile(path.join(__dirname, './public/pages/upload.html'));
// });

// app.get('/download', (req,res) => {
//     res.sendFile(path.join(__dirname, './public/pages/download.html'));
// });

// app.get('/contact', (req,res) => {
//     res.sendFile(path.join(__dirname, './public/pages/contact.html'));
// });

app.listen(PORT, () => {
    console.log(`Listening to ${process.env.APP_BASE_URL}/`);
});