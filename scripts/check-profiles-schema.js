const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bwxxctyakpexqfbtoolg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BleHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4'
);

async function checkSchema() {
  // Check if additional_photos column exists
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .limit(1);
    
  if (data && data.length > 0) {
    console.log('Current profile structure:');
    console.log(Object.keys(data[0]));
    console.log('\nDoes additional_photos exist?', 'additional_photos' in data[0]);
  }
}

checkSchema();