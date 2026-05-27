const https = require('https');
const fs = require('fs');
const path = require('path');

const SUPABASE_URL = 'bwxxctyakpexqfbtoolg.supabase.co';
const ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4';

const photosDir = 'C:\\Users\\tehsi\\Desktop\\male_photos_batch2';

// Get males without photos
function getMales() {
  return new Promise((resolve) => {
    const options = {
      hostname: SUPABASE_URL,
      path: `/rest/v1/profiles?select=id,full_name&gender=eq.Male&photo_url=is.null&limit=52`,
      method: 'GET',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`
      }
    };

    https.get(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          resolve([]);
        }
      });
    }).on('error', () => resolve([]));
  });
}

// Update profile with photo URL
function updateProfile(id, photoUrl) {
  return new Promise((resolve) => {
    const body = JSON.stringify({ photo_url: photoUrl });
    
    const options = {
      hostname: SUPABASE_URL,
      path: `/rest/v1/profiles?id=eq.${id}`,
      method: 'PATCH',
      headers: {
        'apikey': ANON_KEY,
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'application/json',
        'Content-Length': body.length
      }
    };

    const req = https.request(options, (res) => {
      res.on('data', () => {});
      res.on('end', () => resolve(res.statusCode === 204 || res.statusCode === 200));
    });

    req.on('error', () => resolve(false));
    req.write(body);
    req.end();
  });
}

async function uploadAndLink() {
  console.log('\n🚀 Uploading 52 photos and linking to profiles...\n');
  
  const males = await getMales();
  console.log(`📊 Found ${males.length} males without photos\n`);
  
  const files = fs.readdirSync(photosDir)
    .filter(f => f.match(/\.(jpg|jpeg|png)$/i))
    .sort((a, b) => parseInt(a) - parseInt(b));
  
  console.log(`📸 Found ${files.length} photos\n`);
  
  let updated = 0;
  
  for (let i = 0; i < Math.min(males.length, files.length); i++) {
    const male = males[i];
    const filename = files[i];
    const filepath = path.join(photosDir, filename);
    
    console.log(`${i+1}. ${male.full_name}...`);
    
    const fileBuffer = fs.readFileSync(filepath);
    const ext = path.extname(filename);
    const storageName = `male_${male.id}${ext}`;
    
    // Upload to storage
    const uploadOptions = {
      hostname: SUPABASE_URL,
      path: `/storage/v1/object/profile-photos/${storageName}`,
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${ANON_KEY}`,
        'Content-Type': 'image/jpeg',
        'Content-Length': fileBuffer.length
      }
    };

    await new Promise((resolve) => {
      const req = https.request(uploadOptions, (res) => {
        res.on('data', () => {});
        res.on('end', () => resolve());
      });
      req.on('error', () => resolve());
      req.write(fileBuffer);
      req.end();
    });

    // Get public URL
    const publicUrl = `https://${SUPABASE_URL}/storage/v1/object/public/profile-photos/${storageName}`;
    
    // Update database
    const success = await updateProfile(male.id, publicUrl);
    
    if (success) {
      updated++;
      console.log(`   ✅ Linked`);
    } else {
      console.log(`   ❌ Failed to link`);
    }
    
    await new Promise(r => setTimeout(r, 300));
  }
  
  console.log(`\n🎉 Updated ${updated} profiles!\n`);
}

uploadAndLink();