import { initializeApp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyAkDz6SAH1yhn8h6ekqb5v9gybzaR79jqY",
  authDomain: "department-62676.firebaseapp.com",
  projectId: "department-62676",
  storageBucket: "department-62676.firebasestorage.app",
  messagingSenderId: "478384580424",
  appId: "1:478384580424:web:ac2ac4277c060199d9357d"
};

export const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
