import { signInWithEmailAndPassword } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-auth.js';
import { auth } from './firebase-config.js';

document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('loginForm');
    if (!loginForm) {
        console.error('Login form not found');
        return;
    }

    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const username = document.getElementById('username').value;
        const password = document.getElementById('password').value;

        try {
            const userCredential = await signInWithEmailAndPassword(auth, username, password);
            console.log('Login successful:', userCredential);
            
            localStorage.setItem('isAuthenticated', 'true');
            localStorage.setItem('userRole', username.includes('admin') ? 'admin' : 'user');
            localStorage.setItem('username', username);
            
            window.location.href = 'evaluaciones.html';
        } catch (error) {
            console.error('Login error:', error);
            alert('Error: ' + error.message);
        }
    });
});

// Redirect if already authenticated
if (localStorage.getItem('isAuthenticated') === 'true') {
    window.location.href = 'evaluaciones.html';
}