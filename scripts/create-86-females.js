const https = require('https');

const SUPABASE_URL = 'bwxxctyakpexqfbtoolg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4';

const names = ['Fatima', 'Rashida', 'Nasrin', 'Yasmin', 'Hafiza', 'Zainab', 'Salma', 'Aisha', 'Priya', 'Anjali'];
const profs = ['Software Engineer', 'Doctor', 'Teacher', 'Banker', 'Housewife'];
const cities = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna'];

function randomItem(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randomAge(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }

async function create() {
  console.log('\n Creating 86 new female profiles...\n');
  
  for (let i = 1; i <= 86; i++) {
    const data = {
      full_name: names[(i-1) % names.length] + ' ' + i,
      age: randomAge(18, 42),
      gender: 'Female',
      profession: randomItem(profs),
      city: randomItem(cities),
      about_me: 'Professional woman seeking life partner',
      hobbies: 'Reading, Cooking',
      photo_url: 'https://bwxxctyakpexqfbtoolg.supabase.co/storage/v1/object/public/profile-photos/female_batch2_' + i + '.jpg',
      looking_for: 'Groom'
    };
    
    const body = JSON.stringify(data);
    const opts = {
      hostname: SUPABASE_URL,
      path: '/rest/v1/profiles',
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': 'Bearer ' + ANON_KEY,
        'Content-Type': 'application/json',
        'Content-Length': body.length
      }
    };
    
    const req = https.request(opts, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        if (i % 20 === 0) console.log(i + '. Created OK');
      });
    });
    
    req.write(body);
    req.end();
    await new Promise(r => setTimeout(r, 50));
  }
  
  console.log('\n Done!\n');
}

create();
