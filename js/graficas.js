import { ref, get } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js';
import { db } from './firebase-config.js';

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
    return sucursales.map((_, index) => colorPalette[index % colorPalette.length]);
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
                    backgroundColor: getRandomColor(),
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
                        font: { size: 20, weight: 'bold' }
                    },
                    legend: { display: false }
                },
                scales: {
                    y: {
                        beginAtZero: true,
                        max: 62,
                        title: {
                            display: true,
                            text: 'Puntos Totales',
                            font: { size: 14 }
                        }
                    },
                    x: {
                        ticks: {
                            maxRotation: 45,
                            minRotation: 45,
                            font: { size: 12 }
                        }
                    }
                }
            }
        });
    } catch (error) {
        console.error('Error rendering chart:', error);
    }
}

document.addEventListener('DOMContentLoaded', renderSucursalComparison);