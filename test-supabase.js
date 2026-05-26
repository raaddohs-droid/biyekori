const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://yssmfvdbacojfnwysmtd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inlzc21mdmRiYWNvamZud3lzbXRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQzNTY5NTIsImV4cCI6MjA0OTkzMjk1Mn0.VEoro7w-BqEKKzAGdB98JnXE7tPKHP8c5bHO6aQqSlU';

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('Testing Supabase connection...');
  const { data, error } = await supabase.from('profiles').select('*').limit(1);
  
  if (error) {
    console.error('Error:', error);
  } else {
    console.log('Success! Data:', data);
  }
}

test();