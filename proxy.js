const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

app.use(cors({
    origin: '*', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));


app.use(bodyParser.json({ limit: '5mb' })); 
app.use(bodyParser.urlencoded({ extended: true, limit: '5mb' }));

app.use((req, res, next) => {
    res.header('Content-Security-Policy', "default-src 'self'; media-src 'self' data:;");
    next();
});

app.all('/proxy', async (req, res) => {
    const targetUrl = req.body.url;

    if (!targetUrl || !/^https?:\/\//.test(targetUrl)) {
        return res.status(400).send('Invalid URL');
    }

    const options = {
        method: req.method, 
        headers: req.body.headers || {}, // Use headers from the client request
        body: req.body.body ? JSON.stringify(req.body.body) : null // Use body if provided
    };

    try {
        const response = await fetch(targetUrl, options);
        const contentType = response.headers.get('content-type');


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


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
