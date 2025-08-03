require('dotenv').config();
const express = require('express');
const cors = require('cors');

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const app = express();
const PORT = 3000;
const API_KEY = process.env.API_KEY;

app.use(cors());

app.get('/vehicles', async (req, res) => {
  console.log('Fetching vehicles from CUMTD...');
  console.log('API_KEY:', API_KEY);

  try {
    const response = await fetch(`https://developer.cumtd.com/api/v2.2/json/GetVehicles?key=${API_KEY}`);
    const data = await response.json();
    res.json(data);
  } catch (err) {
    console.error('Error fetching vehicles:', err);
    res.status(500).json({ error: 'Failed to fetch vehicle data' });
  }
});

app.listen(PORT, () => {
  console.log(`Backend proxy running at http://localhost:${PORT}`);
});
