// Script di prova per scrivere un log sulla console
console.log("[PROVA-LOG] Script eseguito correttamente! Ora puoi vedere questo messaggio nel terminale.");

// Effettua una richiesta HTTP GET all'API di MusicLite su Render
const https = require('https');

const options = {
  hostname: 'musiclite-api.onrender.com',
  path: '/',
  method: 'GET'
};

const req = https.request(options, res => {
  let data = '';
  res.on('data', chunk => {
    data += chunk;
  });
  res.on('end', () => {
    console.log('[PROVA-LOG] Risposta dall\'API:', data);
  });
});

req.on('error', error => {
  console.error('[PROVA-LOG] Errore nella richiesta:', error);
});

req.end();