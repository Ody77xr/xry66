-- Create Admin User for Hxmp Space
-- Email: oodaguy14@gmail.com
-- Password: xrMikrlo123$
-- Run this ENTIRE script in Supabase SQL Editor

-- This script creates the admin user in one go
DO $$
DECLARE
  new_user_id UUID;
BEGIN
  -- Generate a new UUID for the user
  new_user_id := gen_random_uuid();
  
  -- Insert into auth.users (Supabase's authentication table)
  INSERT INTO auth.users (
    instance_id,
    id,
    aud,
    role,
    email,
    encrypted_password,
    email_confirmed_at,
    recovery_sent_at,
    last_sign_in_at,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at,
    updated_at,
    confirmation_token,
    email_change,
    email_change_token_new,
    recovery_token
  ) VALUES (
    '00000000-0000-0000-0000-000000000000',
    new_user_id,
    'authenticated',
    'authenticated',
    'oodaguy14@gmail.com',
    crypt('xrMikrlo123$', gen_salt('bf')),
    NOW(),
    NOW(),
    NOW(),
    '{"provider":"email","providers":["email"]}',
    '{}',
    NOW(),
    NOW(),
    '',
    '',
    '',
    ''
  );
  
  -- Insert into public.users table (your app's user profile)
  INSERT INTO public.users (
    id,
    email,
    username,
    display_name,
    role,
    subscription_tier,
    is_active,
    created_at,
    updated_at
  ) VALUES (
    new_user_id,
    'oodaguy14@gmail.com',
    'admin',
    'Administrator',
    'admin',
    'lifetime',
    true,
    NOW(),
    NOW()
  );
  
  -- Output success message
  RAISE NOTICE '✅ Admin user created successfully!';
  RAISE NOTICE 'Email: oodaguy14@gmail.com';
  RAISE NOTICE 'Password: xrMikrlo123$';
  RAISE NOTICE 'User ID: %', new_user_id;
END $$;

-- Verify the user was created
SELECT 
  id, 
  email, 
  username,
  role, 
  subscription_tier,
  is_active,
  created_at
FROM public.users 
WHERE email = 'oodaguy14@gmail.com';
