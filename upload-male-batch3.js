const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'bwxxctyakpexqfbtoolg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4';
const FOLDER = 'C:\\Users\\tehsi\\Desktop\\biyekori\\Male Batch 3';

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
  const files = fs.readdirSync(FOLDER).filter(f => {
    const ext = path.extname(f).toLowerCase();
    return ['.jpg', '.jpeg', '.png', '.webp'].includes(ext);
  });

  console.log(`📁 Found ${files.length} male photos to upload\n`);

  let success = 0, failed = 0;

  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const ext = path.extname(file).toLowerCase();
    const contentType = ext === '.png' ? 'image/png' : 'image/jpeg';
    const filePath = path.join(FOLDER, file);

    try {
      const fileBuffer = fs.readFileSync(filePath);
      const status = await uploadPhoto(fileBuffer, file, contentType);

      if (status === 200 || status === 201) {
        success++;
        if (success % 10 === 0) console.log(`✅ Uploaded ${success}/${files.length} — ${file}`);
      } else {
        failed++;
        console.log(`❌ Failed ${file} (status ${status})`);
      }
    } catch (err) {
      failed++;
      console.log(`❌ Error ${file}: ${err.message}`);
    }

    await new Promise(r => setTimeout(r, 100));
  }

  console.log(`\n🎉 DONE!`);
  console.log(`✅ Uploaded: ${success}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`🔗 Photos saved as male_batch3_1 to male_batch3_${success}`);
}

main();
