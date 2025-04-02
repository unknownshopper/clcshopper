import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { db } from './firebase-config.js';

const auth = getAuth();

document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const userCredential = await signInWithEmailAndPassword(auth, username, password);
        const user = userCredential.user;
        
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', user.email.includes('admin') ? 'admin' : 'user');
        localStorage.setItem('username', username);
        
        window.location.href = 'evaluaciones.html';
    } catch (error) {
        console.error('Login error:', error);
        alert('Usuario o contraseña incorrectos');
    }
});

// Redirect if already authenticated
if (localStorage.getItem('isAuthenticated') === 'true') {
    window.location.href = 'evaluaciones.html';
}