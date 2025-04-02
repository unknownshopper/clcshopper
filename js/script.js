import { ref, get, onValue } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js';
import { db } from './firebase-config.js';

const evaluationCriteria = [
    'Bienvenida', 'Conocimiento', 'Producto del mes', 'PIN', 
    'Limpieza y apariencia', 'TABLETA', 'Esfuerzo de venta', 
    'Tocaron mesa', 'APP', 'Se entregó el ticket', 'Despedida',
    'Fachada', 'Letrero', 'Jardineras', 'Iluminación interior',
    'Puertas y vidrios', 'Audio', 'Mostrador', 'Sillas y mesas',
    'Piso limpio', 'Baños limpios', 'Botes de basura', 'Contrabarras',
    'Paneras limpias y ordenadas', 'Presentación del café',
    'Montaje de alimentos', 'Tiempo total de espera de atención',
    'Tiempo total de la fila', 'Tiempo de espera para el café',
    'Cantidad de colaboradores', 'Vaso marcado'
];

const sucursales = [
    'Altabrisa', 'Américas', 'Ángeles', 'Centro', 'Cristal', 
    'Galerías', 'Deportiva', 'Guayabal', 'Olmeca', 'Pista de Hielo',
    'Usuma', 'Móvil Deportiva', 'Móvil la Venta', 'Walmart Carrizal',
    'Walmart Deportiva', 'Walmart Universidad'
];

document.addEventListener('DOMContentLoaded', async () => {
    const sucursalesList = document.getElementById('sucursalesList');
    if (!sucursalesList) return;

    // Create sucursales list
    for (const sucursal of sucursales) {
        const li = document.createElement('li');
        const snapshot = await get(ref(db, `scores/${sucursal}`));
        const scores = snapshot.val() || {};
        const currentScore = calculateTotal(scores);
        
        li.innerHTML = `
            <h3>
                ${sucursal}
                <span class="sucursal-score">${currentScore}/62</span>
            </h3>`;
        li.addEventListener('click', () => loadEvaluation(li, sucursal));
        sucursalesList.appendChild(li);
    }

    // Add Show All button
    const showAllButton = document.createElement('button');
    showAllButton.textContent = 'Mostrar Todas las Evaluaciones';
    showAllButton.className = 'show-all-btn';
    sucursalesList.after(showAllButton);

    showAllButton.addEventListener('click', () => {
        window.location.href = 'evaluaciones.html';
    });

    // Set up real-time updates
    onValue(ref(db, 'scores'), (snapshot) => {
        const scores = snapshot.val() || {};
        document.querySelectorAll('.sucursal-score').forEach(scoreElement => {
            const sucursal = scoreElement.closest('h3').textContent.trim().split('/')[0].trim();
            const currentScore = calculateTotal(scores[sucursal] || {});
            scoreElement.textContent = `${currentScore}/62`;
        });
    });
});

async function loadEvaluation(li, sucursal) {
    const existingGrid = li.querySelector('.evaluation-grid');
    const allGrids = document.querySelectorAll('.evaluation-grid');
    
    allGrids.forEach(grid => grid.remove());
    
    if (existingGrid) {
        existingGrid.remove();
        return;
    }

    const grid = document.createElement('div');
    grid.className = 'evaluation-grid';
    grid.style.display = 'grid';

    // Get scores from Firebase
    const snapshot = await get(ref(db, `scores/${sucursal}`));
    const scores = snapshot.val() || {};

    grid.innerHTML = evaluationCriteria.map((criteria, index) => `
        <div class="eval-item">
            ${index + 1}. ${criteria} 
            <input type="number" min="0" max="2" 
                value="${scores[criteria] || ''}"
                disabled>
        </div>
    `).join('');
    
    const totalDiv = document.createElement('div');
    totalDiv.className = 'total-score';
    totalDiv.innerHTML = `
        <strong>Puntos Totales: </strong>
        <span>${calculateTotal(scores)}</span>
    `;
    grid.appendChild(totalDiv);
    
    li.appendChild(grid);
}

// Add "Show All" button after the list
const showAllButton = document.createElement('button');
showAllButton.textContent = 'Mostrar Todas las Evaluaciones';
showAllButton.className = 'show-all-btn';
sucursalesList.after(showAllButton);

// Add current date handling
const currentDate = new Date();
const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

function saveScore(sucursal, criteria, value) {
    // Get all evaluations for this sucursal
    let evaluations = JSON.parse(localStorage.getItem(`${sucursal}_history`)) || {};
    
    // Initialize or get current month's scores
    if (!evaluations[currentMonth]) {
        evaluations[currentMonth] = {};
    }
    
    evaluations[currentMonth][criteria] = value;
    localStorage.setItem(`${sucursal}_history`, JSON.stringify(evaluations));
    
    // Update displays
    updateDisplays(sucursal, evaluations[currentMonth]);
}

function updateDisplays(sucursal, scores) {
    const totalSpan = event.target.closest('.evaluation-grid')
        .querySelector('.total-score span');
    const newTotal = calculateTotal(scores);
    totalSpan.textContent = `${newTotal}`;
    
    const sucursalScore = event.target.closest('li')
        .querySelector('.sucursal-score');
    sucursalScore.textContent = `${newTotal}`;
}

function calculateTotal(scores) {
    if (Object.keys(scores).length === 0) return 0;
    
    const total = Object.values(scores)
        .reduce((sum, score) => sum + Number(score), 0);
    return total.toFixed(1); // Return total sum instead of average
}