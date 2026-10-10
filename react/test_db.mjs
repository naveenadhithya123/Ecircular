import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://cxngxvcgkvpbpvdhbfjs.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bmd4dmNna3ZwYnB2ZGhiZmpzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2NDg2MTUsImV4cCI6MjEwNzIyNDYxNX0.0X0heV1LkBU69uEPrFBNTBOKxPN5DFyL43s1PnpGUMM';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function testConnection() {
  console.log('Testing connection to Supabase...');
  
  // Test 1: Check if circulars table exists and is accessible
  const { data: circulars, error: circError } = await supabase.from('circulars').select('id').limit(1);
  if (circError) {
    console.error('Failed to query circulars table:', circError);
  } else {
    console.log('✅ circulars table exists and is accessible.');
  }

  // Test 2: Check if profiles table exists
  const { data: profiles, error: profError } = await supabase.from('profiles').select('id').limit(1);
  if (profError) {
    console.error('Failed to query profiles table:', profError.message);
  } else {
    console.log('✅ profiles table exists and is accessible.');
  }
}

testConnection();
