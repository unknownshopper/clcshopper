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
    if (Object.keys(scores).length === 0) return 0;
    const total = Object.values(scores)
        .reduce((sum, score) => sum + Number(score), 0);
    return total.toFixed(1); // Remove division by length to get sum instead of average
}

function renderSucursalComparison(selectedMonth) {
    const scores = sucursales.map(sucursal => {
        const scores = JSON.parse(localStorage.getItem(sucursal)) || {};
        return {
            sucursal: sucursal,
            total: calculateTotal(scores)
        };
    }).sort((a, b) => b.total - a.total);

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
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 310, // Adjusted for sum (31 criteria * max score 10)
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
}

// Add month selector at the top
function renderMonthSelector() {
    const container = document.getElementById('tableContainer');
    const monthSelect = document.createElement('select');
    monthSelect.className = 'month-selector';
    
    // Get all available months from localStorage
    const allMonths = new Set();
    sucursales.forEach(sucursal => {
        const history = JSON.parse(localStorage.getItem(`${sucursal}_history`)) || {};
        Object.keys(history).forEach(month => allMonths.add(month));
    });
    
    // Sort months in descending order
    const months = Array.from(allMonths).sort().reverse();
    
    months.forEach(month => {
        const option = document.createElement('option');
        option.value = month;
        option.textContent = new Date(month + '-01').toLocaleDateString('es-ES', {
            year: 'numeric',
            month: 'long'
        });
        monthSelect.appendChild(option);
    });
    
    monthSelect.addEventListener('change', () => renderTable(monthSelect.value));
    container.appendChild(monthSelect);
}

// Remove renderMonthlyTrends and update renderCharts function
function renderCharts(selectedMonth) {
    renderSucursalComparison(selectedMonth);
}

function renderMonthlyTrends() {
    const months = getAvailableMonths();
    const datasets = sucursales.map(sucursal => {
        const scores = months.map(month => {
            const history = JSON.parse(localStorage.getItem(`${sucursal}_history`)) || {};
            return history[month] ? calculateTotal(history[month]) : 0;
        });
        return {
            label: sucursal,
            data: scores,
            borderColor: getRandomColor(),
            borderWidth: 2,
            tension: 0.4,
            fill: false,
            pointRadius: 4,
            pointHoverRadius: 6
        };
    });

    new Chart('monthlyTrendsChart', {
        type: 'line',
        data: {
            labels: months.map(month => formatMonth(month)),
            datasets: datasets
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                title: {
                    display: true,
                    text: 'Tendencia Mensual por Sucursal',
                    font: { size: 16 }
                },
                legend: {
                    position: 'right',
                    align: 'start'
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 10
                }
            }
        }
    });
}

function renderSucursalComparison(selectedMonth) {
    const scores = sucursales.map(sucursal => {
        const scores = JSON.parse(localStorage.getItem(sucursal)) || {};
        return {
            sucursal: sucursal,
            total: calculateTotal(scores)
        };
    }).sort((a, b) => b.total - a.total);

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
                    text: 'Comparación de Puntuaciones por Sucursal',
                    font: { size: 16 }
                },
                legend: {
                    display: false
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    max: 31,
                    ticks: {
                        stepSize: 1
                    },
                    title: {
                        display: true,
                        text: 'Criterios Cumplidos'
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
}

function getRandomColor(count = 1) {
    // Predefined color palette for better visual consistency
    const colorPalette = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
        '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71',
        '#E74C3C', '#1ABC9C', '#F1C40F', '#34495E', '#7F8C8D',
        '#16A085'
    ];

    if (count === 1) {
        return colorPalette[Math.floor(Math.random() * colorPalette.length)];
    }

    // For multiple colors, ensure each sucursal gets a consistent color
    return sucursales.map((_, index) => 
        colorPalette[index % colorPalette.length]
    );
}

function formatMonth(monthStr) {
    return new Date(monthStr + '-01').toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'short'
    });
}

