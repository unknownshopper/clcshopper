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
    return total.toFixed(1);
}

function getRandomColor(count = 1) {
    const colorPalette = [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEEAD',
        '#D4A5A5', '#9B59B6', '#3498DB', '#E67E22', '#2ECC71',
        '#E74C3C', '#1ABC9C', '#F1C40F', '#34495E', '#7F8C8D',
        '#16A085'
    ];

    if (count === 1) {
        return colorPalette[Math.floor(Math.random() * colorPalette.length)];
    }
    return sucursales.map((_, index) => colorPalette[index % colorPalette.length]);
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
}

// Add at the beginning of file
function checkAuth() {
    if (localStorage.getItem('isAuthenticated') !== 'true') {
        window.location.href = 'login.html';
    }
}

function logout() {
    localStorage.removeItem('isAuthenticated');
    localStorage.removeItem('userRole');
    window.location.href = 'login.html';
}

// Modify renderTable function to handle user roles
function renderTable(selectedMonth = currentMonth) {
    try {
        checkAuth();
        const userRole = localStorage.getItem('userRole');
        const container = document.getElementById('tableContainer');
        container.innerHTML = '<div class="loading">Cargando...</div>';
        
        const controlsDiv = document.createElement('div');
        controlsDiv.className = 'table-controls';
        controlsDiv.innerHTML = `
            ${userRole === 'admin' ? '<button onclick="exportToCSV()" class="control-btn">Exportar a CSV</button>' : ''}
            <button onclick="logout()" class="control-btn">Cerrar Sesión</button>
        `;
        container.appendChild(controlsDiv);
    
        const table = document.createElement('table');
        table.className = 'evaluation-table';
    
        const thead = document.createElement('thead');
        const headerRow = document.createElement('tr');
        headerRow.innerHTML = `
            <th>Criterio</th>
            ${sucursales.map(sucursal => `<th>${sucursal}</th>`).join('')}
            <th>Promedio</th>
        `;
        thead.appendChild(headerRow);
        table.appendChild(thead);
    
        const tbody = document.createElement('tbody');
        evaluationCriteria.forEach(criteria => {
            const row = document.createElement('tr');
            row.innerHTML = `<td><strong>${criteria}</strong></td>`;
            
            // Modify input fields based on role
            sucursales.forEach(sucursal => {
                const scores = JSON.parse(localStorage.getItem(sucursal)) || {};
                row.innerHTML += `
                    <td>
                        <input type="number" min="0" max="10" 
                            value="${scores[criteria] || ''}"
                            ${userRole !== 'admin' ? 'disabled' : ''}
                            onchange="updateScore('${sucursal}', '${criteria}', this.value)">
                    </td>
                `;
            });
    
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
    
        const totalRow = document.createElement('tr');
        totalRow.className = 'total-row';
        totalRow.innerHTML = `<td><strong>TOTAL</strong></td>`;
        
        sucursales.forEach(sucursal => {
            const scores = JSON.parse(localStorage.getItem(sucursal)) || {};
            totalRow.innerHTML += `<td><strong>${calculateTotal(scores)}</strong></td>`;
        });
    
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
        
        renderSucursalComparison(selectedMonth);
    } catch (error) {
        console.error('Error rendering table:', error);
        container.innerHTML = '<div class="error">Error al cargar los datos</div>';
    }
}

// Modify updateScore to check for admin role
function updateScore(sucursal, criteria, value) {
    if (localStorage.getItem('userRole') !== 'admin') {
        alert('No tienes permisos para modificar los datos');
        return;
    }
    
    // Add validation
    const numValue = Number(value);
    if (isNaN(numValue) || numValue < 0 || numValue > 2) {
        alert('Por favor ingrese un valor entre 0 y 2');
        return;
    }
    
    let scores = JSON.parse(localStorage.getItem(sucursal)) || {};
    scores[criteria] = value;
    localStorage.setItem(sucursal, JSON.stringify(scores));
    renderTable();
}

function exportToCSV() {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Criterio," + sucursales.join(",") + ",Promedio\n";
    
    evaluationCriteria.forEach(criteria => {
        const row = [criteria];
        const rowScores = sucursales.map(sucursal => {
            const scores = JSON.parse(localStorage.getItem(sucursal)) || {};
            return scores[criteria] || '';
        });
        
        const average = rowScores
            .filter(score => score !== '')
            .map(Number)
            .reduce((a, b) => a + b, 0) / rowScores.filter(score => score !== '').length || 0;
        
        row.push(...rowScores, average.toFixed(1));
        csvContent += row.join(",") + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "evaluaciones.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Add to table.js
function backupData() {
    const backup = {};
    sucursales.forEach(sucursal => {
        backup[sucursal] = localStorage.getItem(sucursal);
    });
    const dataStr = JSON.stringify(backup);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'evaluaciones_backup.json';
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
}

function restoreData(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = function(e) {
        const backup = JSON.parse(e.target.result);
        Object.keys(backup).forEach(sucursal => {
            localStorage.setItem(sucursal, backup[sucursal]);
        });
        renderTable();
    };
    reader.readAsText(file);
}

document.addEventListener('DOMContentLoaded', renderTable);
    