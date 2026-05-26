const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(
  'https://bwxxctyakpexqfbtoolg.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ3eHhjdHlha3BveHFmYnRvb2xnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkwMDY0OTYsImV4cCI6MjA5NDU4MjQ5Nn0.034YBMbkx3Eco-oBPfJDelLjnbOk9uHZJoOPxhogNM4'
);

async function deleteUser() {
  const phone = '01733577215';
  
  console.log(`Deleting user with phone: ${phone}`);
  
  const { data, error } = await supabase
    .from('profiles')
    .delete()
    .eq('phone', phone);
    
  if (error) {
    console.error('Error:', error);
  } else {
    console.log(`✅ Deleted user with phone ${phone}`);
  }
}

deleteUser();