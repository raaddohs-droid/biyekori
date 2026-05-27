const https = require('https');

const SUPABASE_URL = 'https://bwxxctyakpexqfbtoolg.supabase.co';
const KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4';

function query(sql) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'bwxxctyakpexqfbtoolg.supabase.co',
      port: 443,
      path: `/rest/v1/rpc/sql_query`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KEY}`,
        'Content-Type': 'application/json'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve(null);
        }
      });
    });

    req.on('error', () => resolve(null));
    req.end();
  });
}

async function check() {
  console.log('\n📊 Checking male profiles...\n');
  
  // Simple approach: just count from profiles table
  const options = {
    hostname: 'bwxxctyakpexqfbtoolg.supabase.co',
    port: 443,
    path: `/rest/v1/profiles?select=id,photo_url&gender=eq.Male`,
    method: 'GET',
    headers: {
      'Authorization': `Bearer ${KEY}`,
      'apikey': KEY
    }
  };

  const req = https.request(options, (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      try {
        const profiles = JSON.parse(data);
        const withPhotos = profiles.filter(p => p.photo_url).length;
        const withoutPhotos = profiles.length - withPhotos;
        
        console.log(`Total males: ${profiles.length}`);
        console.log(`With photos: ${withPhotos}`);
        console.log(`WITHOUT photos: ${withoutPhotos}\n`);
      } catch (e) {
        console.log('Error parsing response');
      }
    });
  });

  req.on('error', (e) => console.error('Error:', e));
  req.end();
}

check();