const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  'https://bwxxctyakpexqfbtoolg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4'
);

async function uploadPhotos() {
  console.log('\n🚀 Uploading 52 male photos...\n');
  
  const photosDir = 'C:\\Users\\tehsi\\Desktop\\male_photos_batch2';
  
  // Get 52 males without photos
  const { data: males } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('gender', 'Male')
    .is('photo_url', null)
    .limit(52);
  
  console.log(`📊 Found ${males.length} males without photos\n`);
  
  // Get files
  const files = fs.readdirSync(photosDir)
    .filter(f => f.match(/\.(jpg|jpeg|png)$/i))
    .sort((a, b) => {
      const numA = parseInt(a);
      const numB = parseInt(b);
      return numA - numB;
    });
  
  console.log(`📸 Found ${files.length} photos\n`);
  
  let uploaded = 0;
  
  for (let i = 0; i < Math.min(males.length, files.length); i++) {
    const male = males[i];
    const filename = files[i];
    const filepath = path.join(photosDir, filename);
    
    console.log(`${i+1}. Uploading for ${male.full_name}...`);
    
    const fileBuffer = fs.readFileSync(filepath);
    const ext = path.extname(filename);
    const newName = `male_${male.id}${ext}`;
    
    const { error: uploadErr } = await supabase.storage
      .from('profile-photos')
      .upload(newName, fileBuffer, { upsert: true });
    
    if (uploadErr) {
      console.log(`   ❌ ERROR: ${uploadErr.message}`);
      continue;
    }
    
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(newName);
    
    const { error: updateErr } = await supabase
      .from('profiles')
      .update({ photo_url: publicUrl })
      .eq('id', male.id);
    
    if (updateErr) {
      console.log(`   ❌ Update ERROR: ${updateErr.message}`);
    } else {
      uploaded++;
      console.log(`   ✅ Done`);
    }
  }
  
  console.log(`\n🎉 Successfully uploaded ${uploaded} photos!\n`);
}

uploadPhotos()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Failed:', err);
    process.exit(1);
  });