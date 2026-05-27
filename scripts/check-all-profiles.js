const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabase = createClient(
  'https://bwxxctyakpexqfbtoolg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4'
);

const PHOTOS_DIR = 'C:\\Users\\tehsi\\Desktop\\male_photos';

async function uploadPhotos() {
  console.log('\n🚀 Uploading male photos...\n');
  
  // Get 17 male profiles without photos
  const { data: males, error } = await supabase
    .from('profiles')
    .select('id, full_name')
    .eq('gender', 'Male')
    .is('photo_url', null)
    .limit(17);
  
  if (error) {
    console.error('❌ Error:', error);
    return;
  }
  
  console.log(`📊 Found ${males.length} males without photos\n`);
  
  // Get photo files
  const files = fs.readdirSync(PHOTOS_DIR)
    .filter(f => f.match(/\.(jpg|jpeg|png)$/i))
    .sort();
  
  console.log(`📸 Found ${files.length} photos\n`);
  
  for (let i = 0; i < Math.min(males.length, files.length); i++) {
    const male = males[i];
    const filename = files[i];
    const filepath = path.join(PHOTOS_DIR, filename);
    
    console.log(`${i+1}. Uploading for ${male.full_name}...`);
    
    // Read file
    const fileBuffer = fs.readFileSync(filepath);
    const fileExt = path.extname(filename);
    const newFilename = `male_${male.id}${fileExt}`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('profile-photos')
      .upload(newFilename, fileBuffer, {
        contentType: `image/${fileExt.slice(1)}`,
        upsert: true
      });
    
    if (uploadError) {
      console.error(`   ❌ Upload failed:`, uploadError.message);
      continue;
    }
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('profile-photos')
      .getPublicUrl(newFilename);
    
    // Update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ photo_url: publicUrl })
      .eq('id', male.id);
    
    if (updateError) {
      console.error(`   ❌ Database update failed:`, updateError.message);
    } else {
      console.log(`   ✅ Success! Photo assigned to ${male.full_name}`);
    }
  }
  
  console.log('\n🎉 Done!\n');
}

uploadPhotos()
  .then(() => process.exit(0))
  .catch(err => {
    console.error('❌ Failed:', err);
    process.exit(1);
  });