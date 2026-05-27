const https = require('https');

const SUPABASE_URL = 'bwxxctyakpexqfbtoolg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4';

// Get one female ID
const opts1 = {
  hostname: SUPABASE_URL,
  path: `/rest/v1/profiles?select=id&gender=eq.Female&limit=1`,
  method: 'GET',
  headers: {
    'apikey': ANON_KEY,
    'Authorization': `Bearer ${ANON_KEY}`
  }
};

https.get(opts1, (res) => {
  let data = '';
  res.on('data', chunk => data += chunk);
  res.on('end', () => {
    const profile = JSON.parse(data)[0];
    const id = profile.id;
    
    console.log(`\nTesting update for female ID: ${id}\n`);
    
    // Try to update with simple data
    const updateData = {
      full_name: 'Test Name',
      age: 25,
      about_me: 'Test bio'
    };
    
    const body = JSON.stringify(updateData);
    
    const opts2 = {
      hostname: SUPABASE_URL,
      path: `/rest/v1/profiles?id=eq.${id}`,
      method: 'PATCH',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': body.length
      }
    };
    
    const req = https.request(opts2, (res) => {
      let respData = '';
      res.on('data', chunk => respData += chunk);
      res.on('end', () => {
        console.log(`Status: ${res.statusCode}`);
        console.log(`Response: ${respData}`);
      });
    });
    
    req.on('error', (err) => console.error('Error:', err.message));
    req.write(body);
    req.end();
  });
});