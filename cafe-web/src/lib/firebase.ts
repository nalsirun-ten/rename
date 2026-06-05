import { initializeApp } from "firebase/app";
import { getMessaging, isSupported } from "firebase/messaging";

const firebaseConfig = {
  projectId: "dentapp-18e25",
  appId: "1:951534054649:web:8343a366615807a4a44628",
  storageBucket: "dentapp-18e25.firebasestorage.app",
  apiKey: "AIzaSyBP6nTP_3gXXzmuWnpINNCQLbQIihMd7bo",
  authDomain: "dentapp-18e25.firebaseapp.com",
  messagingSenderId: "951534054649",
  measurementId: "G-7BDTPNQ7G3",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Cloud Messaging and get a reference to the service
export const messaging = async () => {
  const supported = await isSupported();
  if (supported) {
    return getMessaging(app);
  }
  return null;
};

// VAPID KEY: From Firebase Console
export const VAPID_KEY = 'BG1QzC4XRRD4TCtA6HbZ2WJsC77pwEUKUsPiK5cel4SQbAQgl-gtz1qPCoWLp9_eo4_1ByDHqNocWJnyNujcJyY';
