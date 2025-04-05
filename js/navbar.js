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
            <div class="nav-menu mobile-menu">
                <div class="nav-links">
                    <a href="home.html" class="nav-link">Inicio</a>
                    <a href="sucursales.html" class="nav-link">Sucursales</a>
                    <a href="evaluaciones.html" class="nav-link">Evaluaciones</a>
                </div>
            </div>
        </nav>
    `;

    const toggle = navbar.querySelector('.nav-toggle');
    const navMenu = navbar.querySelector('.nav-menu');
    
    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        navMenu.classList.toggle('active');
    });
}

document.addEventListener('DOMContentLoaded', createNavbar);