const axios = require('axios');

// Imposta manualmente la chiave API per il test locale se non presente
if (!process.env.YOUTUBE_API_KEY) {
  process.env.YOUTUBE_API_KEY = 'AIzaSyDJEMQDBr3qo-c26SixXIs7jGYnkh2eFj4'; // Sostituisci con la tua chiave reale
}

async function testYouTubeSearch() {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      throw new Error('YOUTUBE_API_KEY non impostata nelle variabili d\'ambiente');
    }
    const url = 'https://www.googleapis.com/youtube/v3/search';
    const params = {
      part: 'snippet',
      q: 'mamma',
      maxResults: 5,
      type: 'video',
      key: apiKey
    };
    const response = await axios.get(url, { params });
    console.log('Risposta JSON YouTube:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    if (error.response) {
      console.error('Errore risposta YouTube API:', error.response.status, error.response.statusText, error.response.data);
    } else {
      console.error('Errore richiesta YouTube API:', error.message);
    }
  }
}

testYouTubeSearch();