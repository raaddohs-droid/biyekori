const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'bwxxctyakpexqfbtoolg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4';
const FOLDER = 'C:\\Users\\tehsi\\Desktop\\biyekori\\female batch 3';

function uploadPhoto(fileBuffer, filename, contentType) {
  return new Promise((resolve) => {
    const opts = {
      hostname: SUPABASE_URL,
      path: `/storage/v1/object/profile-photos/${filename}`,
      method: 'POST',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': contentType,
        'Content-Length': fileBuffer.length,
        'x-upsert': 'true'
      }
    };
    const req = https.request(opts, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(res.statusCode));
    });
    req.on('error', () => resolve(0));
    req.write(fileBuffer);
    req.end();
  });
}

async function main() {
  // Get all image files
  const allFiles = fs.readdirSync(FOLDER).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  });

  console.log(`📁 Found ${allFiles.length} photos in batch 3\n`);

  let success = 0;
  let failed = 0;
  const uploaded = [];

  for (let i = 0; i < allFiles.length; i++) {
    const originalFile = allFiles[i];
    const ext = path.extname(originalFile).toLowerCase();
    const newName = `female_batch3_${i + 1}${ext}`;
    const filePath = path.join(FOLDER, originalFile);
    const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const status = await uploadPhoto(fileBuffer, newName, contentType);

      if (status === 200 || status === 201) {
        success++;
        uploaded.push(newName);
        if (success % 20 === 0) {
          console.log(`✅ Uploaded ${success}/${allFiles.length} — latest: ${newName}`);
        }
      } else {
        failed++;
        console.log(`❌ Failed ${newName} (status ${status})`);
      }
    } catch (err) {
      failed++;
      console.log(`❌ Error ${newName}: ${err.message}`);
    }

    // Small delay to avoid rate limiting
    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n🎉 DONE!`);
  console.log(`✅ Uploaded: ${success}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`\n📸 Photos uploaded as female_batch3_1 to female_batch3_${success}`);
  console.log(`🔗 Base URL: https://bwxxctyakpexqfbtoolg.supabase.co/storage/v1/object/public/profile-photos/`);
}

main();
