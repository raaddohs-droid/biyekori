const https = require('https');
const fs = require('fs');

const SUPABASE_URL = 'bwxxctyakpexqfbtoolg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4';

const muslimNames = ['Fatima Khan', 'Rashida Begum', 'Nasrin Ahmed', 'Yasmin Akter', 'Hafiza Begum', 'Zainab Khan', 'Salma Begum', 'Aisha Khan', 'Noor Fatima', 'Saida Akter', 'Mariam Begum', 'Hina Khan', 'Sana Ahmed', 'Uzma Akter', 'Amina Khan'];
const hinduNames = ['Priya Sharma', 'Anjali Devi', 'Deepti Patel', 'Kavya Singh', 'Pooja Verma', 'Divya Sinha', 'Neha Gupta', 'Isha Malhotra', 'Rani Sharma', 'Sunita Verma'];

const cities = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Gazipur', 'Comilla', 'Cox\'s Bazar'];
const professions = ['Software Engineer', 'Doctor', 'Teacher', 'Banker', 'Accountant', 'Nurse', 'HR Manager', 'Marketing Manager', 'Designer', 'Housewife', 'Business Owner', 'Architect'];
const educations = ['SSC', 'HSC', "Bachelor's", "Master's", 'MBA'];

const moviesBollywood = ['Dangal', 'Raees', 'Article 15', 'Badhaai Ho', 'Pink', 'Queen', 'Kahani'];
const moviesTraditional = ['Ek Je Chhilo Raja', 'Memories In March'];
const musicArtists = ['Arijit Singh', 'AR Rahman', 'Lata Mangeshkar', 'Shreya Ghosyal', 'Kishore Kumar', 'Ed Sheeran'];

const hobbies = ['Reading', 'Cooking', 'Traveling', 'Gym', 'Gardening', 'Music', 'Photography', 'Yoga'];

function randomItem(arr) {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomAge(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateProfile(age) {
  const isMuslim = Math.random() > 0.25;
  const name = isMuslim ? randomItem(muslimNames) : randomItem(hinduNames);
  const city = randomItem(cities);
  const education = randomItem(educations);
  
  let profession = randomItem(professions);
  let maritalStatus = 'Never Married';
  let hasChild = false;
  
  if (age > 26 && Math.random() > 0.7) {
    maritalStatus = 'Divorced';
    hasChild = Math.random() > 0.5;
  }
  
  const income = Math.floor(Math.random() * 150000) + 30000;
  const height = ['5\'2"', '5\'3"', '5\'4"', '5\'5"', '5\'6"'][Math.floor(Math.random() * 5)];
  
  let bio = '';
  
  if (profession === 'Housewife') {
    bio = `আমি একজন গৃহিণী। ঘর দেখাশোনা এবং রান্নায় আমি খুবই দক্ষ। আমার পরিবার আমার কাছে সবচেয়ে গুরুত্বপূর্ণ। একজন সম্মানিত এবং পরিবার-প্রেমী স্বামী খুঁজছি।`;
  } else {
    bio = `আমি একজন ${profession}। আমি আমার ক্যারিয়ার নিয়ে গুরুত্বসহকারে। পরিবার এবং কর্মজীবন দুটোই আমার কাছে গুরুত্বপূর্ণ।`;
  }
  
  if (maritalStatus === 'Divorced') {
    bio += ` আমার প্রথম বিবাহ সফল হয়নি।${hasChild ? ' আমার একটি সন্তান আছে।' : ''}`;
  }
  
  const movies = [randomItem(moviesBollywood), randomItem(moviesBollywood), randomItem(moviesBollywood)];
  const music = [randomItem(musicArtists), randomItem(musicArtists)];
  const userHobbies = [randomItem(hobbies), randomItem(hobbies)];
  
  return {
    full_name: name,
    age: age,
    height: height,
    city: city,
    education: education,
    profession: profession,
    religion: isMuslim ? 'Islam' : 'Hindu',
    marital_status: maritalStatus,
    monthly_income: income,
    bio: bio,
    favorite_movies: movies.join(', '),
    favorite_music: music.join(', '),
    hobbies: userHobbies.join(', '),
    smoking: Math.random() > 0.95 ? 'Yes' : 'No',
    drinking: Math.random() > 0.85 ? 'Occasional' : 'No',
    has_children: hasChild ? 1 : 0,
    looking_for: 'Groom'
  };
}

async function getFemaleIds() {
  return new Promise((resolve) => {
    const opts = {
      hostname: SUPABASE_URL,
      path: `/rest/v1/profiles?select=id&gender=eq.Female&order=id.asc&limit=86`,
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
          const profiles = JSON.parse(data);
          resolve(profiles.map(p => p.id));
        } catch {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

async function updateProfile(id, profileData) {
  return new Promise((resolve) => {
    const body = JSON.stringify(profileData);
    
    const opts = {
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

    const req = https.request(opts, (res) => {
      res.on('data', () => {});
      res.on('end', () => {
        resolve(res.statusCode === 204 || res.statusCode === 200);
      });
    });

    req.on('error', () => resolve(false));
    req.write(body);
    req.end();
  });
}

async function generateAllProfiles() {
  console.log('\n🚀 Generating profiles for 86 females...\n');
  
  const femaleIds = await getFemaleIds();
  console.log(`📊 Found ${femaleIds.length} females\n`);
  
  let updated = 0;
  
  for (let i = 0; i < femaleIds.length; i++) {
    const id = femaleIds[i];
    const age = randomAge(18, 42);
    const profile = generateProfile(age);
    
    console.log(`${i+1}. ${profile.full_name} (${age}y, ${profile.profession})...`);
    
    const success = await updateProfile(id, profile);
    
    if (success) {
      updated++;
      console.log(`   ✅ Done`);
    } else {
      console.log(`   ❌ Failed`);
    }
    
    await new Promise(r => setTimeout(r, 150));
  }
  
  console.log(`\n🎉 Generated ${updated} profiles!\n`);
}

generateAllProfiles();