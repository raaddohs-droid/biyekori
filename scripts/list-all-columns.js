const https = require('https');

const opts = {
  hostname: 'bwxxctyakpexqfbtoolg.supabase.co',
  path: `/rest/v1/profiles?select=*&limit=1`,
  method: 'GET',
  headers: {
    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4'
  }
};

https.get(opts, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const profile = JSON.parse(data)[0];
    console.log('\n📋 ALL COLUMNS:\n');
    const cols = Object.keys(profile).sort();
    cols.forEach((col, i) => {
      console.log(`${i+1}. ${col}`);
    });
  });
});