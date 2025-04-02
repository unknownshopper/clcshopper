function createNavbar() {
    const navbar = document.createElement('nav');
    navbar.className = 'navbar';
    
    const userRole = localStorage.getItem('userRole');
    const username = localStorage.getItem('username');
    
    navbar.innerHTML = `
        <div class="nav-brand">CLC Evaluaciones</div>
        <div class="nav-links">
            ${userRole ? `
                <span class="user-info">Usuario: ${username} (${userRole})</span>
                <a href="evaluaciones.html">Evaluaciones</a>
                <button onclick="logout()" class="nav-btn">Cerrar Sesión</button>
            ` : ''}
        </div>
    `;
    
    document.body.insertBefore(navbar, document.body.firstChild);
}

document.addEventListener('DOMContentLoaded', createNavbar);