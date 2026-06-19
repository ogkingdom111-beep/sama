const express = require('express');
const serverless = require('serverless-http');
const rateLimit = require('express-rate-limit');
const cors = require('cors');
const data = require('../../data.json');

const app = express();
app.set('trust proxy', 1);
app.use(cors());

const searchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000,
    max: 10,
    message: { error: 'تم تجاوز الحد المسموح من عمليات البحث. يرجى المحاولة بعد دقيقة.' },
    standardHeaders: true,
    legacyHeaders: false,
});

app.get('/api/search', searchLimiter, (req, res) => {
    try {
        const { type, query } = req.query;
        if (!type || !query) {
            return res.status(400).json({ error: 'Missing type or query' });
        }

        const q = query.trim().toLowerCase();
        let field = '';
        if (type === 'certNumber') {
            field = 'رقم_الشهادة';
        } else if (type === 'fullName') {
            field = 'اسم_الطالب';
        } else {
            return res.status(400).json({ error: 'Invalid search type' });
        }

        const result = data.find(record => {
            const value = String(record[field] || '').toLowerCase();
            return value.includes(q);
        });

        if (result) {
            res.json(result);
        } else {
            res.status(404).json({ error: 'Certificate not found' });
        }
    } catch (err) {
        console.error('Search error:', err);
        res.status(500).json({ error: 'Internal server error' });
    }
});

module.exports.handler = serverless(app);
