// Logging Middleware/index.js

const fs = require('fs');
const path = require('path');

// Define the path for the log file
const logFilePath = path.join(__dirname, 'activity.log');

const loggingMiddleware = (req, res, next) => {
    // Construct the log message
    const logMessage = `${new Date().toISOString()} | ${req.method} | ${req.originalUrl} | ${req.ip}\n`;

    // Log to the console for immediate visibility during development
    console.log(logMessage.trim());

    // Append the message to the log file
    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error('Failed to write to log file.', err);
        }
    });

    // VERY IMPORTANT: Call next() to pass control to the next middleware in the stack
    next();
};

// THE FIX: Make sure you are exporting the function itself, not an object.
module.exports = loggingMiddleware;