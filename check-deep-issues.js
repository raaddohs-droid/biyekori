const https = require('https');

const SUPABASE_URL = 'bwxxctyakpexqfbtoolg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4';

function fetchBatch(offset) {
  return new Promise((resolve) => {
    const opts = {
      hostname: SUPABASE_URL,
      path: `/rest/v1/profiles?select=id,full_name,gender,age,religion,prayer_habit,religious_level,personality_type,profession,education,monthly_income,family_type,family_values,total_siblings,nrb,willing_to_relocate,city,marital_status,has_children,expected_age_max,expected_religious_level,expected_family_type,expected_profession,wears_hijab,diet,sect&order=id.asc&limit=200&offset=${offset}`,
      method: 'GET',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      }
    };
    https.get(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => { try { resolve(JSON.parse(data)); } catch { resolve([]); } });
    }).on('error', () => resolve([]));
  });
}

function checkProfile(p) {
  const issues = [];
  const g = (p.gender || '').toLowerCase();
  const isFemale = g === 'female';
  const isMale = g === 'male';
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

  // 1. Female + Friday prayer habit
  if (isFemale && isMuslim && prayer === 'Friday and special occasions') {
    issues.push(`[PRAYER] Female with prayer_habit="Friday and special occasions" — Friday Jumu'ah is for men only`);
  }

  // 2. Five times daily + Liberal
  if (prayer === 'Five times daily' && rl === 'Liberal') {
    issues.push(`[PRAYER] prayer_habit="Five times daily" but religious_level="Liberal" — contradiction`);
  }

  // 3. Hindu prayer habit
  if (isHindu && (prayer === 'Five times daily' || prayer === 'Friday and special occasions' || prayer === 'Regularly' || prayer === 'Occasionally')) {
    issues.push(`[PRAYER] Hindu profile has Islamic prayer_habit="${prayer}" — should be "Daily puja" or "Regular worship"`);
  }

  // 4. Modern + Very Religious
  if (pt === 'Modern' && rl === 'Very Religious') {
    issues.push(`[PERSONALITY] personality_type="Modern" but religious_level="Very Religious" — contradiction`);
  }

  // 5. Traditional + high career profession
  const highCareerProfs = ['Software Developer', 'IT Professional', 'Engineer', 'Doctor', 'Medical Officer', 'Dentist', 'Lawyer', 'Legal Advisor'];
  if (pt === 'Traditional' && highCareerProfs.includes(prof)) {
    issues.push(`[PERSONALITY] personality_type="Traditional" but profession="${prof}" — Traditional women rarely pursue this career`);
  }

  // 6. Ambitious + Housewife
  if (pt === 'Ambitious' && prof === 'Housewife') {
    issues.push(`[PERSONALITY] personality_type="Ambitious" but profession="Housewife" — contradiction`);
  }

  // 7. Modern + Very Conservative family
  if (pt === 'Modern' && fv === 'Very Conservative') {
    issues.push(`[PERSONALITY] personality_type="Modern" but family_values="Very Conservative" — contradiction`);
  }

  // 8. Traditional + Dhaka/Chittagong + Master's/Medical/Engineering
  const bigCities = ['Dhaka', 'Chittagong', 'Mirpur', 'Uttara', 'Dhanmondi', 'Gulshan', 'Banani'];
  const highEdu = ['Master\'s', 'Medical', 'Engineering', 'Law'];
  if (pt === 'Traditional' && bigCities.some(c => city.includes(c)) && highEdu.includes(edu)) {
    issues.push(`[PERSONALITY] Traditional personality + urban city + ${edu} degree — should be Ambitious or Balanced`);
  }

  // 9. Education vs Profession mismatches
  if (edu === 'Medical' && !['Doctor', 'Medical Officer', 'Dentist', 'Health Worker', 'Physician'].includes(prof)) {
    issues.push(`[EDU-PROF] education="Medical" but profession="${prof}" — MBBS graduate should be a Doctor`);
  }
  if (edu === 'Engineering' && ['Housewife', 'Shop Assistant', 'Receptionist', 'Garments Worker', 'Beauty Parlor Owner'].includes(prof)) {
    issues.push(`[EDU-PROF] education="Engineering" but profession="${prof}" — Engineering graduate in this role is illogical`);
  }
  if (edu === 'Law' && ['Garments Worker', 'Shop Assistant', 'Housewife', 'Receptionist', 'Beauty Parlor Owner'].includes(prof)) {
    issues.push(`[EDU-PROF] education="Law" but profession="${prof}" — Law graduate in this role is illogical`);
  }
  if (['SSC', 'HSC'].includes(edu) && ['Doctor', 'Engineer', 'Software Developer', 'Lawyer', 'University Lecturer', 'Bank Officer'].includes(prof)) {
    issues.push(`[EDU-PROF] education="${edu}" but profession="${prof}" — impossible combination`);
  }
  if (edu === 'Master\'s' && ['Garments Worker', 'Shop Assistant', 'Beauty Parlor Owner'].includes(prof)) {
    issues.push(`[EDU-PROF] education="Master's" but profession="${prof}" — very unusual combination`);
  }

  // 10. Age vs senior profession
  if (age < 25 && ['Senior Bank Officer', 'NGO Manager', 'University Lecturer', 'Research Officer', 'Government Official'].includes(prof)) {
    issues.push(`[AGE-PROF] Age=${age} but profession="${prof}" — too young for this senior role`);
  }

  // 11. Income vs profession
  if (['Doctor', 'Medical Officer', 'Dentist'].includes(prof) && income > 0 && income < 50000) {
    issues.push(`[INCOME-PROF] profession="${prof}" but monthly_income=${income} — too low for a doctor`);
  }
  if (['Software Developer', 'IT Professional'].includes(prof) && income > 0 && income < 30000) {
    issues.push(`[INCOME-PROF] profession="${prof}" but monthly_income=${income} — too low for IT professional`);
  }
  if (['University Lecturer'].includes(prof) && income > 0 && income < 30000) {
    issues.push(`[INCOME-PROF] profession="${prof}" but monthly_income=${income} — too low for lecturer`);
  }

  // 12. Family type vs siblings
  if (ft === 'Nuclear' && p.total_siblings > 4) {
    issues.push(`[FAMILY] family_type="Nuclear" but total_siblings=${p.total_siblings} — large families rarely live nuclear`);
  }

  // 13. Liberal family values + Very Religious
  if (fv === 'Liberal' && rl === 'Very Religious') {
    issues.push(`[FAMILY] family_values="Liberal" but religious_level="Very Religious" — contradiction`);
  }

  // 14. NRB + Joint family
  if (p.nrb === true && ft === 'Joint') {
    issues.push(`[NRB] nrb=true but family_type="Joint" — NRB people abroad almost always live nuclear`);
  }

  // 15. NRB + willing to relocate = false
  if (p.nrb === true && p.willing_to_relocate === false) {
    issues.push(`[NRB] nrb=true but willing_to_relocate=false — already relocated abroad`);
  }

  // 16. Partner preference contradictions
  if (p.expected_age_max && age && (p.expected_age_max - age > 15)) {
    issues.push(`[PARTNER] age=${age} but expected_age_max=${p.expected_age_max} — age gap too large (${p.expected_age_max - age} years)`);
  }
  if (rl === 'Liberal' && p.expected_religious_level === 'Very Religious') {
    issues.push(`[PARTNER] religious_level="Liberal" but expected_religious_level="Very Religious" — contradiction`);
  }
  if (pt === 'Modern' && p.expected_family_type === 'Very Conservative') {
    issues.push(`[PARTNER] personality="Modern" but expected_family_type="Very Conservative" — contradiction`);
  }

  // 17. Hindu specific
  if (isHindu && p.sect && ['Sunni', 'Hanafi', 'Shia', 'Salafi'].includes(p.sect)) {
    issues.push(`[RELIGION] Hindu profile has Islamic sect="${p.sect}"`);
  }

  return issues;
}

