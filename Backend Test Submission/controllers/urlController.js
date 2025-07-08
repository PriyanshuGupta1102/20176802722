// // controllers/urlController.js
// const Url = require('../models/url');
// const shortid = require('shortid');

// // POST /shorturls - Create a new short URL
// exports.createShortUrl = async (req, res) => {
//     // Add your logic here for validation, custom shortcodes, etc.
//     // ...
// };

// // GET /shorturls/:shortcode - Get URL statistics
// exports.getUrlStats = async (req, res) => {
//     // Add your logic here to find the URL and return stats
//     // ...
// };

// // GET /:shortcode - Redirect to original URL
// exports.redirectToOriginalUrl = async (req, res) => {
//     // Add your logic here to find, validate, log click, and redirect
//     // ...
// };

// controllers/urlController.js

const Url = require('../models/url');
const shortid = require('shortid');
const validUrl = require('url-validator');

// Function to build the full short link URL
const buildShortLink = (req, shortCode) => {
    return `${req.protocol}://${req.get('host')}/${shortCode}`;
};

// POST /shorturls - Create a new short URL
exports.createShortUrl = async (req, res) => {
    const { url: originalUrl, validity, shortcode: customShortcode } = req.body;

    // 1. Validate the original URL
    if (!validUrl(originalUrl)) {
        return res.status(400).json({ error: 'Invalid URL format provided.' });
    }

    try {
        let shortCode = customShortcode;

        // 2. Handle the shortcode (custom or generated)
        if (shortCode) {
            // Check if the custom shortcode already exists
            const existing = await Url.findOne({ shortCode });
            if (existing) {
                return res.status(409).json({ error: 'Shortcode already in use. Please choose another.' });
            }
        } else {
            // Generate a new, unique shortcode
            shortCode = shortid.generate();
        }

        // 3. Calculate the expiry date (defaults to 30 minutes)
        const validityMinutes = validity || 30;
        const expiryDate = new Date();
        expiryDate.setMinutes(expiryDate.getMinutes() + validityMinutes);

        // 4. Create and save the new URL document
        const newUrl = new Url({
            originalUrl,
            shortCode,
            expiryDate,
            clicks: [],
        });

        await newUrl.save();
        
        // 5. Respond with the created link
        res.status(201).json({
            shortLink: buildShortLink(req, shortCode),
            expiry: expiryDate.toISOString(),
        });

    } catch (err) {
        console.error(err); // Use your actual logger here
        res.status(500).json({ error: 'Server error while creating short link.' });
    }
};

// GET /:shortcode - Redirect to original URL
exports.redirectToOriginalUrl = async (req, res) => {
    try {
        const { shortcode } = req.params;
        const urlDoc = await Url.findOne({ shortCode: shortcode });

        // 1. Check if the URL exists
        if (!urlDoc) {
            return res.status(404).json({ error: 'Shortcode not found.' });
        }

        // 2. Check if the URL has expired
        if (new Date() > urlDoc.expiryDate) {
            return res.status(410).json({ error: 'This link has expired.' });
        }

        // 3. Log the click information
        urlDoc.clicks.push({
            referrer: req.get('Referrer') || 'Direct',
            location: 'N/A', // Coarse-grained location is a more advanced topic
        });
        await urlDoc.save();

        // 4. Redirect the user
        return res.redirect(urlDoc.originalUrl);

    } catch (err) {
        console.error(err); // Use your actual logger here
        res.status(500).json({ error: 'Server error during redirection.' });
    }
};

// GET /shorturls/:shortcode - Get URL statistics
exports.getUrlStats = async (req, res) => {
    try {
        const { shortcode } = req.params;
        const urlDoc = await Url.findOne({ shortCode: shortcode });

        if (!urlDoc) {
            return res.status(404).json({ error: 'Statistics for this shortcode not found.' });
        }
        
        res.status(200).json({
            originalUrl: urlDoc.originalUrl,
            createdAt: urlDoc.createdAt,
            expiryDate: urlDoc.expiryDate,
            totalClicks: urlDoc.clicks.length,
            clickData: urlDoc.clicks,
        });

    } catch (err) {
        console.error(err); // Use your actual logger here
        res.status(500).json({ error: 'Server error while fetching stats.' });
    }
};