const https = require('https');

const SUPABASE_URL = 'bwxxctyakpexqfbtoolg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4';
const STORAGE_BASE = 'https://bwxxctyakpexqfbtoolg.supabase.co/storage/v1/object/public/profile-photos';

const muslimNames = [
  'Mohammad Hasan','Abdul Karim','Md. Rafiqul Islam','Shakil Ahmed','Tariqul Islam',
  'Imran Hossain','Mahbubur Rahman','Asif Iqbal','Raihan Ahmed','Sabbir Hossain',
  'Nafis Ahmed','Tanvir Hossain','Shahriar Islam','Ariful Islam','Rezaul Karim',
  'Faisal Ahmed','Jahidul Islam','Minhajul Abedin','Kamruzzaman','Sohel Rana',
  'Mehedi Hasan','Rakibul Hasan','Shafiqul Islam','Aminul Islam','Rubel Hossain',
  'Zahirul Islam','Kamal Hossain','Farhan Ahmed','Mushfiqur Rahman','Nabil Ahmed',
  'Sajid Hossain','Wasif Ahmed','Emran Hossain','Rifat Hossain','Saikat Ahmed',
  'Mizan Rahman','Lutfur Rahman','Hasibul Hasan','Taufiqul Islam','Shamsul Alam'
];

const hinduNames = [
  'Rajib Das','Sourav Roy','Arpan Saha','Niloy Ghosh','Biplab Das',
  'Debashish Roy','Pritam Mondal','Suman Dey','Raju Paul','Sumon Biswas',
  'Arnab Das','Partha Sarkar','Tapas Roy','Anik Datta','Subrata Ghosh'
];

const christianNames = [
  'Joseph Rozario','David Costa','Peter Gomes','John Baroi','Stephen Halder'
];

const districts = [
  'Dhaka','Chittagong','Sylhet','Rajshahi','Khulna','Comilla','Mymensingh',
  'Jessore','Barisal','Rangpur','Narayanganj','Gazipur','Bogra','Dinajpur',
  'Tangail','Faridpur','Noakhali','Brahmanbaria','Kishoreganj','Netrokona'
];

const cities = {
  'Dhaka': ['Dhaka','Mirpur','Uttara','Dhanmondi','Mohammadpur','Gulshan','Banani','Rampura'],
  'Chittagong': ['Chittagong','Agrabad','Halishahar','Pahartali','Patenga'],
  'Sylhet': ['Sylhet','Beanibazar','Golapganj','Zakiganj'],
  'Rajshahi': ['Rajshahi','Boalia','Motihar','Shaheb Bazar'],
  'Khulna': ['Khulna','Sonadanga','Boyra','Daulatpur'],
  'Comilla': ['Comilla','Chandina','Debidwar'],
  'Mymensingh': ['Mymensingh','Trishal','Muktagacha'],
  'Jessore': ['Jessore','Benapole','Jhikargachha'],
  'Barisal': ['Barisal','Bakerganj','Gournadi'],
  'Rangpur': ['Rangpur','Saidpur','Dinajpur'],
  'Narayanganj': ['Narayanganj','Fatullah','Rupganj'],
  'Gazipur': ['Gazipur','Tongi','Joydebpur'],
  'Bogra': ['Bogra','Sherpur','Gabtali'],
  'Dinajpur': ['Dinajpur','Birampur','Parbatipur'],
  'Tangail': ['Tangail','Mirzapur','Kalihati'],
  'Faridpur': ['Faridpur','Bhanga','Sadarpur'],
  'Noakhali': ['Noakhali','Feni','Lakshmipur'],
  'Brahmanbaria': ['Brahmanbaria','Akhaura','Nabinagar'],
  'Kishoreganj': ['Kishoreganj','Bajitpur','Kuliarchar'],
  'Netrokona': ['Netrokona','Durgapur','Mohanganj']
};

