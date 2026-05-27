const https = require('https');

const SUPABASE_URL = 'bwxxctyakpexqfbtoolg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4';

function fetchBatch(offset) {
  return new Promise((resolve) => {
    const opts = {
      hostname: SUPABASE_URL,
      path: `/rest/v1/profiles?select=id,full_name,gender,age,religion,prayer_habit,religious_level,personality_type,profession,education,monthly_income,family_type,family_values,total_siblings,nrb,willing_to_relocate,city,marital_status,has_children,expected_age_max,expected_age_min,expected_religious_level,expected_family_type,expected_profession,wears_hijab,diet,sect&order=id.asc&limit=200&offset=${offset}`,
      method: 'GET',
      headers: { 'apikey': ANON_KEY, 'Authorization': `Bearer ${ANON_KEY}` }
    };
    https.get(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve([]); } });
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

function fixProfile(p) {
  const updates = {};
  const g = (p.gender || '').toLowerCase();
  const isFemale = g === 'female';
  const religion = p.religion || '';
  const isMuslim = religion === 'Islam';
  const isHindu = religion === 'Hinduism';
  const edu = p.education || '';
  const prof = p.profession || '';
  const age = p.age || 0;
  const city = p.city || '';
  const rl = p.religious_level || '';
  const pt = p.personality_type || '';
  const fv = p.family_values || '';
  const ft = p.family_type || '';
  const prayer = p.prayer_habit || '';
  const income = p.monthly_income || 0;

  // 1. Female + Friday prayer
  if (isFemale && isMuslim && prayer === 'Friday and special occasions') {
    if (rl === 'Very Religious') updates.prayer_habit = 'Five times daily';
    else if (rl === 'Religious') updates.prayer_habit = 'Regularly';
    else updates.prayer_habit = 'Occasionally';
  }

  // 2. Five times daily + Liberal
  if (prayer === 'Five times daily' && rl === 'Liberal') {
    updates.prayer_habit = 'Occasionally';
  }

  // 3. Hindu prayer habit — fix to appropriate
  if (isHindu && ['Five times daily', 'Friday and special occasions', 'Regularly', 'Occasionally'].includes(prayer)) {
    if (rl === 'Very Religious' || rl === 'Religious') updates.prayer_habit = 'Daily puja';
    else updates.prayer_habit = 'On festivals';
  }

  // 4. Modern + Very Religious
  if (pt === 'Modern' && rl === 'Very Religious') {
    updates.religious_level = 'Moderate';
  }

  // 5. Traditional + high career
  const highCareerProfs = ['Software Developer', 'IT Professional', 'Engineer', 'Doctor', 'Medical Officer', 'Dentist', 'Lawyer', 'Legal Advisor'];
  if (pt === 'Traditional' && highCareerProfs.includes(prof)) {
    updates.personality_type = 'Balanced';
  }

  // 6. Ambitious + Housewife
  if (pt === 'Ambitious' && prof === 'Housewife') {
    updates.personality_type = 'Family-Oriented';
  }

  // 7. Modern + Very Conservative
  if (pt === 'Modern' && fv === 'Very Conservative') {
    updates.family_values = 'Moderate';
  }

  // 8. Traditional + urban + high edu
  const bigCities = ['Dhaka', 'Chittagong', 'Mirpur', 'Uttara', 'Dhanmondi', 'Gulshan', 'Banani'];
  const highEdu = ["Master's", 'Medical', 'Engineering', 'Law'];
  if (pt === 'Traditional' && bigCities.some(c => city.includes(c)) && highEdu.includes(edu)) {
    updates.personality_type = 'Ambitious';
  }

  // 9. Education vs Profession
  if (edu === 'Medical' && !['Doctor', 'Medical Officer', 'Dentist', 'Health Worker', 'Physician'].includes(prof)) {
    updates.profession = 'Doctor';
    updates.monthly_income = Math.max(income, 80000);
  }
  if (edu === 'Engineering' && ['Housewife', 'Shop Assistant', 'Receptionist', 'Garments Worker', 'Beauty Parlor Owner'].includes(prof)) {
    updates.profession = isFemale ? 'IT Professional' : 'Engineer';
    updates.monthly_income = Math.max(income, 60000);
  }
  if (edu === 'Law' && ['Garments Worker', 'Shop Assistant', 'Housewife', 'Receptionist', 'Beauty Parlor Owner'].includes(prof)) {
    updates.profession = 'Legal Advisor';
    updates.monthly_income = Math.max(income, 50000);
  }
  if (['SSC', 'HSC'].includes(edu) && ['Doctor', 'Engineer', 'Software Developer', 'Lawyer', 'University Lecturer', 'Bank Officer'].includes(prof)) {
    updates.profession = edu === 'SSC' ? 'Small Business' : 'Private Job';
    updates.monthly_income = edu === 'SSC' ? 15000 : 20000;
  }
  if (edu === "Master's" && ['Garments Worker', 'Shop Assistant', 'Beauty Parlor Owner'].includes(prof)) {
    updates.profession = 'NGO Worker';
    updates.monthly_income = Math.max(income, 35000);
  }

  // 10. Age vs senior profession
  if (age < 25 && ['Senior Bank Officer', 'NGO Manager', 'University Lecturer', 'Research Officer', 'Government Official'].includes(prof)) {
    updates.profession = 'Bank Officer';
    if (income > 80000) updates.monthly_income = 45000;
  }

  // 11. Income vs profession — fix low doctor income
  if (['Doctor', 'Medical Officer', 'Dentist'].includes(prof) && income > 0 && income < 50000) {
    updates.monthly_income = 80000;
  }
  if (['Software Developer', 'IT Professional'].includes(prof) && income > 0 && income < 30000) {
    updates.monthly_income = 60000;
  }
  if (['University Lecturer'].includes(prof) && income > 0 && income < 30000) {
    updates.monthly_income = 35000;
  }

  // 12. Nuclear family + many siblings
  if (ft === 'Nuclear' && p.total_siblings > 4) {
    updates.family_type = 'Joint';
  }

  // 13. Liberal family + Very Religious
  if (fv === 'Liberal' && rl === 'Very Religious') {
    updates.family_values = 'Conservative';
  }

  // 14. NRB + Joint family
  if (p.nrb === true && ft === 'Joint') {
    updates.family_type = 'Nuclear';
  }

  // 15. NRB + willing to relocate false
  if (p.nrb === true && p.willing_to_relocate === false) {
    updates.willing_to_relocate = true;
  }

  // 16. Expected age gap too large
  if (p.expected_age_max && age && (p.expected_age_max - age > 12)) {
    updates.expected_age_max = age + 10;
  }

  // 17. Liberal wanting Very Religious partner
  if (rl === 'Liberal' && p.expected_religious_level === 'Very Religious') {
    updates.expected_religious_level = 'Moderate';
  }

  // 18. Modern wanting Very Conservative family
  if (pt === 'Modern' && p.expected_family_type === 'Very Conservative') {
    updates.expected_family_type = 'Moderate';
  }

  // 19. Hindu sect fix
  if (isHindu && p.sect && ['Sunni', 'Hanafi', 'Shia', 'Salafi'].includes(p.sect)) {
    updates.sect = 'Hindu';
  }

  return updates;
}

async function main() {
  console.log('🔧 Fixing deep issues...\n');
  const b1 = await fetchBatch(0);
  const b2 = await fetchBatch(200);
  const b3 = await fetchBatch(400);
  const profiles = [...b1, ...b2, ...b3];
  console.log(`📊 Total: ${profiles.length}\n`);

  let fixed = 0, skipped = 0;

  for (const p of profiles) {
    const updates = fixProfile(p);
    if (Object.keys(updates).length > 0) {
      const status = await updateProfile(p.id, updates);
      if (status === 204 || status === 200) {
        fixed++;
        if (fixed % 20 === 0) console.log(`✅ Fixed ${fixed} profiles...`);
      } else {
        console.log(`❌ Failed ID ${p.id} (${status})`);
      }
      await new Promise(r => setTimeout(r, 100));
    } else {
      skipped++;
    }
  }

  console.log(`\n🎉 DONE! Fixed: ${fixed} | Clean: ${skipped}`);
  console.log('Run check-deep-issues.js to verify!');
}

main();
