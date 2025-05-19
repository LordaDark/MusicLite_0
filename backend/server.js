const { createServer } = require('http');
const app = require('./hono').default;

const port = process.env.PORT || 10000;

// Funzione per convertire Node.js IncomingMessage in Fetch API Request
function nodeRequestToFetchRequest(req) {
  const url = `http://${req.headers.host}${req.url}`;
  const headers = new Headers();
  for (const [key, value] of Object.entries(req.headers)) {
    if (Array.isArray(value)) {
      headers.set(key, value.join(', '));
    } else if (value !== undefined) {
      headers.set(key, value);
    }
  }
  return new Request(url, {
    method: req.method,
    headers,
    body: req.method === 'GET' || req.method === 'HEAD' ? undefined : req,
    duplex: 'half'
  });
}

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

  // Risposta rapida per test di funzionamento
  if (req.method === 'GET' && req.url === '/test-health') {
    res.writeHead(200, {'Content-Type': 'text/plain'});
    res.end('server funzionante');
    return;
  }

  // Converte la richiesta in formato Fetch API
  const fetchRequest = nodeRequestToFetchRequest(req);

  app.fetch(fetchRequest)
    .then((response) => {
      res.writeHead(response.status, Object.fromEntries(response.headers.entries()));
      return response.arrayBuffer();
    })
    .then((body) => {
      res.end(Buffer.from(body));
    })
    .catch((err) => {
      console.error('Error handling request:', err);
      res.writeHead(500, {'Content-Type': 'application/json'});
      res.end(JSON.stringify({ status: 'error', message: 'Internal Server Error' }));
    });
});

server.listen(port, () => {
  console.log(`Server running on port ${port}`);
});