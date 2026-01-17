# Testing Signup and Login - Step by Step

## ⚠️ Before Testing

**IMPORTANT**: Make sure you have updated the Firebase security rules first!

If you haven't done this yet:
1. Go to https://console.firebase.google.com/project/vidya-ai-e04f6/firestore/rules
2. Update Firestore rules (see FIREBASE_RULES_SETUP.md)
3. Update Realtime Database rules (see FIREBASE_RULES_SETUP.md)
4. Publish both

---

## 🧪 Test 1: Signup with New Account

The signup page should now be open in your browser at: http://localhost:3000/signup

### Steps:
1. Enter the following test credentials:
   - **Email**: `testuser@example.com`
   - **Password**: `test123456`
   - **Confirm Password**: `test123456`

2. Click the **"Sign up"** button

### Expected Results:
✅ **Success**: You should be redirected to `/dashboard`
✅ **No Error**: You should NOT see "Failed to create account" error
✅ **Dashboard Loads**: You should see the Vidya AI dashboard

### If You See an Error:
❌ **"Failed to create account"** → Firebase rules not updated yet
❌ **"Email already in use"** → Try a different email (e.g., `testuser2@example.com`)
❌ **"Password must be at least 6 characters"** → Use a longer password

---

## 🧪 Test 2: Verify Database Entry

After successful signup:

1. Go to Firebase Console: https://console.firebase.google.com/project/vidya-ai-e04f6/firestore/data
2. Click on the **"points"** collection
3. You should see a document with your user's UID
4. The document should contain: `{ stars: 0 }`

---

## 🧪 Test 3: Logout and Login

1. In the dashboard, click your profile icon (top right)
2. Click **"Sign Out"**
3. You should be redirected to `/login`

4. Enter the same credentials:
   - **Email**: `testuser@example.com`
   - **Password**: `test123456`

5. Click **"Sign in"**

### Expected Results:
✅ **Success**: You should be redirected back to `/dashboard`
✅ **Points Display**: Your points (0 stars) should display correctly
✅ **No Errors**: No Firebase permission errors in browser console

---

## 🧪 Test 4: Check Browser Console

1. Open Browser DevTools (Press F12)
2. Go to the **Console** tab
3. Look for any errors

### Expected Results:
✅ **No Firebase Errors**: Should not see "Missing or insufficient permissions"
✅ **No Auth Errors**: Should not see authentication errors
✅ **Clean Console**: Minimal or no errors

---

## 📊 Test Results

After completing all tests, let me know:

1. ✅ or ❌ **Signup Test**: Did account creation work?
2. ✅ or ❌ **Database Test**: Was the points document created?
3. ✅ or ❌ **Login Test**: Did login work?
4. ✅ or ❌ **Console Test**: Any errors in browser console?

If any test fails, share the error message you see!

---

## 🔧 Troubleshooting

### Problem: "Failed to create account"
**Solution**: Firebase rules not updated. Go back and update Firestore rules.

### Problem: "Missing or insufficient permissions"
**Solution**: Realtime Database rules not updated. Update those rules too.

### Problem: Account created but dashboard shows errors
**Solution**: Check browser console for specific error messages.

### Problem: Can't access Firebase Console
**Solution**: Make sure you're logged in with the correct Google account that owns the project.
