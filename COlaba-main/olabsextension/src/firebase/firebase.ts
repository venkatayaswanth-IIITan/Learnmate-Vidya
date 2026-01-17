import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyCRYmeOcrEMAKVwJRMql3cYNFQvuu-rYj4",
  authDomain: "colab-website-44898.firebaseapp.com",
  projectId: "colab-website-44898",
  storageBucket: "colab-website-44898.firebasestorage.app",
  messagingSenderId: "925791201806",
  appId: "1:925791201806:web:43b3622a4a2eef61e86a5f",
  databaseURL: "https://colab-website-44898-default-rtdb.firebaseio.com/",
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

export { db,auth};
