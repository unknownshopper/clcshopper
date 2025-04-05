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
    const monthSelector = document.getElementById('monthSelector');
    if (!tableBody || !monthSelector) return;

    // Get current month first
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    // Setup month selector
    const years = [currentYear - 1, currentYear, currentYear + 1];
    years.forEach(year => {
        for (let month = 0; month < 12; month++) {
            const date = new Date(year, month, 1);
            const option = document.createElement('option');
            option.value = `${year}-${String(month + 1).padStart(2, '0')}`;
            option.textContent = date.toLocaleString('es-MX', { month: 'long', year: 'numeric' });
            
            if (year === currentYear && month === currentDate.getMonth()) {
                option.selected = true;
            }
            monthSelector.appendChild(option);
        }
    });

    // Get initial scores
    const scoresSnapshot = await get(ref(db, `scores/${currentMonth}`));
    const allScores = scoresSnapshot.val() || {};

    // Create table structure
    const thead = document.querySelector('thead tr');
    thead.innerHTML = `
        <th>Parámetros</th>
        ${sucursales.map(sucursal => `<th>${sucursal}</th>`).join('')}
    `;

    // Create table body
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

        tableBody.appendChild(row);
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
    tableBody.appendChild(totalRow);

    // Add logrado row
    const logradoRow = document.createElement('tr');
    logradoRow.className = 'logrado-row';
    logradoRow.innerHTML = `
        <td>Logrado</td>
        ${sucursales.map(sucursal => `
            <td id="logrado-${sucursal}">${calculatePercentage(allScores[sucursal] || {})}</td>
        `).join('')}
    `;
    tableBody.appendChild(logradoRow);

    // Remove these lines as they're not defined
    // setupEventListeners();
    // setupRealtimeUpdates(currentMonth);

    // Add real-time updates
    onValue(ref(db, `scores/${currentMonth}`), (snapshot) => {
        const scores = snapshot.val() || {};
        updateAllInputs(scores);
        updateAllTotals(scores);
    });

    // Add input change listeners
    document.querySelectorAll('input[type="number"]').forEach(input => {
        input.addEventListener('change', async (e) => {
            const value = e.target.value;
            const { sucursal, criteria } = e.target.dataset;
            const selectedMonth = monthSelector.value;
            
            try {
                await saveScore(selectedMonth, sucursal, criteria, value);
                updateAllTotals(allScores);
            } catch (error) {
                console.error('Error saving score:', error);
                e.target.value = allScores[sucursal]?.[criteria] || '';
            }
        });
    });

    // Add save button functionality
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) {
        saveBtn.addEventListener('click', async () => {
            try {
                const inputs = document.querySelectorAll('input[type="number"]');
                const selectedMonth = monthSelector.value;
                
                for (const input of inputs) {
                    const { sucursal, criteria } = input.dataset;
                    const value = input.value;
                    if (value !== '') {
                        await saveScore(selectedMonth, sucursal, criteria, value);
                    }
                }
                
                alert('Evaluaciones guardadas exitosamente');
            } catch (error) {
                console.error('Error saving scores:', error);
                alert('Error al guardar las evaluaciones');
            }
        });
    }
});

// Updated saveScore function
async function saveScore(month, sucursal, criteria, value) {
    const numberValue = Number(value);
    // Allow empty values (they won't be saved)
    if (value === '') {
        return;
    }
    // Check if it's a valid number and within range
    if (isNaN(numberValue) || numberValue < 0 || numberValue > 2) {
        alert(`Por favor ingrese un valor entre 0 y 2 para ${criteria} en ${sucursal}`);
        throw new Error('Invalid score value');
    }
    await set(ref(db, `scores/${month}/${sucursal}/${criteria}`), numberValue);
}

function calculateTotal(scores) {
    return Math.round(Object.values(scores)
        .reduce((sum, score) => sum + Number(score || 0), 0));
}

function calculatePercentage(scores) {
    const total = Object.values(scores).reduce((sum, score) => sum + Number(score || 0), 0);
    const percentage = Math.round((total / 31) * 100);
    return `<div class="percentage ${getColorClass(percentage)}">${percentage}%</div>`;
}

function getColorClass(percentage) {
    return percentage >= 95 ? 'cell-green' : 
           percentage >= 90 ? 'cell-orange' : 'cell-red';
}

function updateAllTotals(scores) {
    sucursales.forEach(sucursal => {
        const total = calculateTotal(scores[sucursal] || {});
        const percentage = calculatePercentage(scores[sucursal] || {});
        document.getElementById(`total-${sucursal}`).textContent = total;
        document.getElementById(`logrado-${sucursal}`).innerHTML = percentage;
    });
}

function updateAllInputs(scores) {
    document.querySelectorAll('input[type="number"]').forEach(input => {
        const { sucursal, criteria } = input.dataset;
        input.value = scores[sucursal]?.[criteria] || '';
    });
    updateAllTotals(scores);
}