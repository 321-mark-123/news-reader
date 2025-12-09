// server/server.js
import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();
const PORT = 5177;

// Middleware
app.use(cors()); // Allow CORS for development convenience
app.use(express.json());

// Check for API Token
if (!process.env.THENEWSAPI_TOKEN) {
  console.warn('WARNING: THENEWSAPI_TOKEN is not set in .env file.');
}

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// News Proxy Endpoint
app.get('/api/news/all', async (req, res) => {
  const token = process.env.THENEWSAPI_TOKEN;

  if (!token) {
    return res.status(500).json({
      error: 'Server Misconfiguration',
      message: 'API Token missing on server.',
    });
  }

  // Extract query params allowed to be passed through
  const { categories, search, page, limit, language } = req.query;

  try {
    const upstreamUrl = 'https://api.thenewsapi.com/v1/news/all';

    // Construct params for upstream
    const params = {
      api_token: token,
      language: language || 'en',
      limit: limit || 3,
      page: page || 1,
    };

    // Logic: If search is present, ignore categories (per prompt requirement)
    if (search) {
      params.search = search;
    } else if (categories) {
      params.categories = categories;
    } else {
      // Default to tech if neither is provided (though frontend should handle defaults)
      params.categories = 'tech';
    }

    console.log(`Proxying request to: ${upstreamUrl} (params: ${JSON.stringify({ ...params, api_token: '***' })})`);

    const response = await axios.get(upstreamUrl, { params });
    res.json(response.data);
  } catch (error) {
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      const status = error.response.status;
      const data = error.response.data;
      console.error(`Upstream API Error: ${status}`, data);

      if (status === 401 || status === 403) {
        return res.status(status).json({ error: 'Auth Error', message: 'TheNewsApi authentication failed.' });
      } else if (status === 429) {
        return res.status(status).json({ error: 'Rate Limit', message: 'Daily request limit reached.' });
      }

      return res.status(status).json(data);
    } else if (error.request) {
      // The request was made but no response was received
      console.error('Upstream API No Response:', error.request);
      return res.status(502).json({ error: 'Bad Gateway', message: 'No response from news API.' });
    } else {
      // Something happened in setting up the request that triggered an Error
      console.error('Proxy Error:', error.message);
      return res.status(500).json({ error: 'Internal Server Error', message: error.message });
    }
  }
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
