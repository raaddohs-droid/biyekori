const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'https://bwxxctyakpexqfbtoolg.supabase.co';
const STORAGE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4';

const photosDir = 'C:\\Users\\tehsi\\Desktop\\male_photos_batch2';

async function uploadPhoto(fileBuffer, fileName) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'bwxxctyakpexqfbtoolg.supabase.co',
      port: 443,
      path: `/storage/v1/object/profile-photos/${fileName}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${STORAGE_KEY}`,
        'Content-Type': 'image/jpeg',
        'Content-Length': fileBuffer.length
      }
    };

    const req = https.request(options, (res) => {
      res.on('data', () => {});
      res.on('end', () => resolve(res.statusCode === 200));
    });

    req.on('error', () => resolve(false));
    req.write(fileBuffer);
    req.end();
  });
}

async function upload() {
  console.log('\n🚀 Uploading 52 male photos...\n');
  
  const files = fs.readdirSync(photosDir)
    .filter(f => f.match(/\.(jpg|jpeg)$/i))
    .sort((a, b) => parseInt(a) - parseInt(b));
  
  console.log(`📸 Found ${files.length} photos\n`);
  
  for (let i = 0; i < files.length; i++) {
    const filename = files[i];
    const filepath = path.join(photosDir, filename);
    
    console.log(`${i+1}. Uploading ${filename}...`);
    
    const fileBuffer = fs.readFileSync(filepath);
    const newName = `male_batch2_${i+1}.jpg`;
    
    const success = await uploadPhoto(fileBuffer, newName);
    
    if (success) {
      console.log(`   ✅ Done`);
    } else {
      console.log(`   ❌ Failed`);
    }
    
    await new Promise(r => setTimeout(r, 500));
  }
  
  console.log(`\n🎉 Upload complete!\n`);
}

upload();