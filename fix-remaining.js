const https = require('https');

const SUPABASE_URL = 'bwxxctyakpexqfbtoolg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4';

function deleteProfile(id) {
  return new Promise((resolve) => {
    const opts = {
      hostname: SUPABASE_URL,
      path: `/rest/v1/profiles?id=eq.${id}`,
      method: 'DELETE',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Prefer': 'return=minimal'
      }
    };
    const req = https.request(opts, (res) => {
      res.on('data', () => {});
      res.on('end', () => resolve(res.statusCode));
    });
    req.on('error', () => resolve(0));
    req.end();
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

async function main() {
  console.log('🔧 Fixing remaining issues...\n');

  // 1. DELETE test/dummy profiles
  const toDelete = [1, 175, 178, 179];
  console.log('🗑️  Deleting test profiles...');
  for (const id of toDelete) {
    const status = await deleteProfile(id);
    console.log(status === 204 || status === 200
      ? `  ✅ Deleted ID ${id}`
      : `  ❌ Failed to delete ID ${id} (status ${status})`);
    await new Promise(r => setTimeout(r, 200));
  }

  // 2. FIX AGE-EDU: change Bachelor's to HSC for age 18-20
  const ageEduFixes = [413, 416, 449, 469, 476, 504, 531, 538];
  console.log('\n📚 Fixing education vs age issues...');
  for (const id of ageEduFixes) {
    const status = await updateProfile(id, { education: 'HSC' });
    console.log(status === 204 || status === 200
      ? `  ✅ Fixed education ID ${id}`
      : `  ❌ Failed ID ${id} (status ${status})`);
    await new Promise(r => setTimeout(r, 200));
  }

  // 3. FIX ID 157 - Xiulan Akter - add partner preference
  console.log('\n✍️  Adding partner preference for ID 157...');
  const status157 = await updateProfile(157, {
    partner_preference: 'আমি এমন একজন জীবনসঙ্গী চাই যিনি সৎ, পরিশ্রমী এবং পারিবারিক মূল্যবোধসম্পন্ন হবেন। ধার্মিক ও দায়িত্বশীল পাত্র পছন্দ করব। পরিবারকে ভালোবাসেন এবং মা-বাবাকে সম্মান করেন এমন মানুষই আমার আদর্শ।'
  });
  console.log(status157 === 204 || status157 === 200
    ? '  ✅ Fixed ID 157'
    : `  ❌ Failed ID 157 (status ${status157})`);

  console.log('\n🎉 All done! Run check-all-issues.js to verify — should be 0 issues!');
}

main();
