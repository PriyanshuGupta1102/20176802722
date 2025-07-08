const fs = require('fs');
const path = require('path');
const axios = require('axios');

// Define the path for the local log file
const logFilePath = path.join(__dirname, 'activity.log');

// Remote logging config
const remoteLoggingUrl = 'http://20.244.56.144/evaluation-service/log';
const accessToken = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJNYXBDbGFpbXMiOnsiYXVkIjoiaHR0cDovLzIwLjI0NC41Ni4xNDQvZXZhbHVhdGlvbi1zZXJ2aWNlIiwiZW1haWwiOiJwZzAwMDA3NDJAZ21haWwuY29tIiwiZXhwIjoxNzUxOTUxNDI1LCJpYXQiOjE3NTE5NTA1MjUsImlzcyI6IkFmZm9yZCBNZWRpY2FsIFRlY2hub2xvZ2llcyBQcml2YXRlIExpbWl0ZWQiLCJqdGkiOiIyMWU0OGQ1ZS1kYzY2LTQwZDctYWUxZi05MWVmNTE1NWFlMmYiLCJsb2NhbGUiOiJlbi1JTiIsIm5hbWUiOiJwcml5YW5zaHUgZ3VwdGEiLCJzdWIiOiIyZjVlNTMxNy0wMWQ0LTQ2ZmUtYjdmYS00MTY1OTE3OWNmZTAifSwiZW1haWwiOiJwZzAwMDA3NDJAZ21haWwuY29tIiwibmFtZSI6InByaXlhbnNodSBndXB0YSIsInJvbGxObyI6IjIwMTc2ODAyNzIyIiwiYWNjZXNzQ29kZSI6IlZQcHNtVCIsImNsaWVudElEIjoiMmY1ZTUzMTctMDFkNC00NmZlLWI3ZmEtNDE2NTkxNzljZmUwIiwiY2xpZW50U2VjcmV0IjoieGRrUVJOU2RreHZBV1JOZyJ9.-j44Ue56BCBkf_jFgncz_K69vrQRG8ssIeoeHJx56D8';

// Middleware function
const loggingMiddleware = (req, res, next) => {
    const timestamp = new Date().toISOString();
    const logMessage = `${timestamp} | ${req.method} | ${req.originalUrl} | ${req.ip}\n`;

    // Log to console
    console.log(logMessage.trim());

    // Append to local file
    fs.appendFile(logFilePath, logMessage, (err) => {
        if (err) {
            console.error('Failed to write to log file.', err);
        }
    });

    // Send log to remote server
    axios.post(remoteLoggingUrl, {
        timestamp,
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
    }, {
        headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
        }
    }).catch(err => {
        console.error('Failed to log to remote server:', err.response ? err.response.data : err.message);
    });

    next();
};

module.exports = loggingMiddleware;
