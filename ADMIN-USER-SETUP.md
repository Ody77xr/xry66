# Create Admin User - Two Methods

## 🎯 **Admin Credentials**
- **Email:** oodaguy14@gmail.com
- **Password:** xrMikrlo123$
- **Role:** admin
- **Subscription:** lifetime

---

## ✅ **Method 1: Using SQL Script (Recommended)**

### **Step 1: Run the SQL Script**
1. Go to Supabase Dashboard: https://app.supabase.com
2. Select your project
3. Click "SQL Editor" in the left sidebar
4. Click "New Query"
5. Copy the ENTIRE contents of `create-admin-user.sql`
6. Paste into the SQL editor
7. Click "Run" (or press Ctrl+Enter)
8. You should see: ✅ Admin user created successfully!

### **Step 2: Verify**
The script will automatically show you the user details at the end. You should see:
```
id: [some-uuid]
email: oodaguy14@gmail.com
username: admin
role: admin
subscription_tier: lifetime
is_active: true
```

### **Step 3: Test Login**
1. Go to your site
2. Try logging in with:
   - Email: oodaguy14@gmail.com
   - Password: xrMikrlo123$
3. You should be logged in as admin!

---

## ✅ **Method 2: Using Supabase Dashboard (Easier)**

If the SQL script doesn't work, use this method:

### **Step 1: Create User in Auth**
1. Go to Supabase Dashboard
2. Click "Authentication" in the left sidebar
3. Click "Users" tab
4. Click "Add User" button
5. Fill in:
   - **Email:** oodaguy14@gmail.com
   - **Password:** xrMikrlo123$
   - **Auto Confirm User:** ✅ Check this box
6. Click "Create User"
7. **IMPORTANT:** Copy the User ID (UUID) that appears

### **Step 2: Add User Profile**
1. Go to "SQL Editor"
2. Click "New Query"
3. Paste this SQL (replace `YOUR-USER-ID` with the UUID you copied):

```sql
-- Insert admin user profile
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
  'YOUR-USER-ID', -- Replace with the UUID from Step 1
  'oodaguy14@gmail.com',
  'admin',
  'Administrator',
  'admin',
  'lifetime',
  true,
  NOW(),
  NOW()
);

-- Verify
SELECT * FROM public.users WHERE email = 'oodaguy14@gmail.com';
```

4. Click "Run"
5. You should see your admin user profile

---

## 🔍 **Troubleshooting**

### **Error: "duplicate key value violates unique constraint"**
This means the user already exists. To fix:

1. Delete the existing user:
```sql
-- Delete from users table
DELETE FROM public.users WHERE email = 'oodaguy14@gmail.com';

-- Delete from auth.users table
DELETE FROM auth.users WHERE email = 'oodaguy14@gmail.com';
```

2. Then run the create script again

### **Error: "permission denied for table auth.users"**
This is normal - Supabase restricts direct access to auth.users. Use Method 2 (Dashboard) instead.

### **Can't log in after creating user**
1. Check that email is confirmed:
```sql
SELECT email, email_confirmed_at FROM auth.users WHERE email = 'oodaguy14@gmail.com';
```

2. If `email_confirmed_at` is NULL, confirm it:
```sql
UPDATE auth.users 
SET email_confirmed_at = NOW() 
WHERE email = 'oodaguy14@gmail.com';
```

### **User exists but not showing as admin**
Update the role:
```sql
UPDATE public.users 
SET role = 'admin', subscription_tier = 'lifetime'
WHERE email = 'oodaguy14@gmail.com';
```

---

## ✅ **Verification Checklist**

After creating the admin user, verify:

- [ ] User exists in Authentication → Users
- [ ] Email is confirmed (email_confirmed_at is set)
- [ ] User profile exists in public.users table
- [ ] Role is set to 'admin'
- [ ] Subscription tier is 'lifetime'
- [ ] Can log in with the credentials
- [ ] Can access admin features

---

## 🎯 **Next Steps After Admin User is Created**

1. ✅ Log in as admin
2. ✅ Test that you can access admin features
3. ✅ Start building the admin dashboard
4. ✅ Create test users for other tiers (free, VIP)
5. ✅ Upload test content

---

## 📝 **Quick Test**

To quickly test if your admin user works:

```sql
-- Check if user exists and has correct role
SELECT 
  u.id,
  u.email,
  u.username,
  u.role,
  u.subscription_tier,
  u.is_active,
  au.email_confirmed_at
FROM public.users u
JOIN auth.users au ON au.id = u.id
WHERE u.email = 'oodaguy14@gmail.com';
```

Expected result:
- email: oodaguy14@gmail.com
- username: admin
- role: admin
- subscription_tier: lifetime
- is_active: true
- email_confirmed_at: [some timestamp]

---

**Once your admin user is created, you're ready to start building! 🚀**
