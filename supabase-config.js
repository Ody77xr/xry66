// Supabase Configuration
const supabaseConfig = {
    url: 'https://iqyauoezuuuohwhmxnkh.supabase.co',
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxeWF1b2V6dXV1b2h3aG14bmtoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2ODE5NTEsImV4cCI6MjA3NjI1Nzk1MX0.SFQ6v0VDIkO7sRp_DLgT1G8vMd6zh1q_COTZLZHtSPw',
    projectId: 'iqyauoezuuuohwhmxnkh',
    options: {
        auth: {
            autoRefreshToken: true,
            persistSession: true,
            detectSessionInUrl: true
        }
    }
};

// Service role key (NEVER expose this in client-side code - use only in secure server-side operations)
// const SUPABASE_SERVICE_ROLE_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImlxeWF1b2V6dXV1b2h3aG14bmtoIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MDY4MTk1MSwiZXhwIjoyMDc2MjU3OTUxfQ.E6dpJnfF1sJcAw5PuEA85ed3uqOxA0h1K-qc9n9IQkk';