// Male education profiles — age appropriate
const educationProfiles = [
  { education: 'SSC', minAge: 17, professions: ['Small Business','Garments Worker','Driver','Shop Owner','Farmer'], incomeRange: [5000, 20000], degrees: ['SSC'] },
  { education: 'HSC', minAge: 19, professions: ['Small Business','Shop Assistant','Salesman','Private Job'], incomeRange: [8000, 25000], degrees: ['HSC'] },
  { education: "Bachelor's", minAge: 22, professions: ['School Teacher','Bank Officer','Government Officer','NGO Worker','Private Job','Business'], incomeRange: [20000, 80000], degrees: ['BA','BSc','BBA','BCom'] },
  { education: "Master's", minAge: 24, professions: ['Government Official','Senior Bank Officer','University Lecturer','Business','NGO Manager'], incomeRange: [40000, 200000], degrees: ['MA','MSc','MBA','MCom'] },
  { education: 'Medical', minAge: 26, professions: ['Doctor','Medical Officer','Physician'], incomeRange: [80000, 400000], degrees: ['MBBS','BDS'] },
  { education: 'Engineering', minAge: 24, professions: ['Engineer','Software Developer','IT Professional','Project Manager'], incomeRange: [60000, 500000], degrees: ['BSc Engineering','CSE','EEE','Civil Engineering'] },
  { education: 'Law', minAge: 25, professions: ['Lawyer','Legal Advisor','Court Official','Business'], incomeRange: [50000, 300000], degrees: ['LLB','LLM'] }
];

const personalities = {
  'SSC': ['Traditional','Family-Oriented'],
  'HSC': ['Traditional','Balanced','Family-Oriented'],
  "Bachelor's": ['Ambitious','Balanced','Creative'],
  "Master's": ['Ambitious','Intellectual'],
  'Medical': ['Ambitious','Intellectual','Balanced'],
  'Engineering': ['Ambitious','Analytical'],
  'Law': ['Ambitious','Intellectual']
};

const hobbiesByPersonality = {
  'Traditional': ['Cricket','Fishing','Reading Islamic books','Quran recitation','Gardening'],
  'Family-Oriented': ['Cricket','Cooking for family','Watching TV','Gardening','Reading'],
  'Balanced': ['Cricket','Traveling','Reading','Gym','Photography'],
  'Ambitious': ['Reading','Career development','Gym','Networking','Technology'],
  'Creative': ['Photography','Music','Writing','Painting','Traveling'],
  'Intellectual': ['Reading','Research','Chess','Debating','Learning languages'],
  'Analytical': ['Programming','Chess','Mathematics','Technology','Gaming']
};

const fatherProfessions = {
  'SSC': ['Farmer','Rickshaw puller','Small trader','Day laborer'],
  'HSC': ['Small business owner','Farmer','Lower govt officer','Shop owner'],
  "Bachelor's": ['Govt officer','Teacher','Business owner','NGO worker'],
  "Master's": ['Senior govt officer','Professor','Doctor','Businessman'],
  'Medical': ['Doctor','Professor','Senior govt officer','Businessman'],
  'Engineering': ['Engineer','Businessman','Senior officer','Professor'],
  'Law': ['Lawyer','Judge','Govt officer','Businessman']
};

function getSiblings(religiousLevel, district) {
  const rural = ['Comilla','Mymensingh','Jessore','Barisal','Rangpur','Bogra','Dinajpur','Tangail','Faridpur','Noakhali','Brahmanbaria','Kishoreganj','Netrokona','Narayanganj'];
  const isRural = rural.includes(district);
  if (religiousLevel === 'Very Religious') return Math.floor(Math.random() * 4) + 3;
  if (religiousLevel === 'Religious') return isRural ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 2) + 1;
  return Math.floor(Math.random() * 2) + 1;
}

