const https = require('https');

const SUPABASE_URL = 'bwxxctyakpexqfbtoolg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4';
const STORAGE_BASE = 'https://bwxxctyakpexqfbtoolg.supabase.co/storage/v1/object/public/profile-photos';

// ─── DATA POOLS ───────────────────────────────────────────────

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
  'Shumi Begum','Mitu Akter','Sumona Khatun','Rimi Sultana','Shahana Begum'
];

const hinduNames = [
  'Priya Das','Mitu Saha','Rina Dey','Puja Chakraborty','Anita Roy',
  'Sunita Biswas','Kajol Mondal','Rupa Ghosh','Lata Sarkar','Mita Paul',
  'Deepa Datta','Shilpa Roy','Trishna Das','Ankita Saha','Moumita Biswas',
  'Suchitra Dey','Barnali Roy','Papiya Chakraborty','Susmita Paul','Rimi Sarkar',
  'Chandana Das','Piyali Ghosh','Mithu Mondal','Soma Roy','Reba Datta'
];

const christianNames = [
  'Mary Rozario','Angela Costa','Rita Gomes','Lily Pereira','Grace Biswas',
  'Priscilla D\'Costa','Joanna Baroi','Sheila Halder','Monica Palma','Diana Costa'
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

// Education matched with profession and income
const educationProfiles = [
  { education: 'SSC', professions: ['Housewife','Garments Worker','Small Business'], incomeRange: [0, 15000], degrees: ['SSC'] },
  { education: 'HSC', professions: ['Housewife','Shop Assistant','Beauty Parlor Owner','Receptionist'], incomeRange: [0, 20000], degrees: ['HSC'] },
  { education: "Bachelor's", professions: ['School Teacher','NGO Worker','Bank Officer','Government Officer','Private Job'], incomeRange: [15000, 60000], degrees: ['BA','BSc','BBA','BCom'] },
  { education: "Master's", professions: ['University Lecturer','Senior Bank Officer','Government Official','NGO Manager','Research Officer'], incomeRange: [40000, 150000], degrees: ['MA','MSc','MBA','MCom'] },
  { education: 'Medical', professions: ['Doctor','Medical Officer','Dentist'], incomeRange: [80000, 300000], degrees: ['MBBS','BDS'] },
  { education: 'Engineering', professions: ['Engineer','Software Developer','IT Professional'], incomeRange: [60000, 400000], degrees: ['BSc Engineering','CSE','EEE','Civil Engineering'] },
  { education: 'Law', professions: ['Lawyer','Legal Advisor','Court Official'], incomeRange: [50000, 200000], degrees: ['LLB','LLM'] }
];

// Personality matched with education/profession
const personalities = {
  'SSC': ['Traditional','Family-Oriented'],
  'HSC': ['Traditional','Balanced','Family-Oriented'],
  "Bachelor's": ['Ambitious','Balanced','Modern','Creative'],
  "Master's": ['Ambitious','Modern','Intellectual'],
  'Medical': ['Ambitious','Intellectual','Balanced'],
  'Engineering': ['Ambitious','Modern','Analytical'],
  'Law': ['Ambitious','Intellectual','Modern']
};

const hobbiesByPersonality = {
  'Traditional': ['Cooking','Sewing','Gardening','Reading Islamic books','Quran recitation','Embroidery'],
  'Family-Oriented': ['Cooking','Household decoration','Caring for family','Gardening','Watching family dramas'],
  'Balanced': ['Reading','Cooking','Traveling','Watching movies','Photography','Yoga'],
  'Ambitious': ['Reading','Career development','Online courses','Traveling','Networking','Fitness'],
  'Modern': ['Traveling','Photography','Social media','Watching series','Fitness','Music'],
  'Creative': ['Painting','Writing','Photography','Fashion design','Music','Crafts'],
  'Intellectual': ['Reading','Research','Writing','Debating','Traveling','Learning languages'],
  'Analytical': ['Programming','Mathematics','Reading','Chess','Technology','Problem solving']
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

// Religious level affects siblings and habits
function getSiblings(religiousLevel, district) {
  const rural = ['Comilla','Mymensingh','Jessore','Barisal','Rangpur','Bogra','Dinajpur','Tangail','Faridpur','Noakhali','Brahmanbaria','Kishoreganj','Netrokona','Narayanganj'];
  const isRural = rural.includes(district);

  if (religiousLevel === 'Very Religious') return Math.floor(Math.random() * 4) + 3; // 3-6
  if (religiousLevel === 'Religious') return isRural ? Math.floor(Math.random() * 3) + 2 : Math.floor(Math.random() * 2) + 1; // rural: 2-4, urban: 1-2
  if (religiousLevel === 'Moderate') return Math.floor(Math.random() * 2) + 1; // 1-2
  return Math.floor(Math.random() * 2) + 1; // 1-2
}

function getPrayers(religiousLevel) {
  if (religiousLevel === 'Very Religious') return 'Five times daily';
  if (religiousLevel === 'Religious') return 'Regularly';
  if (religiousLevel === 'Moderate') return 'Friday and special occasions';
  return 'Occasionally';
}

function getHijab(religiousLevel) {
  if (religiousLevel === 'Very Religious') return true;
  if (religiousLevel === 'Religious') return Math.random() < 0.7;
  if (religiousLevel === 'Moderate') return Math.random() < 0.4;
  return Math.random() < 0.2;
}

function rand(arr) { return arr[Math.floor(Math.random() * arr.length)]; }
function randInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randBool(prob) { return Math.random() < prob; }

function generateAboutMe(profile) {
  const { full_name, education, profession, religion, personality_type, district, religiousLevel, hobbies, age } = profile;
  const firstName = full_name.split(' ')[0];

  const intros = {
    'Traditional': [
      `আমি ${firstName}, একজন সহজ-সরল মেয়ে যে পরিবারকে সবচেয়ে বেশি ভালোবাসি।`,
      `আমি পরিবারকে আমার সবকিছু মনে করি। সংসারী এবং পরিশ্রমী হওয়াটাই আমার পরিচয়।`
    ],
    'Ambitious': [
      `আমি ${firstName} — ${profession} হিসেবে কাজ করি এবং নিজের ক্যারিয়ার নিয়ে অনেক সচেতন।`,
      `পেশাগত জীবনে সফল হওয়ার পাশাপাশি একটি সুখী সংসার গড়াই আমার স্বপ্ন।`
    ],
    'Modern': [
      `আমি একজন আধুনিক মনের মেয়ে, কিন্তু পারিবারিক মূল্যবোধকে সম্মান করি।`,
      `জীবনকে উপভোগ করতে ভালোবাসি — ভ্রমণ, বই, আর পরিবারের সাথে সময় কাটানো আমার পছন্দ।`
    ],
    'Balanced': [
      `আমি ${firstName}। জীবনে ভারসাম্য রাখতে বিশ্বাস করি — পরিবার, ক্যারিয়ার এবং ব্যক্তিগত জীবন সব মিলিয়ে।`,
      `সৎ, পরিশ্রমী এবং পরিবারমুখী — এই তিনটি গুণই আমার পরিচয়।`
    ],
    'Intellectual': [
      `আমি পড়াশোনা ও জ্ঞান অর্জনে বিশ্বাসী। ${profession} হিসেবে কাজ করার পাশাপাশি নতুন কিছু শিখতে ভালোবাসি।`,
      `বই পড়া, গবেষণা এবং পরিবারের সাথে মানসম্পন্ন সময় কাটানোই আমার জীবনের আনন্দ।`
    ],
    'Creative': [
      `সৃজনশীল কাজ আমার প্রাণ। ${hobbies ? hobbies.split(',')[0] : 'শিল্পকলা'} আমার অবসর সময়ের সেরা সঙ্গী।`,
      `আমি মনে করি জীবন একটি শিল্পকর্ম — প্রতিটি মুহূর্তকে সুন্দর করে সাজাতে চাই।`
    ],
    'Family-Oriented': [
      `পরিবারই আমার পৃথিবী। মা-বাবার আদর্শে বড় হয়েছি এবং সেই আদর্শ মেনে চলি।`,
      `আমি বিশ্বাস করি একটি সুখী পরিবারই জীবনের সবচেয়ে বড় সম্পদ।`
    ],
    'Analytical': [
      `প্রযুক্তি ও সমস্যা সমাধানে আগ্রহী। ${profession} হিসেবে কাজ করি এবং লজিক্যাল চিন্তাভাবনায় বিশ্বাসী।`,
      `বিশ্লেষণমূলক মন আমার শক্তি। কাজে যেমন মনোযোগী, সংসারেও তেমনই নিবেদিত হতে চাই।`
    ]
  };

  const religionLine = religion === 'Islam'
    ? (religiousLevel === 'Very Religious' ? ' আলহামদুলিল্লাহ, দ্বীনকে জীবনের কেন্দ্রে রাখি।' : ' ইসলামী মূল্যবোধে বিশ্বাসী।')
    : religion === 'Hinduism' ? ' হিন্দু ধর্মীয় মূল্যবোধে বিশ্বাসী।'
    : ' ধর্মীয় মূল্যবোধকে সম্মান করি।';

  const eduLine = education === 'Medical' ? ` ${education} পাশ করে চিকিৎসাসেবায় নিয়োজিত আছি।`
    : education === 'Engineering' ? ` ${education} শেষ করে এখন ${profession} হিসেবে কর্মরত।`
    : ` ${education} পর্যন্ত পড়াশোনা করেছি।`;

  const introOptions = intros[personality_type] || intros['Balanced'];
  return rand(introOptions) + eduLine + religionLine;
}

function generatePartnerPreference(profile) {
  const { education, profession, religion, religiousLevel, personality_type, expected_age_min, expected_age_max } = profile;

  const eduExpectation = {
    'SSC': 'HSC বা তার উপরে',
    'HSC': "Bachelor's বা তার উপরে",
    "Bachelor's": "Bachelor's বা তার উপরে",
    "Master's": "Master's বা সমমানের",
    'Medical': 'উচ্চশিক্ষিত, পেশাদার',
    'Engineering': 'প্রকৌশলী বা সমমানের পেশাদার',
    'Law': 'উচ্চশিক্ষিত ও পেশাদার'
  };

  const religiousExpect = religiousLevel === 'Very Religious'
    ? 'দ্বীনদার, নামাজি এবং ইসলামী জীবনযাপনে অভ্যস্ত'
    : religiousLevel === 'Religious' ? 'ধার্মিক ও নামাজি'
    : 'ধর্মীয় মূল্যবোধসম্পন্ন';

  const personalityExpect = personality_type === 'Ambitious'
    ? 'ক্যারিয়ারসচেতন, পরিশ্রমী এবং দায়িত্বশীল'
    : personality_type === 'Traditional' ? 'পারিবারিক মূল্যবোধসম্পন্ন, সৎ এবং ধার্মিক'
    : personality_type === 'Modern' ? 'আধুনিক মনের, প্রগতিশীল কিন্তু পারিবারিক'
    : 'সৎ, দায়িত্বশীল এবং পারিবারিক মূল্যবোধসম্পন্ন';

  return `আমি এমন একজন জীবনসঙ্গী চাই যিনি ${religiousExpect} হবেন। শিক্ষাগত যোগ্যতায় ${eduExpectation[education] || "Bachelor's বা তার উপরে"} হলে ভালো হয়। বয়স ${expected_age_min}-${expected_age_max} বছরের মধ্যে হলে পছন্দ করব। ${personalityExpect} পাত্র হলে আমাদের সংসার সুখী হবে বলে মনে করি। পরিবারকে ভালোবাসেন এবং মা-বাবাকে সম্মান করেন এমন মানুষই আমার আদর্শ।`;
}

// ─── PROFILE GENERATOR ────────────────────────────────────────

function generateProfile(index) {
  // Religion distribution: 70% Muslim, 25% Hindu, 5% Christian
  const religionRoll = Math.random();
  let religion, full_name, sect = null;

  if (religionRoll < 0.70) {
    religion = 'Islam';
    full_name = rand(muslimNames) + (Math.random() < 0.3 ? ' ' + rand(['Chowdhury','Khan','Miah','Sheikh','Talukder','Sarkar']) : '');
    sect = rand(['Sunni','Sunni','Sunni','Sunni','Hanafi']);
  } else if (religionRoll < 0.95) {
    religion = 'Hinduism';
    full_name = rand(hinduNames);
    sect = null;
  } else {
    religion = 'Christianity';
    full_name = rand(christianNames);
    sect = 'Catholic';
  }

  // Age logic
  const age = randInt(18, 38);
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

  // Education
  const eduRoll = Math.random();
  let eduProfile;
  if (eduRoll < 0.10) eduProfile = educationProfiles[0]; // SSC
  else if (eduRoll < 0.25) eduProfile = educationProfiles[1]; // HSC
  else if (eduRoll < 0.65) eduProfile = educationProfiles[2]; // Bachelor's
  else if (eduRoll < 0.82) eduProfile = educationProfiles[3]; // Master's
  else if (eduRoll < 0.89) eduProfile = educationProfiles[4]; // Medical
  else if (eduRoll < 0.96) eduProfile = educationProfiles[5]; // Engineering
  else eduProfile = educationProfiles[6]; // Law

  const education = eduProfile.education;
  const profession = rand(eduProfile.professions);
  const degree = rand(eduProfile.degrees);
  const income = profession === 'Housewife' ? 0 : randInt(eduProfile.incomeRange[0], eduProfile.incomeRange[1]);

  // Personality matched to education
  const personalityOptions = personalities[education] || ['Balanced'];
  const personality_type = rand(personalityOptions);

  // Religious level
  let religiousLevel;
  if (religion === 'Islam') {
    const r = Math.random();
    if (district === 'Comilla' || district === 'Noakhali' || district === 'Brahmanbaria') {
      religiousLevel = r < 0.35 ? 'Very Religious' : r < 0.70 ? 'Religious' : 'Moderate';
    } else if (district === 'Dhaka' || district === 'Chittagong') {
      religiousLevel = r < 0.15 ? 'Very Religious' : r < 0.50 ? 'Religious' : r < 0.80 ? 'Moderate' : 'Liberal';
    } else {
      religiousLevel = r < 0.25 ? 'Very Religious' : r < 0.60 ? 'Religious' : 'Moderate';
    }
  } else {
    religiousLevel = rand(['Moderate','Religious','Liberal']);
  }

  // Siblings based on religious level and district
  const total_siblings = getSiblings(religiousLevel, district);
  const married_brothers = randInt(0, Math.floor(total_siblings / 2));
  const married_sisters = randInt(0, Math.floor(total_siblings / 2));

  // Father profession matched to education
  const fatherProfList = fatherProfessions[education] || fatherProfessions["Bachelor's"];
  const father_profession = rand(fatherProfList);

  // Mother profession
  const mother_profession = education === 'Medical' || education === 'Engineering'
    ? rand(['School Teacher','Housewife','Doctor'])
    : rand(['Housewife','School Teacher','NGO Worker']);

  // Hobbies matched to personality
  const hobbyPool = hobbiesByPersonality[personality_type] || hobbiesByPersonality['Balanced'];
  const numHobbies = randInt(2, 4);
  const shuffled = [...hobbyPool].sort(() => 0.5 - Math.random());
  const hobbies = shuffled.slice(0, numHobbies).join(', ');

  // Interests
  const interestPool = ['Music','Books','Travel','Nature','Art','Sports','Cinema','Cooking','Fashion','Technology','Current Affairs','Social work'];
  const numInterests = randInt(2, 3);
  const interests = [...interestPool].sort(() => 0.5 - Math.random()).slice(0, numInterests).join(', ');

  // Prayer & hijab (Islam only)
  const prayer_habit = religion === 'Islam' ? getPrayers(religiousLevel) : 'N/A';
  const wears_hijab = religion === 'Islam' ? getHijab(religiousLevel) : false;

  // NRB: 5%
  const nrb = Math.random() < 0.05;
  const nrb_country = nrb ? rand(['USA','Canada','UK','Germany','Australia','UAE','Italy','Sweden']) : null;

  // Height
  const height = `${randInt(4, 5)}'${randInt(0, 11)}"`;

  // Weight
  const weight = randInt(45, 70);

  // Blood group
  const blood_group = rand(['A+','A-','B+','B-','O+','O-','AB+','AB-']);

  // Complexion
  const complexion = rand(['Fair','Wheatish','Wheatish Brown','Brown','Dark Brown']);

  // Body type
  const body_type = rand(['Slim','Average','Athletic','Curvy']);

  // Family
  const family_type = district === 'Dhaka' || district === 'Chittagong'
    ? rand(['Nuclear','Nuclear','Nuclear','Joint'])
    : rand(['Joint','Joint','Nuclear','Extended']);

  const family_status = income > 100000 || (father_profession.includes('Doctor') || father_profession.includes('Professor'))
    ? rand(['Upper Middle Class','Rich'])
    : income > 40000 ? rand(['Middle Class','Upper Middle Class'])
    : rand(['Lower Middle Class','Middle Class']);

  const family_values = religiousLevel === 'Very Religious' ? 'Very Conservative'
    : religiousLevel === 'Religious' ? 'Conservative'
    : city === 'Dhaka' || city === 'Chittagong' ? rand(['Moderate','Liberal'])
    : 'Moderate';

  // Partner expectations
  const expected_age_min = Math.max(age - 3, 18);
  const expected_age_max = age + 8;
  const expected_education = education === 'SSC' ? 'HSC'
    : education === 'HSC' ? "Bachelor's"
    : education === "Bachelor's" ? "Bachelor's"
    : education === "Master's" ? "Master's"
    : education;

  // Photo URL
  let photo_url;
  if (index <= 52) {
    // female-101 to female-152 (unused ones)
    const num = (100 + index).toString().padStart(3, '0');
    photo_url = `${STORAGE_BASE}/female-${num}.png`;
  } else {
    // female_batch2_1 to female_batch2_86
    const batchNum = index - 52;
    photo_url = `${STORAGE_BASE}/female_batch2_${batchNum}.jpg`;
  }

  // Build profile object
  const profileData = {
    full_name,
    gender: 'female',
    age,
    religion,
    sect,
    education,
    degree,
    profession,
    occupation: profession,
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
    father_status: randBool(0.80) ? 'Alive' : 'Deceased',
    mother_status: randBool(0.88) ? 'Alive' : 'Deceased',
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
    social_level: personality_type === 'Modern' || personality_type === 'Ambitious' ? 'Social' : rand(['Moderate','Introvert','Social']),
    health_status: 'Good',
    willing_to_relocate: nrb || randBool(0.3),
    photo_url,
    is_verified: randBool(0.3),
    is_premium: randBool(0.15),
    package: 'prottasha',
    profile_completion: randInt(40, 85),
    looking_for: 'groom',
    photo_visible_to: 'All',
    expected_age_min,
    expected_age_max,
    expected_education,
    expected_profession: education === 'Medical' ? 'Doctor, Engineer or equivalent' : education === 'Engineering' ? 'Engineer, IT Professional or equivalent' : 'Any reputable profession',
    expected_income: income > 0 ? Math.max(income, 20000) : 20000,
    expected_religious_level: religiousLevel === 'Very Religious' ? 'Very Religious' : religiousLevel === 'Religious' ? 'Religious' : 'Moderate',
    expected_family_type: family_type,
    diet: rand(['Halal','Vegetarian','Non-Vegetarian','Halal']),
    wears_glasses: randBool(0.2),
    has_disability: false,
    email: `female${Date.now()}${index}@biyekori.com`,
    password: '$2b$10$defaulthashedpassword123456789012',
    phone_verified: true,
  };

  // Generate bio AFTER all fields are set
  profileData.about_me = generateAboutMe({ ...profileData, religiousLevel });
  profileData.bio = profileData.about_me;
  profileData.partner_preference = generatePartnerPreference({ ...profileData, expected_age_min, expected_age_max, religiousLevel });

  return profileData;
}

// ─── INSERT FUNCTION ──────────────────────────────────────────

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
      res.on('end', () => {
        resolve({ status: res.statusCode, data });
      });
    });

    req.on('error', (e) => resolve({ status: 0, data: e.message }));
    req.write(body);
    req.end();
  });
}

// ─── MAIN ─────────────────────────────────────────────────────

async function main() {
  console.log('\n🚀 Creating 138 realistic female profiles...\n');
  let success = 0, failed = 0;

  for (let i = 1; i <= 138; i++) {
    const profile = generateProfile(i);
    const result = await insertProfile(profile);

    if (result.status === 201) {
      success++;
      if (i % 10 === 0) console.log(`✅ ${i}/138 created (${profile.full_name} - ${profile.city} - ${profile.education})`);
    } else {
      failed++;
      console.log(`❌ ${i} FAILED (${result.status}): ${result.data.substring(0, 100)}`);
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 150));
  }

  console.log(`\n🎉 DONE! Success: ${success} | Failed: ${failed}`);
  console.log(`📊 Total female profiles should now be: 100 + ${success} = ${100 + success}`);
}

main();
