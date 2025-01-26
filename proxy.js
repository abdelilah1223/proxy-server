const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// CORS configuration: allow all origins
app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Parse incoming requests
app.use(bodyParser.json({ limit: '5mb' })); // Limit request size to 5MB
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));

// Middleware for setting Content Security Policy (CSP)
app.use((req, res, next) => {
    res.header('Content-Security-Policy', "default-src 'self'; media-src 'self' data:;");
    next();
});

// Proxy endpoint
app.all('/proxy', async (req, res) => {
    const targetUrl = req.body.url;

    // Validate URL
    if (!targetUrl || !/^https?:\/\//.test(targetUrl)) {
        return res.status(400).send('Invalid URL');
    }

    // Configure request options
    const options = {
        method: req.method, // Use the HTTP method from the client
        headers: req.body.headers || {}, // Use headers from the client request
        body: req.body.body ? JSON.stringify(req.body.body) : null // Use body if provided
    };

    try {
        // Forward the request to the target URL
        const response = await fetch(targetUrl, options);
        const contentType = response.headers.get('content-type');

        // Return response based on content type
        if (contentType && contentType.includes('application/json')) {
            const data = await response.json();
            res.json(data);
        } else {
            const data = await response.text();
            res.send(data);
        }
    } catch (error) {
        console.error('Proxy Error:', error);
        res.status(500).json({
            error: true,
            message: error.message,
            stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
