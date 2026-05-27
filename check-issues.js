const https = require('https');

const SUPABASE_URL = 'bwxxctyakpexqfbtoolg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4';

function fetchAll(path) {
  return new Promise((resolve) => {
    const opts = {
      hostname: SUPABASE_URL,
      path,
      method: 'GET',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Range': '0-999'
      }
    };
    https.get(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(JSON.parse(data)));
    });
  });
}

async function main() {
  console.log('Fetching all profiles...');
  
  const batch1 = await fetchAll('/rest/v1/profiles?select=id,full_name,gender,age,religion,diet,wears_hijab,marital_status,expected_age_min,expected_age_max,expected_income,monthly_income,prayer_habit,partner_preference,looking_for,has_beard&order=id.asc&limit=500&offset=0');
  const batch2 = await fetchAll('/rest/v1/profiles?select=id,full_name,gender,age,religion,diet,wears_hijab,marital_status,expected_age_min,expected_age_max,expected_income,monthly_income,prayer_habit,partner_preference,looking_for,has_beard&order=id.asc&limit=500&offset=500');
  
  const profiles = [...batch1, ...batch2];
  console.log(`Total profiles fetched: ${profiles.length}\n`);

  const issues = {};

  for (const p of profiles) {
    const pIssues = [];

    // 1. Diet vs Religion mismatch
    if (p.religion !== 'Islam' && p.diet === 'Halal') {
      pIssues.push(`Diet=Halal but religion=${p.religion}`);
    }

    // 2. Hijab for non-Muslim
    if (p.religion !== 'Islam' && p.wears_hijab === true) {
      pIssues.push(`wears_hijab=true but religion=${p.religion}`);
    }

    // 3. Prayer habit for non-Muslim saying namaz
    if (p.religion !== 'Islam' && p.prayer_habit && (p.prayer_habit.toLowerCase().includes('namaz') || p.prayer_habit.toLowerCase().includes('daily'))) {
      pIssues.push(`prayer_habit mentions namaz but religion=${p.religion}`);
    }

    // 4. Partner preference mentions namaz for non-Muslim
    if (p.religion !== 'Islam' && p.partner_preference && p.partner_preference.includes('নামাজি')) {
      pIssues.push(`partner_preference mentions নামাজি but religion=${p.religion}`);
    }

    // 5. Expected age logic
    if (p.expected_age_min !== null && p.age !== null) {
      if (p.gender === 'female' || p.gender === 'Female') {
        // Female should want older men
        if (p.marital_status === 'Never Married' && p.expected_age_min < p.age) {
          pIssues.push(`Age=${p.age} Never Married female but expected_age_min=${p.expected_age_min} (younger than her)`);
        }
        if (p.marital_status === 'Never Married' && p.expected_age_min < p.age + 2) {
          pIssues.push(`Age=${p.age} female wants min age ${p.expected_age_min} — too close/young`);
        }
      }
      if (p.gender === 'male' || p.gender === 'Male') {
        // Male should want younger women
        if (p.expected_age_min > p.age) {
          pIssues.push(`Age=${p.age} male but expected_age_min=${p.expected_age_min} (older than him)`);
        }
      }
    }

    // 6. Expected income not rounded
    if (p.expected_income && p.expected_income % 500 !== 0) {
      pIssues.push(`expected_income=${p.expected_income} not rounded`);
    }

    // 7. Monthly income not rounded
    if (p.monthly_income && p.monthly_income > 0 && p.monthly_income % 500 !== 0) {
      pIssues.push(`monthly_income=${p.monthly_income} not rounded`);
    }

    // 8. Male with wears_hijab
    if ((p.gender === 'male' || p.gender === 'Male') && p.wears_hijab === true) {
      pIssues.push(`Male profile has wears_hijab=true`);
    }

    // 9. has_beard for females
    if ((p.gender === 'female' || p.gender === 'Female') && p.has_beard === true) {
      pIssues.push(`Female profile has has_beard=true`);
    }

    // 10. looking_for logic
    if ((p.gender === 'female' || p.gender === 'Female') && p.looking_for === 'bride') {
      pIssues.push(`Female looking_for=bride (should be groom)`);
    }
    if ((p.gender === 'male' || p.gender === 'Male') && p.looking_for === 'groom') {
      pIssues.push(`Male looking_for=groom (should be bride)`);
    }

    if (pIssues.length > 0) {
      issues[p.id] = { name: p.full_name, gender: p.gender, issues: pIssues };
    }
  }

  // Summary
  const issueTypes = {};
  for (const id in issues) {
    for (const issue of issues[id].issues) {
      const key = issue.split('=')[0].split(' ')[0];
      issueTypes[key] = (issueTypes[key] || 0) + 1;
    }
  }

  console.log('=== ISSUE SUMMARY ===');
  for (const [type, count] of Object.entries(issueTypes)) {
    console.log(`  ${type}: ${count} profiles affected`);
  }

  console.log(`\n=== TOTAL PROFILES WITH ISSUES: ${Object.keys(issues).length} ===\n`);

  console.log('=== DETAILED LIST ===');
  for (const [id, data] of Object.entries(issues)) {
    console.log(`\nID ${id} | ${data.name} | ${data.gender}`);
    for (const issue of data.issues) {
      console.log(`  ⚠️  ${issue}`);
    }
  }
}

main();
