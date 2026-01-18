# Firebase Database Setup Guide

## 🔴 Current Issue
The application is showing this error:
```
FirebaseError: Missing or insufficient permissions
```

This happens because Firebase Firestore has security rules that prevent unauthorized access by default.

## ✅ Solution: Configure Firebase Security Rules

You need to update your Firebase Firestore security rules to allow read/write access.

### Option 1: Development Mode (Quick Fix - NOT for Production)

**⚠️ WARNING: This allows anyone to read/write your database. Only use for development/testing!**

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: **colab-website-44898**
3. Click on **Firestore Database** in the left sidebar
4. Go to the **Rules** tab
5. Replace the rules with:

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

6. Click **Publish**

### Option 2: Secure Rules (Recommended for Production)

Use these rules to only allow authenticated users to access their own data:

```javascript
rules_version = '2';

service cloud.firestore {
  match /databases/{database}/documents {
    // Allow users to read/write their own points
    match /points/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Allow authenticated users to read/write groups
    match /groups/{groupId} {
      allow read, write: if request.auth != null;
    }
    
    // Allow authenticated users to read/write messages
    match /messages/{messageId} {
      allow read, write: if request.auth != null;
    }
  }
}
```

## 🔥 Firebase Realtime Database Rules

If you're also using Firebase Realtime Database, update those rules too:

1. Go to **Realtime Database** in Firebase Console
2. Click on the **Rules** tab
3. For development, use:

```json
{
  "rules": {
    ".read": true,
    ".write": true
  }
}
```

For production, use:
```json
{
  "rules": {
    ".read": "auth != null",
    ".write": "auth != null"
  }
}
```

## 🎯 After Updating Rules

1. Refresh your browser at http://localhost:3000
2. The "Missing or insufficient permissions" error should be gone
3. You should be able to sign up and log in successfully

## 📝 Your Firebase Project Details

- **Project ID:** vidya-ai-e04f6
- **Auth Domain:** vidya-ai-e04f6.firebaseapp.com
- **Database URL:** https://vidya-ai-e04f6-default-rtdb.firebaseio.com/

## 🔗 Quick Links

- [Firebase Console](https://console.firebase.google.com/project/vidya-ai-e04f6)
- [Firestore Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
