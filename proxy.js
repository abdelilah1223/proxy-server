const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();

// إعداد CORS للسماح بالطلبات من نطاقات معينة
app.use(cors({
    origin: 'https://abdelilah1223.github.io', // هنا يمكنك تعديل النطاق الذي تود السماح له
    methods: ['GET', 'POST'],  // السماح بالطرق التي تحتاجها
    allowedHeaders: ['Content-Type', 'Authorization'], // السماح برؤوس معينة
}));

app.use(bodyParser.json()); // لتحليل بيانات JSON من الطلبات

// نقطة النهاية للبروكسي
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
