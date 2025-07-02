const axios = require('axios');

const URL = 'https://bot-nsr-online.onrender.com';

setInterval(async () => {
  try {
    await axios.get(URL);
    console.log('✅ Successfully pinged Render URL!');
  } catch (error) {
    console.error('❌ Failed to ping:', error.message);
  }
}, 1000);
