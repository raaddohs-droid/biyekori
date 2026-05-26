const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bwxxctyakpexqfbtoolg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4'
);

async function assignPhotos() {
  console.log('Fetching photos from storage bucket...');
  
  const { data: photos, error: photoError } = await supabase
    .storage
    .from('profile-photos')
    .list();

  if (photoError) {
    console.error('Error fetching photos:', photoError);
    return;
  }

  console.log(`Found ${photos.length} photos in bucket`);

  // Get female profiles WITHOUT photos (both "female" and "Female")
  const { data: profiles, error: profileError } = await supabase
    .from('profiles')
    .select('id, photo_url, gender, full_name')
    .or('gender.eq.female,gender.eq.Female')
    .is('photo_url', null);

  if (profileError) {
    console.error('Error fetching profiles:', profileError);
    return;
  }

  console.log(`Found ${profiles.length} female profiles without photos\n`);

  let updated = 0;
  for (let i = 0; i < Math.min(profiles.length, photos.length); i++) {
    const profile = profiles[i];
    const photo = photos[i];
    
    const photoUrl = `https://bwxxctyakpexqfbtoolg.supabase.co/storage/v1/object/public/profile-photos/${photo.name}`;
    
    const { error: updateError } = await supabase
      .from('profiles')
      .update({ photo_url: photoUrl })
      .eq('id', profile.id);

    if (updateError) {
      console.error(`Error updating profile ${profile.id}:`, updateError);
    } else {
      updated++;
      console.log(`✓ Assigned ${photo.name} to ${profile.full_name || profile.id}`);
    }
  }

  console.log(`\n🎉 Successfully assigned ${updated} photos to female profiles!`);
}

assignPhotos();