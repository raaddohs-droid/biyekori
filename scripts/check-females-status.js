const https = require('https');

const SUPABASE_URL = 'bwxxctyakpexqfbtoolg.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4';

console.log('\n📊 Checking female profiles...\n');

const options = {
  hostname: SUPABASE_URL,
  path: `/rest/v1/profiles?select=id,photo_url&gender=eq.Female`,
  method: 'GET',
  headers: {
    'Authorization': `Bearer ${KEY}`,
    'apikey': KEY
  }
};

https.get(options, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    try {
      const profiles = JSON.parse(data);
      const withPhotos = profiles.filter(p => p.photo_url).length;
      const withoutPhotos = profiles.length - withPhotos;
      
      console.log(`Total females: ${profiles.length}`);
      console.log(`With photos: ${withPhotos}`);
      console.log(`WITHOUT photos: ${withoutPhotos}\n`);
    } catch (e) {
      console.log('Error');
    }
  });
}).on('error', (e) => console.error('Error'));