const https = require('https');

const SUPABASE_URL = 'bwxxctyakpexqfbtoolg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4';

console.log('Getting table info...');

const opts = {
  hostname: SUPABASE_URL,
  path: `/rest/v1/profiles?select=*&limit=1`,
  method: 'GET',
  headers: {
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${ANON_KEY}`
  }
};

https.get(opts, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const profile = JSON.parse(data)[0];
      console.log('\n📋 Available columns in profiles table:\n');
      Object.keys(profile).forEach((key, i) => {
        console.log(`${i+1}. ${key}`);
      });
    } catch (e) {
      console.log('Error parsing');
    }
  });
}).on('error', (e) => console.error('Error:', e));