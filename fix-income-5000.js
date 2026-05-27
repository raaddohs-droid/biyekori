const https = require('https');

const SUPABASE_URL = 'bwxxctyakpexqfbtoolg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4';

function fetchBatch(offset) {
  return new Promise((resolve) => {
    const opts = {
      hostname: SUPABASE_URL,
      path: `/rest/v1/profiles?select=id,monthly_income,expected_income,profession&order=id.asc&limit=200&offset=${offset}`,
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
        try { resolve(JSON.parse(data)); }
        catch { resolve([]); }
      });
    }).on('error', () => resolve([]));
  });
}

function updateProfile(id, updates) {
  return new Promise((resolve) => {
    const body = JSON.stringify(updates);
    const opts = {
      hostname: SUPABASE_URL,
      path: `/rest/v1/profiles?id=eq.${id}`,
      method: 'PATCH',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Prefer': 'return=minimal'
      }
    };
    const req = https.request(opts, (res) => {
      res.on('data', () => {});
      res.on('end', () => resolve(res.statusCode));
    });
    req.on('error', () => resolve(0));
    req.write(body);
    req.end();
  });
}

function roundTo5000(n) {
  if (!n || n === 0) return 0;
  return Math.round(n / 5000) * 5000;
}

async function main() {
  console.log('💰 Rounding all incomes to nearest 5000...\n');

  const batch1 = await fetchBatch(0);
  const batch2 = await fetchBatch(200);
  const batch3 = await fetchBatch(400);
  const profiles = [...batch1, ...batch2, ...batch3];

  console.log(`📊 Total profiles: ${profiles.length}\n`);

  let fixed = 0;

  for (const p of profiles) {
    const updates = {};

    if (p.monthly_income && p.monthly_income > 0 && p.monthly_income % 5000 !== 0) {
      updates.monthly_income = roundTo5000(p.monthly_income);
    }
    if (p.expected_income && p.expected_income > 0 && p.expected_income % 5000 !== 0) {
      updates.expected_income = roundTo5000(p.expected_income);
    }

    if (Object.keys(updates).length > 0) {
      const status = await updateProfile(p.id, updates);
      if (status === 204 || status === 200) {
        fixed++;
        if (fixed % 30 === 0) console.log(`✅ Fixed ${fixed} profiles...`);
      }
      await new Promise(r => setTimeout(r, 80));
    }
  }

  console.log(`\n🎉 DONE! Fixed income rounding for ${fixed} profiles.`);
  console.log(`💰 All incomes now rounded to nearest 5,000 BDT`);
}

main();
