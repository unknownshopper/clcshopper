import { ref, get, onValue } from 'https://www.gstatic.com/firebasejs/10.4.0/firebase-database.js';
import { db } from './firebase-config.js';

const sucursales = [
    'Altabrisa', 'Américas', 'Ángeles', 'Centro', 'Cristal', 
    'Galerías', 'Deportiva', 'Guayabal', 'Olmeca', 'Pista de Hielo',
    'Usuma', 'Móvil Deportiva', 'Móvil la Venta', 'Walmart Carrizal',
    'Walmart Deportiva', 'Walmart Universidad'
];

document.addEventListener('DOMContentLoaded', async () => {
    const sucursalesList = document.getElementById('sucursalesList');
    
    // Create initial list
    sucursales.forEach(sucursal => {
        const li = document.createElement('li');
        li.setAttribute('data-sucursal', sucursal);
        li.innerHTML = `<h3>${sucursal} <span class="sucursal-score">0/31</span></h3>`;
        sucursalesList.appendChild(li);
    });

    function updateSucursalesList(scores) {
        sucursales.forEach(sucursal => {
            const data = scores[sucursal] || {};
            const total = Object.values(data).reduce((sum, score) => sum + Number(score || 0), 0);
            const maxScore = 31; // Changed from 31 * 2 to just 31
            const percentage = Math.round((total / (maxScore * 2)) * 100); // Keep this calculation for percentage
            
            const sucursalElement = document.querySelector(`[data-sucursal="${sucursal}"]`);
            if (sucursalElement) {
                const scoreElement = sucursalElement.querySelector('.sucursal-score');
                if (scoreElement) {
                    scoreElement.textContent = `${total}/${maxScore}`;
                }
            }
        });
    }

    // Get current month
    const currentDate = new Date();
    const currentYear = currentDate.getFullYear();
    const currentMonth = `${currentYear}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;

    // Initial load
    const scoresSnapshot = await get(ref(db, `scores/${currentMonth}`));
    updateSucursalesList(scoresSnapshot.val() || {});

    // Listen for real-time updates
    onValue(ref(db, `scores/${currentMonth}`), (snapshot) => {
        updateSucursalesList(snapshot.val() || {});
    });
});

function getColorClass(percentage) {
    return percentage >= 95 ? 'cell-green' : 
           percentage >= 90 ? 'cell-orange' : 'cell-red';
}