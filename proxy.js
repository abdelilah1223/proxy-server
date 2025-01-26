const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(bodyParser.json());

app.post('/proxy', async (req, res) => {
    const targetUrl = req.body.url;
    const options = {
        method: 'POST',
        headers: req.body.headers || {},
        body: JSON.stringify(req.body.body)
    };

    try {
        const response = await fetch(targetUrl, options);
        const data = await response.text(); 
        res.send(data);
    } catch (error) {
        res.status(500).send('Error: ' + error.message);
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy server running on port ${PORT}`));
