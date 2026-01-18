import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';



const firebaseConfig = {
  apiKey: "AIzaSyBYR_p_09sswW5_jWRPlo5iVqnhOb70BRw",
  authDomain: "vidya-ai-e04f6.firebaseapp.com",
  projectId: "vidya-ai-e04f6",
  storageBucket: "vidya-ai-e04f6.firebasestorage.app",
  messagingSenderId: "1048612108632",
  appId: "1:1048612108632:web:4ae3b15299e8f907080d2d",
  databaseURL: "https://vidya-ai-e04f6-default-rtdb.firebaseio.com/",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
export const db = getFirestore(app);
export const rtdb = getDatabase(app);

export { auth };