// Male prayer habits — Friday prayer IS for men
function getPrayers(religiousLevel) {
  if (religiousLevel === 'Very Religious') return 'Five times daily';
  if (religiousLevel === 'Religious') return 'Regularly';
  if (religiousLevel === 'Moderate') return 'Friday and special occasions';
  return 'Occasionally';
}

function getHinduPrayers(religiousLevel) {
  if (religiousLevel === 'Very Religious' || religiousLevel === 'Religious') return 'Daily puja';
  return 'On festivals';
}

// Religious beard — only for Muslim Very Religious or Religious men
function getBeard(religiousLevel, religion) {
  if (religion !== 'Islam') return false;
  if (religiousLevel === 'Very Religious') return true;
  if (religiousLevel === 'Religious') return Math.random() < 0.5;
  return false; // Modern/style beard not tracked
}

function roundTo5000(n) {
  if (!n || n === 0) return 0;
  return Math.round(n / 5000) * 5000;
}

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randBool(prob) { return Math.random() < prob; }

function generateAboutMe(profile) {
  const { full_name, profession, religion, personality_type, religiousLevel, hobbies } = profile;
  const firstName = full_name.split(' ').pop();

  const intros = {
    'Traditional': [`আমি একজন সহজ-সরল মানুষ। পরিবার ও ধর্মকে সবচেয়ে বেশি গুরুত্ব দিই।`],
    'Ambitious': [`আমি ${profession} হিসেবে কর্মরত এবং ক্যারিয়ার নিয়ে সচেতন। একটি সুখী সংসার গড়াই আমার লক্ষ্য।`],
    'Balanced': [`পরিবার ও ক্যারিয়ার — দুটোকেই সমান গুরুত্ব দিই। সৎ ও পরিশ্রমী হওয়াটাই আমার পরিচয়।`],
    'Intellectual': [`জ্ঞান অর্জনে আগ্রহী। ${profession} হিসেবে কাজের পাশাপাশি পড়াশোনা করতে ভালোবাসি।`],
    'Creative': [`সৃজনশীল কাজে আগ্রহী। ${hobbies ? hobbies.split(',')[0] : 'ফটোগ্রাফি'} আমার শখ।`],
    'Family-Oriented': [`পরিবারই আমার সবকিছু। মা-বাবার আদর্শে বড় হয়েছি এবং সেই আদর্শ মেনে চলি।`],
    'Analytical': [`প্রযুক্তি ও সমস্যা সমাধানে আগ্রহী। যুক্তিভিত্তিক চিন্তাভাবনায় বিশ্বাসী।`]
  };

  const religionLine = religion === 'Islam'
    ? (religiousLevel === 'Very Religious' ? ' আলহামদুলিল্লাহ, দ্বীনকে জীবনের কেন্দ্রে রাখি।' : ' ইসলামী মূল্যবোধে বিশ্বাসী।')
    : religion === 'Hinduism' ? ' হিন্দু ধর্মীয় মূল্যবোধে বিশ্বাসী।'
    : ' ধর্মীয় মূল্যবোধকে সম্মান করি।';

  const introOptions = intros[personality_type] || intros['Balanced'];
  return rand(introOptions) + religionLine;
}

