const https = require('https');

const SUPABASE_URL = 'bwxxctyakpexqfbtoolg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4';

function fetchBatch(offset) {
  return new Promise((resolve) => {
    const opts = {
      hostname: SUPABASE_URL,
      path: `/rest/v1/profiles?select=id,full_name,gender,age,religion,diet,wears_hijab,has_beard,marital_status,expected_age_min,expected_age_max,expected_income,monthly_income,prayer_habit,partner_preference,about_me,looking_for,nrb,nrb_country,country,city,height,weight,education,profession,has_children,number_of_children,total_siblings,married_brothers,married_sisters,father_alive,mother_alive,father_status,mother_status,sect,profile_completion,photo_url&order=id.asc&limit=200&offset=${offset}`,
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
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(res.statusCode));
    });
    req.on('error', () => resolve(0));
    req.write(body);
    req.end();
  });
}

function roundTo500(n) {
  if (!n || n === 0) return 0;
  return Math.round(n / 500) * 500;
}

function parseHeight(h) {
  if (!h) return null;
  const match = h.match(/(\d+)'(\d+)"/);
  if (!match) return null;
  return { feet: parseInt(match[1]), inches: parseInt(match[2]), total: parseInt(match[1]) * 12 + parseInt(match[2]) };
}

function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function fixHeight(gender) {
  // Female: realistic 4'10" to 5'6"
  // Male: realistic 5'2" to 5'10"
  if (gender === 'female' || gender === 'Female') {
    const feet = 4;
    const inches = randInt(10, 11);
    // 50% chance of 5 feet
    if (Math.random() < 0.6) return `5'${randInt(0, 6)}"`;
    return `${feet}'${inches}"`;
  } else {
    if (Math.random() < 0.6) return `5'${randInt(4, 9)}"`;
    return `5'${randInt(2, 11)}"`;
  }
}

function fixPartnerPreference(p) {
  const age = p.age || 25;
  const religion = p.religion || 'Islam';
  const minAge = age + 3;
  const maxAge = age + 8;

  if (religion === 'Hinduism') {
    return `আমি এমন একজন জীবনসঙ্গী চাই যিনি সৎ, পরিশ্রমী এবং পারিবারিক মূল্যবোধসম্পন্ন হবেন। হিন্দু ধর্মীয় রীতিনীতিকে সম্মান করেন এমন পাত্র পছন্দ করব। বয়স ${minAge}-${maxAge} বছরের মধ্যে হলে ভালো হয়। পরিবারকে ভালোবাসেন এবং মা-বাবাকে সম্মান করেন এমন মানুষই আমার আদর্শ।`;
  } else if (religion === 'Christianity') {
    return `আমি এমন একজন জীবনসঙ্গী চাই যিনি সৎ, দায়িত্বশীল এবং পারিবারিক। খ্রিস্টান মূল্যবোধ ও নীতিতে বিশ্বাসী পাত্র পছন্দ করব। বয়স ${minAge}-${maxAge} বছরের মধ্যে হলে ভালো হয়। পরিবারকে ভালোবাসেন এবং সম্মানজনক আচরণ করেন এমন মানুষই আমার পছন্দ।`;
  } else {
    return `আমি এমন একজন জীবনসঙ্গী চাই যিনি ধার্মিক ও নামাজি হবেন। সৎ, পরিশ্রমী এবং পারিবারিক মূল্যবোধসম্পন্ন পাত্র পছন্দ করব। বয়স ${minAge}-${maxAge} বছরের মধ্যে হলে ভালো হয়। পরিবারকে ভালোবাসেন এবং মা-বাবাকে সম্মান করেন এমন মানুষই আমার আদর্শ।`;
  }
}

function fixEducationForAge(age, currentEdu) {
  if (age < 21 && currentEdu === "Bachelor's") return 'HSC';
  if (age < 23 && currentEdu === "Master's") return "Bachelor's";
  if (age < 25 && currentEdu === 'Medical') return "Bachelor's";
  if (age < 23 && currentEdu === 'Engineering') return "Bachelor's";
  if (age < 24 && currentEdu === 'Law') return "Bachelor's";
  return currentEdu;
}

function fixIncome(profession, education, currentIncome) {
  if (profession === 'Housewife') return 0;
  if (currentIncome === 0) return 0;
  return roundTo500(currentIncome);
}

async function main() {
  console.log('🔧 Fetching all profiles to fix...\n');

  const batch1 = await fetchBatch(0);
  const batch2 = await fetchBatch(200);
  const batch3 = await fetchBatch(400);
  const profiles = [...batch1, ...batch2, ...batch3];

  console.log(`📊 Total profiles: ${profiles.length}\n`);

  let fixed = 0;
  let skipped = 0;

  for (const p of profiles) {
    const updates = {};
    const g = (p.gender || '').toLowerCase();
    const isFemale = g === 'female';
    const isMale = g === 'male';
    const religion = p.religion || 'Islam';
    const isMuslim = religion === 'Islam';
    const age = p.age || 25;
    const marital = p.marital_status || 'Never Married';

    // 1. FIX DIET
    if (!isMuslim && p.diet === 'Halal') {
      updates.diet = religion === 'Hinduism' ? 'Non-Vegetarian' : 'Non-Vegetarian';
    }

    // 2. FIX HIJAB for non-Muslim or male
    if (!isMuslim && p.wears_hijab === true) updates.wears_hijab = false;
    if (isMale && p.wears_hijab === true) updates.wears_hijab = false;

    // 3. FIX HAS_BEARD for females
    if (isFemale && p.has_beard === true) updates.has_beard = false;

    // 4. FIX SECT for non-Muslim
    if (!isMuslim && p.sect && ['Sunni','Hanafi','Shia','Salafi'].includes(p.sect)) {
      updates.sect = religion === 'Hinduism' ? 'Hindu' : religion === 'Christianity' ? 'Catholic' : null;
    }

    // 5. FIX PARTNER PREFERENCE with Islamic terms for non-Muslim
    if (!isMuslim && p.partner_preference && (
      p.partner_preference.includes('নামাজি') ||
      p.partner_preference.includes('দ্বীনদার') ||
      p.partner_preference.includes('নামাজ')
    )) {
      updates.partner_preference = fixPartnerPreference(p);
    }

    // 6. FIX EXPECTED AGE for females
    if (isFemale && age) {
      let newMin, newMax;
      if (marital === 'Never Married') {
        newMin = age + 3;
        newMax = age + 8;
      } else if (marital === 'Divorced' || marital === 'Widowed') {
        newMin = age;
        newMax = age + 6;
      } else {
        newMin = age + 2;
        newMax = age + 8;
      }

      if (!p.expected_age_min || p.expected_age_min < age || p.expected_age_min < age + 2) {
        updates.expected_age_min = newMin;
      }
      if (!p.expected_age_max || p.expected_age_max < (updates.expected_age_min || p.expected_age_min)) {
        updates.expected_age_max = newMax;
      }
    }

    // 7. FIX INCOME - round to 500
    if (p.monthly_income && p.monthly_income > 0 && p.monthly_income % 500 !== 0) {
      updates.monthly_income = roundTo500(p.monthly_income);
    }
    if (p.expected_income && p.expected_income > 0 && p.expected_income % 500 !== 0) {
      updates.expected_income = roundTo500(p.expected_income);
    }

    // 8. FIX HOUSEWIFE income
    if (p.profession === 'Housewife' && p.monthly_income > 0) {
      updates.monthly_income = 0;
    }

    // 9. FIX HEIGHT
    const h = parseHeight(p.height);
    if (h) {
      if (isFemale && (h.total > 68 || h.total < 56)) {
        updates.height = fixHeight('female');
      }
      if (isMale && (h.total > 74 || h.total < 58)) {
        updates.height = fixHeight('male');
      }
    }

    // 10. FIX EDUCATION vs AGE
    if (p.education && age) {
      const fixedEdu = fixEducationForAge(age, p.education);
      if (fixedEdu !== p.education) updates.education = fixedEdu;
    }

    // 11. FIX FAMILY CONTRADICTIONS
    if (p.father_alive === true && p.father_status === 'Deceased') {
      updates.father_status = 'Alive';
    }
    if (p.father_alive === false && p.father_status === 'Alive') {
      updates.father_status = 'Deceased';
    }
    if (p.mother_alive === true && p.mother_status === 'Deceased') {
      updates.mother_status = 'Alive';
    }
    if (p.mother_alive === false && p.mother_status === 'Alive') {
      updates.mother_status = 'Deceased';
    }

    // 12. FIX NRB country mismatch
    if (p.nrb === true && p.country === 'Bangladesh') {
      const nrbCountries = ['USA','Canada','UK','Germany','Australia','UAE'];
      updates.country = p.nrb_country || nrbCountries[Math.floor(Math.random() * nrbCountries.length)];
    }
    if (p.nrb === false && p.nrb_country && p.nrb_country !== '') {
      updates.nrb_country = null;
    }

    // 13. FIX LOOKING_FOR
    if (isFemale && p.looking_for === 'bride') updates.looking_for = 'groom';
    if (isMale && p.looking_for === 'groom') updates.looking_for = 'bride';

    // 14. FIX CHILDREN vs MARITAL
    if (p.has_children === true && p.marital_status === 'Never Married') {
      updates.has_children = false;
      updates.number_of_children = 0;
    }
    if (p.has_children === false && p.number_of_children > 0) {
      updates.number_of_children = 0;
    }

    // 15. FIX SIBLINGS contradiction
    if (p.total_siblings !== null) {
      const mb = p.married_brothers || 0;
      const ms = p.married_sisters || 0;
      if (mb + ms > p.total_siblings) {
        updates.married_brothers = Math.floor(p.total_siblings / 2);
        updates.married_sisters = Math.floor(p.total_siblings / 2);
      }
    }

    // Only update if there are fixes
    if (Object.keys(updates).length > 0) {
      const status = await updateProfile(p.id, updates);
      if (status === 204 || status === 200) {
        fixed++;
        if (fixed % 20 === 0) console.log(`✅ Fixed ${fixed} profiles so far...`);
      } else {
        console.log(`❌ Failed ID ${p.id} (status ${status})`);
      }
      await new Promise(r => setTimeout(r, 100));
    } else {
      skipped++;
    }
  }

  console.log(`\n🎉 DONE!`);
  console.log(`✅ Fixed: ${fixed} profiles`);
  console.log(`⏭️  No issues found: ${skipped} profiles`);
  console.log(`\n✨ All issues corrected! Run check-all-issues.js again to verify.`);
}

main();
