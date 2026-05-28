import { auth, db } from './firebase.js';
import { signInWithEmailAndPassword, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc, serverTimestamp } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

async function ensureUserDoc(user) {
  try {
    await setDoc(doc(db, 'users', user.uid), {
      uid: user.uid,
      email: user.email,
      role: 'admin',
      name: user.email?.split('@')[0] || 'Admin',
      company: 'OFFICE RESTU HARMONI',
      lastLogin: serverTimestamp(),
      updatedAt: serverTimestamp()
    }, { merge: true });
  } catch (err) {
    console.warn('Auth login berjaya, tetapi Firestore user doc belum boleh ditulis:', err.code || err.message);
  }
}

export function protectPage() {
  onAuthStateChanged(auth, async user => {
    if (!user) {
      window.location.href = 'index.html';
      return;
    }
    await ensureUserDoc(user);
  });
}

export function setupLogout() {
  const logout = async () => {
    await signOut(auth);
    window.location.href = 'index.html';
  };

  document.querySelectorAll('#logoutBtn, #mobileLogoutBtn, .logout-btn, .mobile-logout-btn').forEach(btn => {
    btn.onclick = logout;
  });
}

export function currentUserLabel() {
  onAuthStateChanged(auth, user => {
    const box = document.getElementById('currentUserBox');
    if (box && user) box.textContent = 'Admin session active';
  });
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  onAuthStateChanged(auth, user => {
    if (user) window.location.href = 'dashboard.html';
  });

  loginForm.addEventListener('submit', async e => {
    e.preventDefault();
    const error = document.getElementById('loginError');
    error.textContent = '';

    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;

    try {
      const res = await signInWithEmailAndPassword(auth, email, password);
      await ensureUserDoc(res.user); // best effort only; tidak block login kalau Firestore belum ready
      window.location.href = 'dashboard.html';
    } catch (err) {
      console.error('Firebase login error:', err);
      const code = err.code || 'unknown-error';

      const messages = {
        'auth/invalid-credential': 'Email atau password salah, atau user belum dibuat di Firebase Authentication.',
        'auth/user-not-found': 'User belum wujud di Firebase Authentication.',
        'auth/wrong-password': 'Password salah.',
        'auth/invalid-email': 'Format email tidak sah.',
        'auth/operation-not-allowed': 'Email/Password Auth belum diaktifkan di Firebase.',
        'auth/unauthorized-domain': 'Domain website belum dimasukkan dalam Authorized domains Firebase.',
        'permission-denied': 'Login berjaya tetapi Firestore rules belum allow user login.'
      };

      error.textContent = `${messages[code] || 'Login gagal. Sila semak Firebase Console dan browser console.'} (${code})`;
    }
  });
}