function generatePartnerPreference(profile) {
  const { religion, religiousLevel, age } = profile;
  // Males want younger women — age range is her age should be 2-8 years younger
  const minAge = Math.max(18, age - 10);
  const maxAge = age - 1;

  if (religion === 'Hinduism') {
    return `আমি এমন একজন জীবনসঙ্গিনী চাই যিনি সৎ, পরিশ্রমী এবং পারিবারিক মূল্যবোধসম্পন্ন হবেন। হিন্দু ধর্মীয় রীতিনীতিকে সম্মান করেন এমন পাত্রী পছন্দ করব। বয়স ${minAge}-${maxAge} বছরের মধ্যে হলে ভালো হয়।`;
  } else if (religion === 'Christianity') {
    return `আমি এমন একজন জীবনসঙ্গিনী চাই যিনি সৎ, দায়িত্বশীল এবং পারিবারিক। খ্রিস্টান মূল্যবোধে বিশ্বাসী পাত্রী পছন্দ করব। বয়স ${minAge}-${maxAge} বছরের মধ্যে হলে ভালো হয়।`;
  } else {
    const religiousExpect = religiousLevel === 'Very Religious' ? 'দ্বীনদারি ও পর্দাশীল' : religiousLevel === 'Religious' ? 'ধার্মিক ও নামাজি' : 'ধর্মীয় মূল্যবোধসম্পন্ন';
    return `আমি এমন একজন জীবনসঙ্গিনী চাই যিনি ${religiousExpect} হবেন। সৎ, পরিশ্রমী এবং পারিবারিক মূল্যবোধসম্পন্ন পাত্রী পছন্দ করব। বয়স ${minAge}-${maxAge} বছরের মধ্যে হলে ভালো হয়। মা-বাবাকে সম্মান করেন এমন মেয়েই আমার আদর্শ।`;
  }
}

