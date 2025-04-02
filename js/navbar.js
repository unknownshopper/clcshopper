function createNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    navbar.innerHTML = `
        <nav class="navbar">
            <a href="index.html" class="nav-link">Inicio</a>
            <a href="evaluaciones.html" class="nav-link">Evaluaciones</a>
            <div class="nav-right">
                <span class="username">${localStorage.getItem('username') || ''}</span>
                <button onclick="window.logout()" class="nav-btn">Cerrar Sesión</button>
            </div>
        </nav>
    `;
}

document.addEventListener('DOMContentLoaded', createNavbar);