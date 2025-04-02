import { ref, get, set, onValue } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js';
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
    const tableBody = document.getElementById('evaluationTableBody');
    if (!tableBody) return;

    // Get all scores at once instead of individual queries
    const scoresSnapshot = await get(ref(db, 'scores'));
    const allScores = scoresSnapshot.val() || {};

    // Create table header
    const thead = document.querySelector('thead tr');
    thead.innerHTML = `
        <th>Parámetros</th>
        ${sucursales.map(sucursal => `<th>${sucursal}</th>`).join('')}
    `;

    // Create table body
    const fragment = document.createDocumentFragment();

    // Create rows for each evaluation criteria
    evaluationCriteria.forEach(criteria => {
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${criteria}</td>
            ${sucursales.map(sucursal => `
                <td>
                    <input type="number" min="0" max="2" 
                           value="${allScores[sucursal]?.[criteria] || ''}"
                           data-sucursal="${sucursal}" 
                           data-criteria="${criteria}">
                </td>
            `).join('')}
        `;

        // Add event listeners
        row.querySelectorAll('input').forEach(input => {
            input.addEventListener('change', async (e) => {
                await saveScore(e.target.dataset.sucursal, e.target.dataset.criteria, e.target.value);
            });
        });

        fragment.appendChild(row);
    });

    // Add total row
    const totalRow = document.createElement('tr');
    totalRow.className = 'total-row';
    totalRow.innerHTML = `
        <td>Total</td>
        ${sucursales.map(sucursal => `
            <td id="total-${sucursal}">${calculateTotal(allScores[sucursal] || {})}</td>
        `).join('')}
    `;
    fragment.appendChild(totalRow);

    // Append all rows at once
    tableBody.appendChild(fragment);

    // Set up real-time updates
    onValue(ref(db, 'scores'), (snapshot) => {
        const scores = snapshot.val() || {};
        updateAllInputs(scores);
        updateAllTotals(scores);
    });
});

function calculateTotal(scores) {
    return Object.values(scores)
        .reduce((sum, score) => sum + Number(score || 0), 0)
        .toFixed(1);
}

function updateAllInputs(scores) {
    document.querySelectorAll('input[type="number"]').forEach(input => {
        const { sucursal, criteria } = input.dataset;
        input.value = scores[sucursal]?.[criteria] || '';
    });
}

function updateAllTotals(scores) {
    sucursales.forEach(sucursal => {
        const total = calculateTotal(scores[sucursal] || {});
        document.getElementById(`total-${sucursal}`).textContent = total;
    });
}

async function saveScore(sucursal, criteria, value) {
    await set(ref(db, `scores/${sucursal}/${criteria}`), Number(value));
}