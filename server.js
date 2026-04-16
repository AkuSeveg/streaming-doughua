require('dotenv').config();
const express = require('express');
const axios = require('axios');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const NodeCache = require('node-cache');

const app = express();
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

app.use(helmet({
    contentSecurityPolicy: false
}));
app.use(cors());
app.use(compression());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 150, 
    message: { success: false, message: "Too many requests" }
});
app.use('/api/', limiter);

const orbitcloudAPI = axios.create({
    baseURL: process.env.BASE_URL,
    headers: { 
        'x-api-key': process.env.API_KEY,
        'Content-Type': 'application/json'
    },
    timeout: 15000
});

app.get('/api/home', async (req, res) => {
    try {
        const pages = req.query.pages || '1';
        const cacheKey = `home_page_${pages}`;

        if (cache.has(cacheKey)) {
            return res.status(200).json(cache.get(cacheKey));
        }

        const response = await orbitcloudAPI.get(`/api/v1/home?pages=${pages}`);
        cache.set(cacheKey, response.data);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ success: false, message: error.message });
    }
});

app.get('/api/search', async (req, res) => {
    try {
        const { q, pages = '1' } = req.query;
        if (!q) return res.status(400).json({ success: false, message: "Query required" });

        const cacheKey = `search_${q.toLowerCase()}_page_${pages}`;
        if (cache.has(cacheKey)) {
            return res.status(200).json(cache.get(cacheKey));
        }

        const response = await orbitcloudAPI.get(`/api/v1/search?q=${q}&pages=${pages}`);
        cache.set(cacheKey, response.data);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ success: false, message: error.message });
    }
});

app.get('/api/schedule', async (req, res) => {
    try {
        const cacheKey = `schedule_weekly`;
        if (cache.has(cacheKey)) return res.status(200).json(cache.get(cacheKey));

        const response = await orbitcloudAPI.get('/api/v1/schedule');
        cache.set(cacheKey, response.data, 3600); 
        res.status(200).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ success: false, message: error.message });
    }
});

app.get('/api/detail/:slug', async (req, res) => {
    try {
        const cacheKey = `detail_${req.params.slug}`;
        if (cache.has(cacheKey)) return res.status(200).json(cache.get(cacheKey));

        const response = await orbitcloudAPI.get(`/api/v1/detail/${req.params.slug}`);
        cache.set(cacheKey, response.data, 1800);
        res.status(200).json(response.data);
    } catch (error) {
        res.status(error.response?.status || 500).json({ success: false, message: error.message });
    }
});

app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

module.exports = app;
