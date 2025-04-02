const users = {
    admin: { password: 'admin123', role: 'admin' },
    user: { password: 'user123', role: 'user' }
};

function handleLogin(event) {
    event.preventDefault();
    
    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    // Add username storage when logging in
    if (users[username] && users[username].password === password) {
        localStorage.setItem('isAuthenticated', 'true');
        localStorage.setItem('userRole', users[username].role);
        localStorage.setItem('username', username);  // Add this line
        window.location.href = 'evaluaciones.html';
    } else {
        alert('Usuario o contraseña incorrectos');
    }
}

// Redirect if already authenticated
if (localStorage.getItem('isAuthenticated') === 'true') {
    window.location.href = 'evaluaciones.html';
}