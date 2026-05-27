const https = require('https');

const SUPABASE_URL = 'bwxxctyakpexqfbtoolg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4';
const STORAGE_BASE = 'https://bwxxctyakpexqfbtoolg.supabase.co/storage/v1/object/public/profile-photos';

const muslimNames = [
  'Nusrat Jahan','Fatema Akter','Sharmin Sultana','Sadia Islam','Taslima Begum',
  'Ruksana Khanam','Halima Khatun','Nasreen Akter','Rubina Yasmin','Shirin Akter',
  'Monira Begum','Farida Hossain','Sumaiya Rahman','Tania Sultana','Momena Khatun',
  'Rahela Akter','Afroza Begum','Sabrina Islam','Munira Akter','Nadia Hossain',
  'Farhana Begum','Shanta Akter','Layla Rahman','Parveen Sultana','Meherun Nessa',
  'Bilkis Begum','Rehana Khatun','Maksuda Akter','Kohinur Begum','Jannat Ara',
  'Asma Akter','Shamima Begum','Morsheda Khatun','Rania Islam','Zakia Sultana',
  'Tamanna Akter','Sanjida Islam','Maliha Hossain','Nipa Akter','Afsana Begum',
  'Tasnia Rahman','Bristy Akter','Lamia Hossain','Sabiha Akter','Rifat Ara',
  'Shumi Begum','Mitu Akter','Sumona Khatun','Rimi Sultana','Shahana Begum',
  'Jesmin Akter','Rokeya Begum','Dilruba Akter','Marium Khatun','Sathi Akter',
  'Nazmun Nahar','Salma Begum','Hasina Akter','Rosy Akter','Poly Begum'
];

const hinduNames = [
  'Priya Das','Mitu Saha','Rina Dey','Puja Chakraborty','Anita Roy',
  'Sunita Biswas','Kajol Mondal','Rupa Ghosh','Lata Sarkar','Mita Paul',
  'Deepa Datta','Shilpa Roy','Trishna Das','Ankita Saha','Moumita Biswas',
  'Suchitra Dey','Barnali Roy','Papiya Chakraborty','Susmita Paul','Rimi Sarkar',
  'Chandana Das','Piyali Ghosh','Mithu Mondal','Soma Roy','Reba Datta',
  'Lipika Sen','Mousumi Bose','Tanushree Roy','Kabita Das','Suparna Ghosh'
];

const christianNames = [
  'Mary Rozario','Angela Costa','Rita Gomes','Lily Pereira','Grace Biswas',
  'Priscilla D\'Costa','Joanna Baroi','Sheila Halder','Monica Palma','Diana Costa'
];

const lastNamesBySuffix = {
  'Islam': ['Chowdhury','Khan','Miah','Sheikh','Talukder','Sarkar',''],
  'Muslim': ['Chowdhury','Khan','','','Sarkar',''],
  'Hindu': ['Das','Roy','Saha','Ghosh','Mondal',''],
};

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

// FIXED: Age-appropriate education profiles
const educationProfiles = [
  { education: 'SSC', minAge: 16, professions: ['Housewife','Garments Worker','Small Business'], incomeRange: [0, 15000], degrees: ['SSC'] },
  { education: 'HSC', minAge: 18, professions: ['Housewife','Shop Assistant','Beauty Parlor Owner','Receptionist'], incomeRange: [0, 20000], degrees: ['HSC'] },
  { education: "Bachelor's", minAge: 22, professions: ['School Teacher','NGO Worker','Bank Officer','Government Officer','Private Job'], incomeRange: [15000, 60000], degrees: ['BA','BSc','BBA','BCom'] },
  { education: "Master's", minAge: 24, professions: ['University Lecturer','Government Official','NGO Manager','Research Officer'], incomeRange: [40000, 150000], degrees: ['MA','MSc','MBA','MCom'] },
  { education: 'Medical', minAge: 26, professions: ['Doctor','Medical Officer','Dentist'], incomeRange: [80000, 300000], degrees: ['MBBS','BDS'] },
  { education: 'Engineering', minAge: 24, professions: ['Engineer','Software Developer','IT Professional'], incomeRange: [60000, 400000], degrees: ['BSc Engineering','CSE','EEE','Civil Engineering'] },
  { education: 'Law', minAge: 25, professions: ['Lawyer','Legal Advisor','Court Official'], incomeRange: [50000, 200000], degrees: ['LLB','LLM'] }
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
  'Traditional': ['Cooking','Sewing','Gardening','Reading Islamic books','Quran recitation','Embroidery'],
  'Family-Oriented': ['Cooking','Household decoration','Caring for family','Gardening','Watching family dramas'],
  'Balanced': ['Reading','Cooking','Traveling','Watching movies','Photography','Yoga'],
  'Ambitious': ['Reading','Career development','Online courses','Traveling','Fitness'],
  'Creative': ['Painting','Writing','Photography','Fashion design','Music','Crafts'],
  'Intellectual': ['Reading','Research','Writing','Debating','Learning languages'],
  'Analytical': ['Programming','Mathematics','Reading','Chess','Technology']
};