async function main() {
  console.log('🔍 Deep checking all profiles...\n');
  const b1 = await fetchBatch(0);
  const b2 = await fetchBatch(200);
  const b3 = await fetchBatch(400);
  const profiles = [...b1, ...b2, ...b3];
  console.log(`📊 Total: ${profiles.length}\n`);

  const allIssues = {};
  const typeCounts = {};

  for (const p of profiles) {
    const issues = checkProfile(p);
    if (issues.length > 0) {
      allIssues[p.id] = { name: p.full_name, gender: p.gender, age: p.age, issues };
      for (const issue of issues) {
        const type = issue.split(']')[0].replace('[', '');
        typeCounts[type] = (typeCounts[type] || 0) + 1;
      }
    }
  }

  console.log('╔══════════════════════════════════╗');
  console.log('║       DEEP ISSUE SUMMARY         ║');
  console.log('╚══════════════════════════════════╝');
  for (const [type, count] of Object.entries(typeCounts).sort((a, b) => b[1] - a[1])) {
    console.log(`  ${type.padEnd(15)}: ${count} profiles`);
  }
  console.log(`\n  TOTAL profiles with issues: ${Object.keys(allIssues).length} / ${profiles.length}`);

  console.log('\n╔══════════════════════════════════╗');
  console.log('║         DETAILED LIST            ║');
  console.log('╚══════════════════════════════════╝');
  for (const [id, data] of Object.entries(allIssues)) {
    console.log(`\nID ${id} | ${data.name} | ${data.gender} | Age ${data.age}`);
    for (const issue of data.issues) {
      console.log(`  ⚠️  ${issue}`);
    }
  }
  console.log('\n✅ Deep check complete!');
}

main();
