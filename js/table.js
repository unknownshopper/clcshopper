import { ref, set, get, onValue } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js';
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

function calculateTotal(scores) {
    if (!scores || Object.keys(scores).length === 0) return 0;
    const total = Object.values(scores)
        .reduce((sum, score) => sum + Number(score), 0);
    return total.toFixed(1);
}

function getRandomColor(count = 1) {
    const colorPalette = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
        '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71',
        '#E74C3C', '#1ABC9C', '#F1C40F', '#34495E', '#7F8C8D',
        '#16A085'
    ];
    return count === 1 
        ? colorPalette[Math.floor(Math.random() * colorPalette.length)]
        : sucursales.map((_, index) => colorPalette[index % colorPalette.length]);
}

async function renderSucursalComparison() {
    try {
        const snapshot = await get(ref(db, 'scores'));
        const allScores = snapshot.val() || {};

        const scores = sucursales.map(sucursal => ({
            sucursal: sucursal,
            total: calculateTotal(allScores[sucursal])
        })).sort((a, b) => b.total - a.total);

        new Chart('sucursalComparisonChart', {
            type: 'bar',
            data: {
                labels: scores.map(item => item.sucursal),
                datasets: [{
                    label: 'Puntuación Total',
                    data: scores.map(item => item.total),
                    backgroundColor: getRandomColor(sucursales.length),
                    borderWidth: 1
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    title: {
                        display: true,
                        text: 'Total de Puntos por Sucursal',
                        font: { size: 16 }
                    },
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 62,
                        title: {
                            display: true,
                            text: 'Puntos Totales'
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error rendering chart:', error);
    }
}

async function renderTable() {
    try {
        const container = document.getElementById('tableContainer');
        if (!container) {
            console.error('Table container not found');
            return;
        }
        
        checkAuth();
        const userRole = localStorage.getItem('userRole');
        container.innerHTML = '<div class="loading">Cargando...</div>';

        const snapshot = await get(ref(db, 'scores'));
        const allScores = snapshot.val() || {};

        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'table-controls';
        controlsDiv.innerHTML = `
            ${userRole === 'admin' ? '<button onclick="exportToCSV()" class="control-btn">Exportar a CSV</button>' : ''}
            <button onclick="logout()" class="control-btn">Cerrar Sesión</button>
        `;
        container.appendChild(controlsDiv);

        const table = document.createElement('table');
        table.className = 'evaluation-table';

        // Create table header
        const thead = document.createElement('thead');
        thead.innerHTML = `
            <tr>
                <th>Criterio</th>
                ${sucursales.map(sucursal => `<th>${sucursal}</th>`).join('')}
                <th>Promedio</th>
            </tr>
        `;
        table.appendChild(thead);

        // Create table body
        const tbody = document.createElement('tbody');
        evaluationCriteria.forEach(criteria => {
            const row = document.createElement('tr');
            row.innerHTML = `<td><strong>${criteria}</strong></td>`;
            
            const rowScores = sucursales.map(sucursal => {
                const score = allScores[sucursal]?.[criteria] || '';
                row.innerHTML += `
                    <td>
                        <input type="number" min="0" max="2" 
                            value="${score}"
                            ${userRole !== 'admin' ? 'disabled' : ''}
                            onchange="window.updateScore('${sucursal}', '${criteria}', this.value)">
                    </td>
                `;
                return Number(score || 0);
            });

            const average = rowScores.length ? 
                (rowScores.reduce((a, b) => a + b, 0) / rowScores.length).toFixed(1) : 
                '0.0';
            row.innerHTML += `<td><strong>${average}</strong></td>`;
            
            tbody.appendChild(row);
        });

        // Create totals row
        const totalRow = document.createElement('tr');
        totalRow.className = 'total-row';
        totalRow.innerHTML = `<td><strong>TOTAL</strong></td>`;
        
        const sucursalTotals = sucursales.map(sucursal => {
            const total = calculateTotal(allScores[sucursal]);
            totalRow.innerHTML += `<td><strong>${total}</strong></td>`;
            return Number(total);
        });

        const globalAverage = (sucursalTotals.reduce((a, b) => a + b, 0) / sucursales.length).toFixed(1);
        totalRow.innerHTML += `<td><strong>${globalAverage}</strong></td>`;
        tbody.appendChild(totalRow);

        table.appendChild(tbody);
        container.appendChild(table);
        
        await renderSucursalComparison();
    } catch (error) {
        console.error('Error rendering table:', error);
        const container = document.getElementById('tableContainer');
        if (container) {
            container.innerHTML = '<div class="error">Error al cargar los datos: ' + error.message + '</div>';
        }
    }
}

async function updateScore(sucursal, criteria, value) {
    if (localStorage.getItem('userRole') !== 'admin') {
        alert('No tienes permisos para modificar los datos');
        return;
    }

    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 2) {
        alert('Por favor ingrese un valor entre 0 y 2');
        return;
    }

    try {
        await set(ref(db, `scores/${sucursal}/${criteria}`), value);
        console.log('Data saved successfully');
    } catch (error) {
        console.error('Error saving data:', error);
        alert('Error al guardar los datos');
    }
}

async function exportToCSV() {
    try {
        const snapshot = await get(ref(db, 'scores'));
        const allScores = snapshot.val() || {};
        
        let csvContent = "data:text/csv;charset=utf-8,";
        csvContent += "Criterio," + sucursales.join(",") + ",Promedio\n";
        
        evaluationCriteria.forEach(criteria => {
            const row = [criteria];
            const rowScores = sucursales.map(sucursal => 
                allScores[sucursal]?.[criteria] || '');
            
            const validScores = rowScores.filter(score => score !== '');
            const average = validScores.length ? 
                (validScores.map(Number).reduce((a, b) => a + b, 0) / validScores.length).toFixed(1) : 
                '0.0';
            
            row.push(...rowScores, average);
            csvContent += row.join(",") + "\n";
        });

        const link = document.createElement("a");
        link.setAttribute("href", encodeURI(csvContent));
        link.setAttribute("download", "evaluaciones.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    } catch (error) {
        console.error('Error exporting CSV:', error);
        alert('Error al exportar CSV');
    }
}

// Add at the beginning of the file, after imports
function checkAuth() {
    if (localStorage.getItem('isAuthenticated') !== 'true') {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

window.logout = function() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    localStorage.removeItem('username');
    window.location.href = 'login.html';
};

// Listen for real-time updates
onValue(ref(db, 'scores'), () => {
    renderTable();
});

document.addEventListener('DOMContentLoaded', renderTable);
    