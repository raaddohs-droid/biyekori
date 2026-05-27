const https = require('https');

const SUPABASE_URL = 'bwxxctyakpexqfbtoolg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4';

const names = ['Fatima Khan', 'Rashida Begum', 'Nasrin Ahmed', 'Yasmin Akter', 'Hafiza Begum', 'Zainab Khan', 'Salma Begum', 'Aisha Khan', 'Priya Sharma', 'Anjali Devi'];
const professions = ['Software Engineer', 'Doctor', 'Teacher', 'Banker', 'Housewife'];
const cities = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna'];

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomAge(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

async function getFemaleIds() {
  return new Promise((resolve) => {
    const opts = {
      hostname: SUPABASE_URL,
      path: /rest/v1/profiles?select=id&gender=eq.Female,
      method: 'GET',
      headers: { 'apikey': ANON_KEY, 'Authorization': Bearer \ }
    };
    https.get(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data).map(p => p.id)));
    });
  });
}

async function updateProfile(id, data) {
  return new Promise((resolve) => {
    const body = JSON.stringify(data);
    const opts = {
      hostname: SUPABASE_URL,
      path: /rest/v1/profiles?id=eq.\,
      method: 'PATCH',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': Bearer \,
        'Content-Type': 'application/json',
        'Content-Length': body.length
      }
    };
    const req = https.request(opts, (res) => {
      res.on('data', () => {});
      res.on('end', () => { console.log(   ✅); resolve(true); });
    });
    req.on('error', () => { console.log(   ❌); resolve(false); });
    req.write(body);
    req.end();
  });
}

async function addDetails() {
  console.log('\n🚀 Adding details to female profiles...\n');
  const ids = await getFemaleIds();
  for (let i = 0; i < ids.length; i++) {
    const age = randomAge(18, 42);
    const name = names[i % names.length];
    console.log(\. \ (\y)...);
    await updateProfile(ids[i], { full_name: name, age: age, profession: randomItem(professions), city: randomItem(cities), about_me: আমি একজন \। পরিবার আমার কাছে গুরুত্বপূর্ণ। });
    await new Promise(r => setTimeout(r, 100));
  }
  console.log(\n🎉 Done!\n);
}

addDetails();
