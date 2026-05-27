const https = require('https');
const opts = {
  hostname: 'bwxxctyakpexqfbtoolg.supabase.co',
  path: '/rest/v1/profiles?select=id,photo_url&gender=eq.Female',
  method: 'GET',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4',
    'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4'
  }
};
https.get(opts, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const profiles = JSON.parse(data);
    const withPhoto = profiles.filter(p => p.photo_url);
    const withoutPhoto = profiles.filter(p => !p.photo_url);
    console.log('Total female profiles:', profiles.length);
    console.log('With photo:', withPhoto.length);
    console.log('Without photo:', withoutPhoto.length);
  });
});