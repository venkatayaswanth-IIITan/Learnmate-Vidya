# Firebase Security Rules Setup - Quick Guide

## 🔥 Step 1: Update Firestore Rules

You should now have the Firebase Console open in your browser.

### Copy this code for Firestore (Development Mode):

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### Steps:
1. In the Firebase Console, you should see the **Firestore Database → Rules** page
2. **Delete all existing rules** in the editor
3. **Paste the code above**
4. Click **"Publish"** button (top right)
5. Wait for the success message

---

## 🔥 Step 2: Update Realtime Database Rules

### Open Realtime Database Rules:
1. In Firebase Console left sidebar, click **"Realtime Database"**
2. Click the **"Rules"** tab

### Copy this code for Realtime Database (Development Mode):

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

### Steps:
1. **Delete all existing rules** in the editor
2. **Paste the code above**
3. Click **"Publish"** button
4. Wait for the success message

---

## ✅ Step 3: Test Signup

After publishing both rules:

1. Go to: http://localhost:3000/signup
2. Enter test credentials:
   - Email: `test@example.com`
   - Password: `test123456`
   - Confirm Password: `test123456`
3. Click **"Sign Up"**

**Expected Result**: Account created successfully and redirected to dashboard!

---

## ⚠️ Important Notes

- These rules are for **DEVELOPMENT ONLY**
- They allow anyone to read/write your database
- For production, you'll need secure authentication-based rules
- Let me know once you've published the rules so we can test!