function generateProfile(index) {
  // Religion: 70% Muslim, 25% Hindu, 5% Christian
  const religionRoll = Math.random();
  let religion, full_name, sect = null;

  if (religionRoll < 0.70) {
    religion = 'Islam';
    const base = rand(muslimNames);
    const suffix = Math.random() < 0.3 ? ' ' + rand(['Chowdhury','Khan','Miah','Sheikh','Talukder']) : '';
    full_name = base + suffix;
    sect = 'Sunni';
  } else if (religionRoll < 0.95) {
    religion = 'Hinduism';
    full_name = rand(hinduNames);
    sect = null;
  } else {
    religion = 'Christianity';
    full_name = rand(christianNames);
    sect = 'Catholic';
  }

  // Age — males typically marry older than females
  const age = randInt(22, 42);

  // Marital status
  let marital_status = 'Never Married';
  let has_children = false;
  let number_of_children = 0;
  if (age >= 28) {
    const roll = Math.random();
    if (roll < 0.15) {
      marital_status = 'Divorced';
      has_children = Math.random() < 0.3;
      if (has_children) number_of_children = randInt(1, 2);
    } else if (roll < 0.18) {
      marital_status = 'Widowed';
      has_children = Math.random() < 0.4;
      if (has_children) number_of_children = randInt(1, 2);
    }
  }

  // District & city
  const district = rand(districts);
  const cityOptions = cities[district] || [district];
  const city = rand(cityOptions);

  // Education — age appropriate
  const availableEdu = educationProfiles.filter(e => age >= e.minAge);
  let eduProfile;
  const eduRoll = Math.random();
  if (availableEdu.length === 1) {
    eduProfile = availableEdu[0];
  } else if (eduRoll < 0.08) eduProfile = availableEdu.find(e => e.education === 'SSC') || availableEdu[0];
  else if (eduRoll < 0.20) eduProfile = availableEdu.find(e => e.education === 'HSC') || availableEdu[0];
  else if (eduRoll < 0.55) eduProfile = availableEdu.find(e => e.education === "Bachelor's") || availableEdu[0];
  else if (eduRoll < 0.72) eduProfile = availableEdu.find(e => e.education === "Master's") || availableEdu[availableEdu.length-1];
  else if (eduRoll < 0.82) eduProfile = availableEdu.find(e => e.education === 'Engineering') || availableEdu[availableEdu.length-1];
  else if (eduRoll < 0.90) eduProfile = availableEdu.find(e => e.education === 'Medical') || availableEdu[availableEdu.length-1];
  else eduProfile = availableEdu.find(e => e.education === 'Law') || availableEdu[availableEdu.length-1];

  if (!eduProfile) eduProfile = availableEdu[0];

  const education = eduProfile.education;
  const profession = rand(eduProfile.professions);
  const degree = rand(eduProfile.degrees);
  const rawIncome = profession === 'Housewife' ? 0 : randInt(eduProfile.incomeRange[0], eduProfile.incomeRange[1]);
  const income = roundTo5000(rawIncome);

  // Personality
  const personalityOptions = personalities[education] || ['Balanced'];
  const personality_type = rand(personalityOptions);

  // Religious level
  let religiousLevel;
  if (religion === 'Islam') {
    const r = Math.random();
    if (['Comilla','Noakhali','Brahmanbaria'].includes(district)) {
      religiousLevel = r < 0.40 ? 'Very Religious' : r < 0.75 ? 'Religious' : 'Moderate';
    } else if (['Dhaka','Chittagong'].includes(district)) {
      religiousLevel = r < 0.15 ? 'Very Religious' : r < 0.50 ? 'Religious' : 'Moderate';
    } else {
      religiousLevel = r < 0.30 ? 'Very Religious' : r < 0.65 ? 'Religious' : 'Moderate';
    }
    if (personality_type === 'Modern' && religiousLevel === 'Very Religious') religiousLevel = 'Moderate';
  } else {
    religiousLevel = rand(['Moderate','Religious','Liberal']);
  }

  // Prayer — males CAN pray Friday
  const prayer_habit = religion === 'Islam' ? getPrayers(religiousLevel)
    : religion === 'Hinduism' ? getHinduPrayers(religiousLevel)
    : 'On special occasions';

  // Beard — religious beard only
  const has_beard = getBeard(religiousLevel, religion);

  // Siblings
  const total_siblings = getSiblings(religiousLevel, district);
  const married_brothers = randInt(0, Math.floor(total_siblings / 2));
  const married_sisters = randInt(0, Math.floor(total_siblings / 2));

  // Father profession
  const father_profession = rand(fatherProfessions[education] || fatherProfessions["Bachelor's"]);
  const mother_profession = rand(['Housewife','School Teacher','NGO Worker']);

  // Hobbies
  const hobbyPool = hobbiesByPersonality[personality_type] || hobbiesByPersonality['Balanced'];
  const hobbies = [...hobbyPool].sort(() => 0.5 - Math.random()).slice(0, randInt(2, 4)).join(', ');
  const interests = ['Cricket','Technology','Travel','Music','Reading','Fitness','Photography','Current Affairs'].sort(() => 0.5 - Math.random()).slice(0, 3).join(', ');

  // NRB: 8% for males (slightly higher — more men work abroad)
  const nrb = Math.random() < 0.08;
  const nrb_country = nrb ? rand(['Saudi Arabia','UAE','Qatar','UK','USA','Canada','Malaysia','Kuwait']) : null;

  // Height — realistic Bangladeshi male range 5'2" to 5'10"
  const heightFeet = Math.random() < 0.15 ? 5 : 5;
  const heightInches = randInt(2, 10);
  const height = `${heightFeet}'${heightInches}"`;

  const weight = randInt(55, 85);
  const blood_group = rand(['A+','A-','B+','B-','O+','O-','AB+','AB-']);
  const complexion = rand(['Fair','Wheatish','Wheatish Brown','Brown']);
  const body_type = rand(['Slim','Average','Athletic']);

  // Family
  const family_type = ['Dhaka','Chittagong'].includes(district)
    ? rand(['Nuclear','Nuclear','Joint'])
    : rand(['Joint','Joint','Nuclear']);

  let family_values;
  if (religiousLevel === 'Very Religious') family_values = 'Very Conservative';
  else if (religiousLevel === 'Religious') family_values = 'Conservative';
  else family_values = rand(['Moderate','Liberal']);

  const family_status = income > 150000 ? rand(['Upper Middle Class','Rich'])
    : income > 50000 ? rand(['Middle Class','Upper Middle Class'])
    : rand(['Lower Middle Class','Middle Class']);

  // Male expected age — wants younger wife
  const expected_age_min = Math.max(18, age - 10);
  const expected_age_max = Math.max(age - 1, 20);

  // Diet
  const diet = religion === 'Islam' ? 'Halal'
    : religion === 'Hinduism' ? rand(['Vegetarian','Non-Vegetarian'])
    : 'Non-Vegetarian';

  const expected_income = 0; // Males don't usually specify wife's income requirement

  // Photo URL
  const files = require('fs').readdirSync('C:\\Users\\tehsi\\Desktop\\biyekori\\Male Batch 3');
  const photoFile = files[index - 1] || `male_batch3_${index}.png`;
  const photo_url = `${STORAGE_BASE}/${photoFile}`;

  const profileData = {
    full_name,
    gender: 'male',
    age,
    religion,
    sect,
    education,
    degree,
    profession,
    city,
    district,
    country: nrb ? nrb_country : 'Bangladesh',
    nrb,
    nrb_country,
    marital_status,
    has_children,
    number_of_children,
    height,
    weight,
    blood_group,
    complexion,
    body_type,
    monthly_income: income,
    father_profession,
    mother_profession,
    father_alive: randBool(0.80),
    mother_alive: randBool(0.88),
    total_siblings,
    married_brothers,
    married_sisters,
    family_type,
    family_status,
    family_values,
    religious_level: religiousLevel,
    prayer_habit,
    wears_hijab: false,
    has_beard,
    smoking: randBool(0.15),
    drinking: false,
    personality_type,
    hobbies,
    interests,
    health_status: 'Good',
    willing_to_relocate: nrb || randBool(0.4),
    photo_url,
    is_verified: randBool(0.25),
    is_premium: randBool(0.1),
    package: 'prottasha',
    profile_completion: randInt(45, 85),
    looking_for: 'bride',
    expected_age_min,
    expected_age_max,
    expected_education: education === 'SSC' ? 'HSC' : education === 'HSC' ? "Bachelor's" : education,
    expected_profession: 'Any',
    expected_income,
    expected_religious_level: religiousLevel === 'Very Religious' ? 'Very Religious' : religiousLevel === 'Religious' ? 'Religious' : 'Moderate',
    expected_family_type: family_type,
    diet,
    wears_glasses: randBool(0.15),
    has_disability: false,
    email: `male_b3_${Date.now()}_${index}@biyekori.com`,
    password: '$2b$10$defaulthashedpassword123456789012',
    phone_verified: true,
  };

  profileData.about_me = generateAboutMe({ ...profileData, religiousLevel });
  profileData.partner_preference = generatePartnerPreference({ ...profileData, religiousLevel });

  return profileData;
}

