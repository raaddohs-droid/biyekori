const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bwxxctyakpexqfbtoolg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4'
);

async function checkProfiles() {
  // Check all profiles
  const { data: allProfiles } = await supabase
    .from('profiles')
    .select('id, gender, photo_url');

  console.log(`Total profiles: ${allProfiles.length}`);
  
  const femaleCount = allProfiles.filter(p => p.gender === 'female').length;
  const maleCount = allProfiles.filter(p => p.gender === 'male').length;
  const withPhotos = allProfiles.filter(p => p.photo_url).length;
  const withoutPhotos = allProfiles.filter(p => !p.photo_url).length;

  console.log(`Female profiles: ${femaleCount}`);
  console.log(`Male profiles: ${maleCount}`);
  console.log(`Profiles WITH photos: ${withPhotos}`);
  console.log(`Profiles WITHOUT photos: ${withoutPhotos}`);
  
  // Show first 5 profiles
  console.log('\nFirst 5 profiles:');
  allProfiles.slice(0, 5).forEach(p => {
    console.log(`- ID: ${p.id}, Gender: ${p.gender}, Has Photo: ${!!p.photo_url}`);
  });
}

checkProfiles();