// Update the existing renderTable function to include charts
function renderTable(selectedMonth = currentMonth) {
    const container = document.getElementById('tableContainer');
    container.innerHTML = '';

    // Add control buttons
    const controlsDiv = document.createElement('div');
    controlsDiv.className = 'table-controls';
    controlsDiv.innerHTML = `
        <button onclick="exportToCSV()" class="control-btn">Exportar a CSV</button>
        <button onclick="saveBackup()" class="control-btn">Guardar Backup</button>
        <input type="file" id="restoreFile" style="display: none" onchange="restoreBackup(event)">
        <button onclick="document.getElementById('restoreFile').click()" class="control-btn">Restaurar Backup</button>
    `;
    container.appendChild(controlsDiv);

    const table = document.createElement('table');
    table.className = 'evaluation-table';

    // Create header with sucursales
    const thead = document.createElement('thead');
    const headerRow = document.createElement('tr');
    headerRow.innerHTML = `
        <th>Criterio</th>
        ${sucursales.map(sucursal => `<th>${sucursal}</th>`).join('')}
        <th>Promedio</th>
    `;
    thead.appendChild(headerRow);
    table.appendChild(thead);

    // Create rows for each criteria
    const tbody = document.createElement('tbody');
    evaluationCriteria.forEach(criteria => {
        const row = document.createElement('tr');
        
        // Add criteria name
        row.innerHTML = `<td><strong>${criteria}</strong></td>`;
        
        // Add inputs for each sucursal
        sucursales.forEach(sucursal => {
            const scores = JSON.parse(localStorage.getItem(sucursal)) || {};
            row.innerHTML += `
                <td>
                    <input type="number" min="0" max="10" 
                        value="${scores[criteria] || ''}"
                        onchange="updateScore('${sucursal}', '${criteria}', this.value)">
                </td>
            `;
        });

        // Add row average
        const rowScores = sucursales.map(sucursal => {
            const scores = JSON.parse(localStorage.getItem(sucursal)) || {};
            return Number(scores[criteria] || 0);
        });
        const rowAverage = rowScores.length ? 
            (rowScores.reduce((a, b) => a + b, 0) / rowScores.length).toFixed(1) : 
            '0.0';
        row.innerHTML += `<td><strong>${rowAverage}</strong></td>`;
        
        tbody.appendChild(row);
    });

    // Add totals row
    const totalRow = document.createElement('tr');
    totalRow.className = 'total-row';
    totalRow.innerHTML = `<td><strong>PROMEDIO</strong></td>`;
    
    // Calculate column totals
    sucursales.forEach(sucursal => {
        const scores = JSON.parse(localStorage.getItem(sucursal)) || {};
        totalRow.innerHTML += `<td><strong>${calculateTotal(scores)}</strong></td>`;
    });

    // Add global average
    const globalAverage = sucursales
        .map(sucursal => {
            const scores = JSON.parse(localStorage.getItem(sucursal)) || {};
            return Number(calculateTotal(scores));
        })
        .reduce((a, b) => a + b, 0) / sucursales.length;
    
    totalRow.innerHTML += `<td><strong>${globalAverage.toFixed(1)}</strong></td>`;
    tbody.appendChild(totalRow);

    table.appendChild(tbody);
    container.appendChild(table);
    
    renderCharts(selectedMonth);
}

function updateScore(sucursal, criteria, value) {
    let scores = JSON.parse(localStorage.getItem(sucursal)) || {};
    scores[criteria] = value;
    localStorage.setItem(sucursal, JSON.stringify(scores));
    renderTable(); // Refresh the table to show updated scores
}

// Add event listener to refresh table when localStorage changes
window.addEventListener('storage', renderTable);

// Initial render
document.addEventListener('DOMContentLoaded', renderTable);


function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    
    // Add headers
    csvContent += "Sucursal," + evaluationCriteria.join(",") + ",Promedio\n";
    
    // Add data
    sucursales.forEach(sucursal => {
        const scores = JSON.parse(localStorage.getItem(sucursal)) || {};
        const row = [
            sucursal,
            ...evaluationCriteria.map(criteria => scores[criteria] || ''),
            calculateTotal(scores)
        ];
        csvContent += row.join(",") + "\n";
    });
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `evaluaciones_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function saveBackup() {
    const backup = {};
    sucursales.forEach(sucursal => {
        backup[sucursal] = JSON.parse(localStorage.getItem(sucursal)) || {};
    });
    
    const blob = new Blob([JSON.stringify(backup)], {type: 'application/json'});
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `backup_evaluaciones_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function restoreBackup(event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const backup = JSON.parse(e.target.result);
                Object.entries(backup).forEach(([sucursal, scores]) => {
                    localStorage.setItem(sucursal, JSON.stringify(scores));
                });
                renderTable();
                alert('Backup restaurado exitosamente');
            } catch (error) {
                alert('Error al restaurar el backup');
            }
        };
        reader.readAsText(file);
    }
}

function renderStatistics(selectedMonth) {
    const container = document.getElementById('tableContainer');
    const statsDiv = document.createElement('div');
    statsDiv.className = 'statistics';
    
    // Calculate month-over-month changes
    const previousMonth = getPreviousMonth(selectedMonth);
    const changes = calculateMonthlyChanges(selectedMonth, previousMonth);
    
    statsDiv.innerHTML = `
        <h3>Estadísticas Mensuales</h3>
        <div class="stats-grid">
            <div class="stat-card">
                <h4>Mejor Sucursal</h4>
                <p>${changes.bestPerformer}</p>
            </div>
            <div class="stat-card">
                <h4>Mayor Mejora</h4>
                <p>${changes.mostImproved}</p>
            </div>
            <div class="stat-card">
                <h4>Promedio Global</h4>
                <p>${changes.globalAverage}</p>
            </div>
        </div>
    `;
    
    container.appendChild(statsDiv);
}


function getAvailableMonths() {
    const allMonths = new Set();
    sucursales.forEach(sucursal => {
        const history = JSON.parse(localStorage.getItem(`${sucursal}_history`)) || {};
        Object.keys(history).forEach(month => allMonths.add(month));
    });
    
    // If no months available, add current month
    if (allMonths.size === 0) {
        const now = new Date();
        allMonths.add(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`);
    }
    
    return Array.from(allMonths).sort();
}

// Add at the beginning of the file
const currentDate = new Date();
const currentMonth = `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;