function insertProfile(profileData) {
  return new Promise((resolve) => {
    const body = JSON.stringify(profileData);
    const opts = {
      hostname: SUPABASE_URL,
      path: '/rest/v1/profiles',
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(body),
        'Prefer': 'return=minimal'
      }
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ status: res.statusCode, data }));
    });
    req.on('error', (e) => resolve({ status: 0, data: e.message }));
    req.write(body);
    req.end();
  });
}

async function main() {
  console.log('\n🚀 Creating 63 realistic male profiles...\n');
  let success = 0, failed = 0;

  for (let i = 1; i <= 63; i++) {
    const profile = generateProfile(i);
    const result = await insertProfile(profile);

    if (result.status === 201) {
      success++;
      if (i % 10 === 0) console.log(`✅ ${i}/63 — ${profile.full_name} | ${profile.city} | ${profile.education} | Age ${profile.age}`);
    } else {
      failed++;
      console.log(`❌ ${i} FAILED (${result.status}): ${result.data.substring(0, 120)}`);
    }

    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`\n🎉 DONE!`);
  console.log(`✅ Success: ${success} | ❌ Failed: ${failed}`);
  console.log(`📊 Total males should now be: 71 + ${success} = ${71 + success}`);
  console.log(`📊 Grand total: 507 + ${success} = ${507 + success} profiles`);
}

main();
