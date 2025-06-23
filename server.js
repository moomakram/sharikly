// filepath: /g:/My-company/sharikly/server.js
const express = require('express');
const cors = require('cors');
const request = require('request');
const app = express();

app.use(cors());

app.get('/proxy', (req, res) => {
  const url = req.query.url;
  if (!url) {
    return res.status(400).send('URL is required');
  }
  req.pipe(request(url)).pipe(res);
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Proxy server is running on port ${PORT}`);
});