const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

const app = express();
const PORT = process.env.PORT || 3001;
const DATA_FILE = path.join(__dirname, 'data.json');

// --- Rate Limiter for Search API ---
const searchLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute window
    max: 10, // Limit each IP to 10 requests per windowMs
    message: { error: 'تم تجاوز الحد المسموح من عمليات البحث. يرجى المحاولة بعد دقيقة.' },
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});

app.use(cors());
app.use(express.json({ limit: '50mb' }));
// Serve only the main HTML file, to protect data.json
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'deepseek_html_20260619_1557cd.html'));
});

// Endpoint to search for a certificate
app.get('/api/search', searchLimiter, async (req, res) => {
    try {
        const { type, query } = req.query;
        if (!type || !query) {
            return res.status(400).json({ error: 'Missing type or query' });
        }

        let dataStr;
        try {
            dataStr = await fs.readFile(DATA_FILE, 'utf-8');
        } catch (err) {
            if (err.code === 'ENOENT') {
                return res.status(404).json({ error: 'Data file not found' });
            }
            throw err;
        }

        const data = JSON.parse(dataStr);

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
            return value.includes(q); // Use includes for partial matching
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



app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
