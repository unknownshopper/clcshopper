function createNavbar() {
    const navbar = document.getElementById('navbar');
    if (!navbar) return;

    navbar.innerHTML = `
        <nav class="navbar">
            <div class="nav-toggle">
                <span></span>
                <span></span>
                <span></span>
            </div>
            <div class="nav-links">
                <a href="home.html" class="nav-link">Inicio</a>
                <a href="sucursales.html" class="nav-link">Sucursales</a>
                <a href="evaluaciones.html" class="nav-link">Evaluaciones</a>
                <a href="graficas.html" class="nav-link">Gráficas</a>
            </div>
            <div class="nav-right">
                <span class="username">${localStorage.getItem('username') || ''}</span>
                <button onclick="window.logout()" class="nav-btn">Cerrar Sesión</button>
            </div>
        </nav>
    `;

    // Add toggle functionality
    const toggle = navbar.querySelector('.nav-toggle');
    const navLinks = navbar.querySelector('.nav-links');
    const navRight = navbar.querySelector('.nav-right');
    
    toggle.addEventListener('click', () => {
        navLinks.classList.toggle('active');
        navRight.classList.toggle('active');
        toggle.classList.toggle('active');
    });
}

document.addEventListener('DOMContentLoaded', createNavbar);