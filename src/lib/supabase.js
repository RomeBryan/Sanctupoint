import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

const SUPABASE_URL = 'https://lqpobmezhhwacxqtqcpe.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxxcG9ibWV6aGh3YWN4cXRxY3BlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk1NzYyMzEsImV4cCI6MjA3NTE1MjIzMX0.J-1hcPet5jkJI8NUkdCpl4MSQQctI4LWQQBzc1ZeACc';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
