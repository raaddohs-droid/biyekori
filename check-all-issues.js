const https = require('https');

const SUPABASE_URL = 'bwxxctyakpexqfbtoolg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4';

function fetchBatch(offset) {
  return new Promise((resolve) => {
    const opts = {
      hostname: SUPABASE_URL,
      path: `/rest/v1/profiles?select=id,full_name,gender,age,religion,diet,wears_hijab,has_beard,marital_status,expected_age_min,expected_age_max,expected_income,monthly_income,prayer_habit,partner_preference,about_me,looking_for,nrb,nrb_country,country,city,district,height,weight,education,profession,has_children,number_of_children,total_siblings,married_brothers,married_sisters,father_alive,mother_alive,sect,profile_completion,photo_url,family_type,family_values,religious_level&order=id.asc&limit=200&offset=${offset}`,
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

function parseHeight(h) {
  if (!h) return null;
  const match = h.match(/(\d+)'(\d+)"/);
  if (!match) return null;
  return parseInt(match[1]) * 12 + parseInt(match[2]);
}

function roundTo500(n) {
  return Math.round(n / 500) * 500;
}

function checkProfile(p) {
  const issues = [];
  const g = (p.gender || '').toLowerCase();
  const isFemale = g === 'female';
  const isMale = g === 'male';
  const religion = p.religion || '';
  const isMuslim = religion === 'Islam';
  const isHindu = religion === 'Hinduism';
  const isChristian = religion === 'Christianity';
  const edu = p.education || '';
  const prof = p.profession || '';
  const age = p.age;
  const marital = p.marital_status || '';

  // --- RELIGION ISSUES ---
  if (!isMuslim && p.diet === 'Halal')
    issues.push(`[RELIGION] Diet=Halal but religion=${religion}`);

  if (!isMuslim && p.wears_hijab === true)
    issues.push(`[RELIGION] wears_hijab=true but religion=${religion}`);

  if (isMale && p.wears_hijab === true)
    issues.push(`[GENDER] Male has wears_hijab=true`);

  if (isFemale && p.has_beard === true)
    issues.push(`[GENDER] Female has has_beard=true`);

  if (!isMuslim && p.prayer_habit && (
    p.prayer_habit.toLowerCase().includes('namaz') ||
    p.prayer_habit.toLowerCase().includes('five times')
  )) issues.push(`[RELIGION] prayer_habit mentions Islamic practice but religion=${religion}`);

  if (!isMuslim && p.partner_preference && p.partner_preference.includes('নামাজি'))
    issues.push(`[RELIGION] partner_preference mentions নামাজি but religion=${religion}`);

  if (!isMuslim && p.partner_preference && p.partner_preference.includes('দ্বীনদার'))
    issues.push(`[RELIGION] partner_preference mentions দ্বীনদার but religion=${religion}`);

  if (!isMuslim && p.sect && ['Sunni','Hanafi','Shia','Salafi'].includes(p.sect))
    issues.push(`[RELIGION] sect=${p.sect} but religion=${religion}`);

  if (isHindu && p.diet === 'Halal')
    issues.push(`[RELIGION] Hindu profile has diet=Halal`);

  // --- AGE vs EDUCATION ---
  if (age && edu) {
    if (edu === "Bachelor's" && age < 21)
      issues.push(`[AGE-EDU] Age=${age} too young for Bachelor's (min 21)`);
    if (edu === "Master's" && age < 23)
      issues.push(`[AGE-EDU] Age=${age} too young for Master's (min 23)`);
    if (edu === 'Medical' && age < 25)
      issues.push(`[AGE-EDU] Age=${age} too young for MBBS (min 25 with internship)`);
    if (edu === 'Engineering' && age < 23)
      issues.push(`[AGE-EDU] Age=${age} too young for Engineering degree (min 23)`);
    if (edu === 'Law' && age < 24)
      issues.push(`[AGE-EDU] Age=${age} too young for Law degree (min 24)`);
  }

  // --- AGE vs MARITAL STATUS ---
  if (age && age < 20 && marital === 'Divorced')
    issues.push(`[AGE-MARITAL] Age=${age} Divorced is very unusual`);
  if (age && age < 20 && marital === 'Widowed')
    issues.push(`[AGE-MARITAL] Age=${age} Widowed is very unusual`);

  // --- CHILDREN vs MARITAL ---
  if (p.has_children === true && marital === 'Never Married')
    issues.push(`[CHILDREN] has_children=true but marital_status=Never Married`);
  if (p.has_children === true && (!p.number_of_children || p.number_of_children === 0))
    issues.push(`[CHILDREN] has_children=true but number_of_children=0`);
  if (p.has_children === false && p.number_of_children > 0)
    issues.push(`[CHILDREN] has_children=false but number_of_children=${p.number_of_children}`);

  // --- EXPECTED AGE LOGIC ---
  if (age && p.expected_age_min !== null && p.expected_age_max !== null) {
    if (p.expected_age_max < p.expected_age_min)
      issues.push(`[EXP-AGE] expected_age_max=${p.expected_age_max} < expected_age_min=${p.expected_age_min}`);

    if (isFemale) {
      if (marital === 'Never Married' && p.expected_age_min < age)
        issues.push(`[EXP-AGE] Female age=${age} wants min age ${p.expected_age_min} — younger than her`);
      if (marital === 'Never Married' && p.expected_age_min < age + 2)
        issues.push(`[EXP-AGE] Female age=${age} wants min age ${p.expected_age_min} — too close (should be age+2 minimum)`);
      if (p.expected_age_max - age > 15)
        issues.push(`[EXP-AGE] Female age=${age} wants max age ${p.expected_age_max} — gap too large (${p.expected_age_max - age} years)`);
    }

    if (isMale) {
      if (p.expected_age_min > age)
        issues.push(`[EXP-AGE] Male age=${age} but expected_age_min=${p.expected_age_min} — wants older woman (unusual in BD)`);
    }
  }

  // --- INCOME ISSUES ---
  if (p.monthly_income && p.monthly_income > 0 && p.monthly_income % 500 !== 0)
    issues.push(`[INCOME] monthly_income=${p.monthly_income} not rounded to 500`);
  if (p.expected_income && p.expected_income > 0 && p.expected_income % 500 !== 0)
    issues.push(`[INCOME] expected_income=${p.expected_income} not rounded to 500`);

  if (prof === 'Housewife' && p.monthly_income > 0)
    issues.push(`[INCOME] Housewife has monthly_income=${p.monthly_income}`);
  if (['Doctor','Medical Officer','Dentist'].includes(prof) && p.monthly_income > 0 && p.monthly_income < 50000)
    issues.push(`[INCOME] ${prof} has unrealistically low income=${p.monthly_income}`);
  if (['Engineer','Software Developer','IT Professional'].includes(prof) && p.monthly_income > 0 && p.monthly_income < 25000)
    issues.push(`[INCOME] ${prof} has unrealistically low income=${p.monthly_income}`);
  if (edu === 'SSC' && p.monthly_income > 25000)
    issues.push(`[INCOME] SSC education but monthly_income=${p.monthly_income} seems high`);

  // --- HEIGHT ISSUES ---
  const heightInches = parseHeight(p.height);
  if (heightInches) {
    if (isFemale && heightInches > 68) // > 5'8"
      issues.push(`[HEIGHT] Female height=${p.height} unrealistically tall for Bangladeshi woman`);
    if (isFemale && heightInches < 56) // < 4'8"
      issues.push(`[HEIGHT] Female height=${p.height} unrealistically short`);
    if (isMale && heightInches > 74) // > 6'2"
      issues.push(`[HEIGHT] Male height=${p.height} unrealistically tall for Bangladeshi man`);
    if (isMale && heightInches < 58) // < 4'10"
      issues.push(`[HEIGHT] Male height=${p.height} unrealistically short`);
  }

  // --- WEIGHT ISSUES ---
  if (p.weight) {
    if (p.weight < 35)
      issues.push(`[WEIGHT] weight=${p.weight}kg dangerously underweight`);
    if (isFemale && p.weight > 90)
      issues.push(`[WEIGHT] Female weight=${p.weight}kg unrealistically heavy`);
    if (isMale && p.weight > 110)
      issues.push(`[WEIGHT] Male weight=${p.weight}kg unrealistically heavy`);
  }

  // --- NRB ISSUES ---
  if (p.nrb === true && p.country === 'Bangladesh')
    issues.push(`[NRB] nrb=true but country=Bangladesh`);
  if (p.nrb === false && p.nrb_country && p.nrb_country !== null && p.nrb_country !== '')
    issues.push(`[NRB] nrb=false but nrb_country=${p.nrb_country}`);

  // --- SIBLINGS ISSUES ---
  if (p.total_siblings !== null && p.total_siblings !== undefined) {
    const mb = p.married_brothers || 0;
    const ms = p.married_sisters || 0;
    if (mb + ms > p.total_siblings)
      issues.push(`[SIBLINGS] married_brothers(${mb}) + married_sisters(${ms}) > total_siblings(${p.total_siblings})`);
    if (p.total_siblings === 0 && (mb > 0 || ms > 0))
      issues.push(`[SIBLINGS] total_siblings=0 but married_brothers=${mb} or married_sisters=${ms}`);
  }

  // --- FAMILY STATUS CONTRADICTIONS ---

  // --- LOOKING FOR ISSUES ---
  if (isFemale && p.looking_for === 'bride')
    issues.push(`[GENDER] Female looking_for=bride (should be groom)`);
  if (isMale && p.looking_for === 'groom')
    issues.push(`[GENDER] Male looking_for=groom (should be bride)`);

  // --- ABOUT ME & PARTNER PREFERENCE ---
  if (!p.about_me || p.about_me.length < 20)
    issues.push(`[BIO] about_me missing or too short`);
  if (!p.partner_preference || p.partner_preference.length < 20)
    issues.push(`[BIO] partner_preference missing or too short`);

  // --- PROFILE COMPLETION ---
  if (!p.photo_url && p.profile_completion > 50)
    issues.push(`[COMPLETION] No photo but profile_completion=${p.profile_completion}`);

  return issues;
}

async function main() {
  console.log('🔍 Fetching all profiles...\n');

  const batch1 = await fetchBatch(0);
  const batch2 = await fetchBatch(200);
  const batch3 = await fetchBatch(400);

  const profiles = [...batch1, ...batch2, ...batch3];
  console.log(`📊 Total profiles fetched: ${profiles.length}\n`);

  const allIssues = {};
  const issueTypeCounts = {};

  for (const p of profiles) {
    const issues = checkProfile(p);
    if (issues.length > 0) {
      allIssues[p.id] = { name: p.full_name, gender: p.gender, age: p.age, issues };
      for (const issue of issues) {
        const type = issue.split(']')[0].replace('[', '');
        issueTypeCounts[type] = (issueTypeCounts[type] || 0) + 1;
      }
    }
  }

  // Summary
  console.log('╔════════════════════════════════════╗');
  console.log('║         ISSUE SUMMARY              ║');
  console.log('╚════════════════════════════════════╝');
  for (const [type, count] of Object.entries(issueTypeCounts).sort((a,b) => b[1]-a[1])) {
    console.log(`  ${type.padEnd(15)}: ${count} profiles`);
  }
  console.log(`\n  TOTAL profiles with issues: ${Object.keys(allIssues).length} / ${profiles.length}`);

  console.log('\n╔════════════════════════════════════╗');
  console.log('║         DETAILED LIST              ║');
  console.log('╚════════════════════════════════════╝');
  for (const [id, data] of Object.entries(allIssues)) {
    console.log(`\nID ${id} | ${data.name} | ${data.gender} | Age ${data.age}`);
    for (const issue of data.issues) {
      console.log(`  ⚠️  ${issue}`);
    }
  }

  console.log('\n✅ Check complete!');
}

main();
