const https = require('https');

const SUPABASE_URL = 'bwxxctyakpexqfbtoolg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4';

const muslimNames = ['Fatima Khan', 'Rashida Begum', 'Nasrin Ahmed', 'Yasmin Akter', 'Hafiza Begum', 'Zainab Khan', 'Salma Begum', 'Aisha Khan', 'Noor Fatima', 'Saida Akter', 'Mariam Begum', 'Hina Khan', 'Sana Ahmed', 'Uzma Akter', 'Amina Khan', 'Bilkis Begum', 'Chhoti Akter', 'Dipa Khan', 'Erina Ahmed', 'Farida Begum'];

const hinduNames = ['Priya Sharma', 'Anjali Devi', 'Deepti Patel', 'Kavya Singh', 'Pooja Verma', 'Divya Sinha', 'Neha Gupta', 'Isha Malhotra', 'Rani Sharma', 'Sunita Verma', 'Ritu Patel', 'Meena Singh', 'Nisha Verma', 'Pallavi Sharma', 'Aadhya Gupta'];

const cities = ['Dhaka', 'Chittagong', 'Sylhet', 'Rajshahi', 'Khulna', 'Barisal', 'Rangpur', 'Gazipur', 'Comilla', 'Cox\'s Bazar'];
const professions = ['Software Engineer', 'Doctor', 'Teacher', 'Banker', 'Accountant', 'Nurse', 'HR Manager', 'Marketing Manager', 'Designer', 'Housewife', 'Business Owner', 'Architect'];
const educations = ['SSC', 'HSC', "Bachelor's", "Master's"];
const personalities = ['Ambitious Career Woman', 'Traditional Homemaker', 'Modern Professional', 'Creative & Artistic', 'Balanced'];

const moviesInterests = ['Dangal, Raees, Article 15', 'Pink, Queen, Kahani', 'Ek Je Chhilo Raja, Memories In March', 'ADHM, Badhaai Ho', 'Taare Zameen Par, Natarang'];
const musicInterests = ['Arijit Singh, AR Rahman', 'Lata Mangeshkar, Kishore Kumar', 'Shreya Ghosyal, Pritam', 'Indie, Jazz', 'Bollywood Pop'];
const hobbyOptions = ['Reading, Cooking', 'Traveling, Photography', 'Gym, Yoga', 'Gardening, Embroidery', 'Music, Art', 'Writing, Social Work', 'Cooking, Baking', 'Dance, Theater'];

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
  const profession = randomItem(professions);
  const personality = randomItem(personalities);
  
  let maritalStatus = 'Never Married';
  let hasChild = 0;
  
  if (age > 26 && Math.random() > 0.7) {
    maritalStatus = 'Divorced';
    hasChild = Math.random() > 0.5 ? 1 : 0;
  }
  
  const income = profession === 'Housewife' ? 0 : Math.floor(Math.random() * 150000) + 30000;
  const height = ['5\'2"', '5\'3"', '5\'4"', '5\'5"', '5\'6"'][Math.floor(Math.random() * 5)];
  
  let aboutMe = '';
  
  if (profession === 'Housewife') {
    aboutMe = `আমি একজন গৃহিণী এবং ঘর দেখাশোনায় দক্ষ। আমার পরিবার আমার সবকিছু। একজন সম্মানিত এবং পরিবার-প্রেমী স্বামী খুঁজছি। আমি ভালো রান্না করি এবং ঘর পরিচালনায় অভিজ্ঞ।`;
  } else if (profession === 'Doctor') {
    aboutMe = `আমি একজন ডাক্তার এবং মানুষের সেবায় নিয়োজিত। পেশা এবং পরিবার দুটোই আমার কাছে গুরুত্বপূর্ণ। একজন বুদ্ধিমান এবং সহযোগী পার্টনার খুঁজছি যিনি আমার স্বপ্নকে সমর্থন করবেন।`;
  } else if (profession === 'Teacher') {
    aboutMe = `আমি শিক্ষক এবং শিক্ষায় বিশ্বাসী। শিক্ষার্থীদের প্রতি আমার দায়িত্ববোধ গভীর। পরিবারের জন্য একজন সচেতন এবং দায়িত্বশীল স্বামী খুঁজছি যিনি জীবনের মূল্যবোধ বোঝেন।`;
  } else if (profession === 'Software Engineer') {
    aboutMe = `আমি সফটওয়্যার ইঞ্জিনিয়ার এবং প্রযুক্তি প্রেমী। ক্যারিয়ার এবং পরিবার উভয়ই গুরুত্বপূর্ণ। একজন বুদ্ধিমান, উচ্চাভিলাষী কিন্তু পরিবার-কেন্দ্রিক পার্টনার খুঁজছি।`;
  } else {
    aboutMe = `আমি একজন ${profession} এবং আমার কাজকে গুরুত্ব সহকারে নিই। পরিবার এবং ক্যারিয়ার দুটোই আমার জীবনের অংশ। একজন সমঝদার এবং সহায়ক স্বামী খুঁজছি।`;
  }
  
  if (maritalStatus === 'Divorced') {
    aboutMe += ` আমার প্রথম বিবাহ সফল হয়নি কিন্তু আমি আশাবাদী।${hasChild ? ' আমার একটি সন্তান আছে।' : ''}`;
  }
  
  const wearHijab = isMuslim && Math.random() > 0.6 ? 'Yes' : 'No';
  const prayerHabit = isMuslim ? (Math.random() > 0.4 ? 'Daily' : 'Sometimes') : 'No';
  
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
    about_me: aboutMe,
    hobbies: randomItem(hobbyOptions),
    interests: randomItem(moviesInterests) + ' | ' + randomItem(musicInterests),
    personality_type: personality,
    smoking: Math.random() > 0.95 ? 'Yes' : 'No',
    drinking: Math.random() > 0.85 ? 'Occasional' : 'No',
    has_children: hasChild,
    wears_hijab: wearHijab,
    prayer_habit: prayerHabit,
    looking_for: 'Groom',
    profile_completion: Math.floor(Math.random() * 40) + 60
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
      res.on('end', () => resolve(res.statusCode === 204 || res.statusCode === 200));
    });

    req.on('error', () => resolve(false));
    req.write(body);
    req.end();
  });
}

async function generateAllProfiles() {
  console.log('\n🚀 Generating detailed profiles for 86 females...\n');
  
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
      console.log(`   ✅ Profile complete`);
    } else {
      console.log(`   ❌ Update failed`);
    }
    
    await new Promise(r => setTimeout(r, 100));
  }
  
  console.log(`\n🎉 Generated ${updated} detailed profiles!\n`);
}

generateAllProfiles();