const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bwxxctyakpexqfbtoolg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4'
);

async function checkMales() {
  // Count total males
  const { data: males, error } = await supabase
    .from('profiles')
    .select('id, full_name, photo_url, additional_photos')
    .eq('gender', 'male')
    .limit(10);
  
  if (error) {
    console.error('Error:', error);
    return;
  }
  
  console.log(`\n📊 Found ${males.length} male profiles (showing first 10):\n`);
  
  males.forEach((m, i) => {
    const additionalCount = m.additional_photos ? m.additional_photos.length : 0;
    const hasMainPhoto = m.photo_url ? '✅' : '❌';
    console.log(`${i+1}. ${m.full_name}`);
    console.log(`   Main photo: ${hasMainPhoto}`);
    console.log(`   Additional photos: ${additionalCount}`);
    console.log(`   ID: ${m.id}\n`);
  });
  
  // Count how many have additional photos
  const { data: withPhotos } = await supabase
    .from('profiles')
    .select('id')
    .eq('gender', 'male')
    .not('additional_photos', 'is', null);
    
  console.log(`Males with additional photos: ${withPhotos ? withPhotos.length : 0}`);
}

checkMales();