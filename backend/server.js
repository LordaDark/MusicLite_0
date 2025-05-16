const { createServer } = require('http');
const app = require('./hono').default;

const port = process.env.PORT || 3000;

// Create a server with the Hono app
const server = createServer((req, res) => {
  // Handle CORS for all requests
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, DELETE');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // Pass the request to the Hono app
  app.fetch(req, {
    headers: req.headers,
    method: req.method,
    body: req,
  }).then((response) => {
    res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
    return response.arrayBuffer();
  }).then((body) => {
    res.end(Buffer.from(body));
  }).catch((err) => {
    console.error('Error handling request:', err);
    res.writeHead(500);
    res.end('Internal Server Error');
  });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});