const fatherProfessions = {
  'SSC': ['Farmer','Rickshaw puller','Small trader','Day laborer','Fisherman'],
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

// FIXED: Female prayer habits — no Friday prayer for women
function getPrayers(religiousLevel) {
  if (religiousLevel === 'Very Religious') return 'Five times daily';
  if (religiousLevel === 'Religious') return 'Regularly';
  if (religiousLevel === 'Moderate') return 'Occasionally';
  return 'Occasionally';
}

// FIXED: Hindu prayer habits
function getHinduPrayers(religiousLevel) {
  if (religiousLevel === 'Very Religious') return 'Daily puja';
  if (religiousLevel === 'Religious') return 'Daily puja';
  return 'On festivals';
}

function getHijab(religiousLevel) {
  if (religiousLevel === 'Very Religious') return true;
  if (religiousLevel === 'Religious') return Math.random() < 0.7;
  if (religiousLevel === 'Moderate') return Math.random() < 0.4;
  return Math.random() < 0.2;
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
  const firstName = full_name.split(' ')[0];

  const intros = {
    'Traditional': [`আমি ${firstName}, একজন সহজ-সরল মেয়ে যে পরিবারকে সবচেয়ে বেশি ভালোবাসি।`],
    'Ambitious': [`আমি ${firstName} — ${profession} হিসেবে কাজ করি এবং নিজের ক্যারিয়ার নিয়ে সচেতন।`],
    'Modern': [`আমি একজন আধুনিক মনের মেয়ে, কিন্তু পারিবারিক মূল্যবোধকে সম্মান করি।`],
    'Balanced': [`সৎ, পরিশ্রমী এবং পরিবারমুখী — এই তিনটি গুণই আমার পরিচয়।`],
    'Intellectual': [`পড়াশোনা ও জ্ঞান অর্জনে বিশ্বাসী। নতুন কিছু শিখতে ভালোবাসি।`],
    'Creative': [`সৃজনশীল কাজ আমার প্রাণ। ${hobbies ? hobbies.split(',')[0] : 'শিল্পকলা'} আমার অবসরের সঙ্গী।`],
    'Family-Oriented': [`পরিবারই আমার পৃথিবী। মা-বাবার আদর্শে বড় হয়েছি।`],
    'Analytical': [`প্রযুক্তি ও সমস্যা সমাধানে আগ্রহী। লজিক্যাল চিন্তাভাবনায় বিশ্বাসী।`]
  };

  // FIXED: Religion-appropriate lines
  const religionLine = religion === 'Islam'
    ? (religiousLevel === 'Very Religious' ? ' আলহামদুলিল্লাহ, দ্বীনকে জীবনের কেন্দ্রে রাখি।' : ' ইসলামী মূল্যবোধে বিশ্বাসী।')
    : religion === 'Hinduism' ? ' হিন্দু ধর্মীয় মূল্যবোধে বিশ্বাসী।'
    : ' ধর্মীয় মূল্যবোধকে সম্মান করি।';

  const introOptions = intros[personality_type] || intros['Balanced'];
  return rand(introOptions) + religionLine;
}

function generatePartnerPreference(profile) {
  const { religion, religiousLevel, age, expected_age_min, expected_age_max } = profile;

  // FIXED: Religion-appropriate partner preference
  if (religion === 'Hinduism') {
    return `আমি এমন একজন জীবনসঙ্গী চাই যিনি সৎ, পরিশ্রমী এবং পারিবারিক মূল্যবোধসম্পন্ন হবেন। হিন্দু ধর্মীয় রীতিনীতিকে সম্মান করেন এমন পাত্র পছন্দ করব। বয়স ${expected_age_min}-${expected_age_max} বছরের মধ্যে হলে ভালো হয়।`;
  } else if (religion === 'Christianity') {
    return `আমি এমন একজন জীবনসঙ্গী চাই যিনি সৎ, দায়িত্বশীল এবং পারিবারিক। খ্রিস্টান মূল্যবোধে বিশ্বাসী পাত্র পছন্দ করব। বয়স ${expected_age_min}-${expected_age_max} বছরের মধ্যে হলে ভালো হয়।`;
  } else {
    const religiousExpect = religiousLevel === 'Very Religious' ? 'দ্বীনদার ও নামাজি' : religiousLevel === 'Religious' ? 'ধার্মিক' : 'ধর্মীয় মূল্যবোধসম্পন্ন';
    return `আমি এমন একজন জীবনসঙ্গী চাই যিনি ${religiousExpect} হবেন। সৎ, পরিশ্রমী এবং পারিবারিক মূল্যবোধসম্পন্ন পাত্র পছন্দ করব। বয়স ${expected_age_min}-${expected_age_max} বছরের মধ্যে হলে ভালো হয়।`;
  }
}

function generateProfile(index) {
  // Religion: 70% Muslim, 25% Hindu, 5% Christian
  const religionRoll = Math.random();
  let religion, full_name, sect = null;

  if (religionRoll < 0.70) {
    religion = 'Islam';
    const baseName = rand(muslimNames);
    const suffix = Math.random() < 0.3 ? ' ' + rand(['Chowdhury','Khan','Miah','Sheikh','Talukder','Sarkar']) : '';
    full_name = baseName + suffix;
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

  // Age
  const age = randInt(18, 38);

  // FIXED: Marital status — only 26+ can be divorced/widowed
  let marital_status = 'Never Married';
  let has_children = false;
  let number_of_children = 0;
  if (age >= 26) {
    const roll = Math.random();
    if (roll < 0.22) {
      marital_status = 'Divorced';
      has_children = Math.random() < 0.4;
      if (has_children) number_of_children = randInt(1, 2);
    } else if (roll < 0.27) {
      marital_status = 'Widowed';
      has_children = Math.random() < 0.5;
      if (has_children) number_of_children = randInt(1, 2);
    }
  }

  // District & city
  const district = rand(districts);
  const cityOptions = cities[district] || [district];
  const city = rand(cityOptions);

  // FIXED: Education must match age
  const availableEdu = educationProfiles.filter(e => age >= e.minAge);
  let eduProfile;
  const eduRoll = Math.random();
  if (availableEdu.length === 1) {
    eduProfile = availableEdu[0];
  } else if (eduRoll < 0.12) eduProfile = availableEdu.find(e => e.education === 'SSC') || availableEdu[0];
  else if (eduRoll < 0.27) eduProfile = availableEdu.find(e => e.education === 'HSC') || availableEdu[0];
  else if (eduRoll < 0.62) eduProfile = availableEdu.find(e => e.education === "Bachelor's") || availableEdu[0];
  else if (eduRoll < 0.78) eduProfile = availableEdu.find(e => e.education === "Master's") || availableEdu[availableEdu.length-1];
  else if (eduRoll < 0.85) eduProfile = availableEdu.find(e => e.education === 'Medical') || availableEdu[availableEdu.length-1];
  else if (eduRoll < 0.93) eduProfile = availableEdu.find(e => e.education === 'Engineering') || availableEdu[availableEdu.length-1];
  else eduProfile = availableEdu.find(e => e.education === 'Law') || availableEdu[availableEdu.length-1];

  if (!eduProfile) eduProfile = availableEdu[0];

  const education = eduProfile.education;
  const profession = rand(eduProfile.professions);
  const degree = rand(eduProfile.degrees);

  // FIXED: Income rounded to 5000
  const rawIncome = profession === 'Housewife' ? 0 : randInt(eduProfile.incomeRange[0], eduProfile.incomeRange[1]);
  const income = roundTo5000(rawIncome);

  // FIXED: Personality — no Modern + Very Religious
  const personalityOptions = personalities[education] || ['Balanced'];
  const personality_type = rand(personalityOptions);

  // Religious level by district
  let religiousLevel;
  if (religion === 'Islam') {
    const r = Math.random();
    if (['Comilla','Noakhali','Brahmanbaria'].includes(district)) {
      religiousLevel = r < 0.35 ? 'Very Religious' : r < 0.70 ? 'Religious' : 'Moderate';
    } else if (['Dhaka','Chittagong'].includes(district)) {
      religiousLevel = r < 0.15 ? 'Very Religious' : r < 0.50 ? 'Religious' : 'Moderate';
    } else {
      religiousLevel = r < 0.25 ? 'Very Religious' : r < 0.60 ? 'Religious' : 'Moderate';
    }
    // FIXED: Modern personality cannot be Very Religious
    if (personality_type === 'Modern' && religiousLevel === 'Very Religious') religiousLevel = 'Moderate';
  } else {
    religiousLevel = rand(['Moderate','Religious','Liberal']);
  }

  // FIXED: Female prayer habit — no Friday prayer
  const prayer_habit = religion === 'Islam' ? getPrayers(religiousLevel)
    : religion === 'Hinduism' ? getHinduPrayers(religiousLevel)
    : 'On special occasions';

  const wears_hijab = religion === 'Islam' ? getHijab(religiousLevel) : false;

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
  const interests = ['Music','Books','Travel','Nature','Art','Sports','Cooking','Fashion'].sort(() => 0.5 - Math.random()).slice(0, 3).join(', ');

  // NRB: 5%
  const nrb = Math.random() < 0.05;
  const nrb_country = nrb ? rand(['USA','Canada','UK','Germany','Australia','UAE']) : null;

  // Height — FIXED: realistic Bangladeshi female range 4'10" to 5'6"
  const heightFeet = Math.random() < 0.3 ? 4 : 5;
  const heightInches = heightFeet === 4 ? randInt(10, 11) : randInt(0, 6);
  const height = `${heightFeet}'${heightInches}"`;

  const weight = randInt(45, 68);
  const blood_group = rand(['A+','A-','B+','B-','O+','O-','AB+','AB-']);
  const complexion = rand(['Fair','Wheatish','Wheatish Brown','Brown']);
  const body_type = rand(['Slim','Average','Athletic','Curvy']);

  // Family
  const family_type = ['Dhaka','Chittagong'].includes(district)
    ? rand(['Nuclear','Nuclear','Nuclear','Joint'])
    : rand(['Joint','Joint','Nuclear']);

  // FIXED: family_values cannot be Liberal + Very Religious
  let family_values;
  if (religiousLevel === 'Very Religious') family_values = 'Very Conservative';
  else if (religiousLevel === 'Religious') family_values = 'Conservative';
  else family_values = rand(['Moderate','Liberal']);

  const family_status = income > 100000 ? rand(['Upper Middle Class','Rich'])
    : income > 40000 ? rand(['Middle Class','Upper Middle Class'])
    : rand(['Lower Middle Class','Middle Class']);

  // FIXED: Expected age — female wants older man, min = age+3, max = age+8
  const expected_age_min = marital_status === 'Never Married' ? age + 3 : age;
  const expected_age_max = age + 8;

  // FIXED: Diet — non-Muslim cannot have Halal
  const diet = religion === 'Islam' ? rand(['Halal','Halal','Halal','Non-Vegetarian'])
    : religion === 'Hinduism' ? rand(['Vegetarian','Non-Vegetarian'])
    : 'Non-Vegetarian';

  // FIXED: Expected income rounded to 5000
  const expected_income = roundTo5000(Math.max(income > 0 ? income : 20000, 20000));

  // Photo URL — batch3
  const ext = index % 3 === 0 ? '.png' : '.png'; // all batch3 photos are png/jpg
  const photo_url = `${STORAGE_BASE}/female_batch3_${index}.png`;

  const profileData = {
    full_name,
    gender: 'female',
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
    wears_hijab,
    smoking: false,
    drinking: false,
    personality_type,
    hobbies,
    interests,
    health_status: 'Good',
    willing_to_relocate: nrb || randBool(0.3),
    photo_url,
    is_verified: randBool(0.25),
    is_premium: randBool(0.1),
    package: 'prottasha',
    profile_completion: randInt(45, 85),
    looking_for: 'groom',
    expected_age_min,
    expected_age_max,
    expected_education: education === 'SSC' ? 'HSC' : education === 'HSC' ? "Bachelor's" : education,
    expected_profession: 'Any reputable profession',
    expected_income,
    expected_religious_level: religiousLevel === 'Very Religious' ? 'Very Religious' : religiousLevel === 'Religious' ? 'Religious' : 'Moderate',
    expected_family_type: family_type,
    diet,
    wears_glasses: randBool(0.2),
    has_disability: false,
    email: `fb3_${Date.now()}_${index}@biyekori.com`,
    password: '$2b$10$defaulthashedpassword123456789012',
    phone_verified: true,
  };

  profileData.about_me = generateAboutMe({ ...profileData, religiousLevel });
  profileData.partner_preference = generatePartnerPreference({ ...profileData, expected_age_min, expected_age_max, religiousLevel });

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
  console.log('\n🚀 Creating 199 female profiles (batch 3)...\n');
  let success = 0, failed = 0;

  for (let i = 1; i <= 199; i++) {
    const profile = generateProfile(i);
    const result = await insertProfile(profile);

    if (result.status === 201) {
      success++;
      if (i % 20 === 0) console.log(`✅ ${i}/199 — ${profile.full_name} | ${profile.city} | ${profile.education} | Age ${profile.age}`);
    } else {
      failed++;
      console.log(`❌ ${i} FAILED (${result.status}): ${result.data.substring(0, 120)}`);
    }

    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`\n🎉 DONE!`);
  console.log(`✅ Success: ${success} | ❌ Failed: ${failed}`);
  console.log(`📊 Total females should now be: 308 + ${success} = ${308 + success}`);
}

main();
