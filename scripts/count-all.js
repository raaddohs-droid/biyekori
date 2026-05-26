const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bwxxctyakpexqfbtoolg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4'
);

async function countAll() {
  const { data: all } = await supabase.from('profiles').select('gender');
  
  const females = all.filter(p => p.gender === 'female' || p.gender === 'Female').length;
  const males = all.filter(p => p.gender === 'male' || p.gender === 'Male').length;
  
  console.log(`Total profiles: ${all.length}`);
  console.log(`FEMALE profiles: ${females}`);
  console.log(`MALE profiles: ${males}`);
}

countAll();