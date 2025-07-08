
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

// IMPORTANT: Adjust the path to your pre-built logging middleware
const loggingMiddleware = require('../Logging Middleware/index.js'); 
const urlController = require('./controllers/urlController');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log('MongoDB connected...'))
    .catch(err => console.error(err));

// Middlewares
app.use(cors());
app.use(express.json());
app.use(loggingMiddleware); // Use your custom logger

// API Routes
app.post('/shorturls', urlController.createShortUrl);
app.get('/shorturls/:shortcode', urlController.getUrlStats);

// Redirection Route (must be last)
app.get('/:shortcode', urlController.redirectToOriginalUrl);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));