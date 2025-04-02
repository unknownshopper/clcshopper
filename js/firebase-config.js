import { initializeApp } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-app.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js";

const firebaseConfig = {
  apiKey: "AIzaSyBDhEs3STixAidT2l2LgXfe2yP46gjxuq8",
  authDomain: "clc-eval.firebaseapp.com",
  databaseURL: "https://clc-eval-default-rtdb.firebaseio.com",
  projectId: "clc-eval",
  storageBucket: "clc-eval.firebasestorage.app",
  messagingSenderId: "728904020352",
  appId: "1:728904020352:web:e655e4a503caedbb309165"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getDatabase(app);

export { auth, db };