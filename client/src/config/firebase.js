// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyC-MQzkbBGBe-kjtlXe69YPpPpxuNvI-S8",
  authDomain: "instant-24356.firebaseapp.com",
  projectId: "instant-24356",
  storageBucket: "instant-24356.firebasestorage.app",
  messagingSenderId: "12858877154",
  appId: "1:12858877154:web:4925dec03ef117d448eabb",
  measurementId: "G-HJHGK93DW8"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const auth = getAuth(app);

export { auth };