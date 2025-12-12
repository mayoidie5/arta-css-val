// Import the functions you need from the SDKs you need
import { initializeApp, getApps } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getFunctions } from "firebase/functions";

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: "AIzaSyAgZV5W_AauAn8X7r7kOjtIcjUSj0g_ISw",
  authDomain: "arta-a6d0f.firebaseapp.com",
  projectId: "arta-a6d0f",
  storageBucket: "arta-a6d0f.firebasestorage.app",
  messagingSenderId: "714515987128",
  appId: "1:714515987128:web:264b4a9f4c807a834d124d",
  measurementId: "G-RXZRSWQ14B"
};

// Initialize Firebase services
export const app = initializeApp(firebaseConfig);
export const analytics = getAnalytics(app);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);
export const functions = getFunctions(app);

// Create a separate Firebase app instance for user creation
// This ensures the admin's session is never affected
const createUserAppConfig = {
  ...firebaseConfig,
  appName: "createUserApp"
};

const existingApps = getApps();
const createUserAppExists = existingApps.some(a => a.name === "createUserApp");
export const createUserApp = createUserAppExists ? existingApps.find(a => a.name === "createUserApp")! : initializeApp(createUserAppConfig, "createUserApp");
export const createUserAuth = getAuth(createUserApp);

export default app;
