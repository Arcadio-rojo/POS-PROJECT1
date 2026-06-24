const months = [
    'January', 'February', 'March', 'April', 
    'May', 'June', 'July', 'August', 
    'September', 'October', 'November', 'December'
];

const colors = [
    'rgba(255, 99, 132, 1)',  // January
    'rgba(54, 162, 235, 1)',  // February
    'rgba(255, 206, 86, 1)',  // March
    'rgba(75, 192, 192, 1)',  // April
    'rgba(153, 102, 255, 1)', // May
    'rgba(255, 159, 64, 1)',  // June
    'rgba(255, 99, 132, 1)',  // July
    'rgba(54, 162, 235, 1)',  // August
    'rgba(255, 206, 86, 1)',  // September
    'rgba(75, 192, 192, 1)',  // October
    'rgba(153, 102, 255, 1)', // November
    'rgba(255, 159, 64, 1)'   // December
];

// Global chart instances
let barChart = null;
let pieChart = null;

function getTableData() {
    const labels = [];
    const salesData = [];
    const tableRows = document.querySelectorAll('#sale_tracking tr');

    tableRows.forEach(row => {
        const cells = row.querySelectorAll('td');
        if (cells.length > 0) {
            labels.push(cells[0].innerText);
            salesData.push(parseFloat(cells[1].innerText));
        }
    });

    return {
        labels: labels,
        salesData: salesData
    };
}

function initializeBarChart() {
    if (barChart) {
        barChart.destroy();
    }

    const bar_ctx = document.getElementById('bar_chart').getContext('2d');
    barChart = new Chart(bar_ctx, {
        type: 'line',
        data: {
            labels: months,
            datasets: [{
                label: '# of Income',
                data: Array(12).fill(0),
                backgroundColor: colors.map(color => color.replace('1)', '0.2)')),
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                x: {
                    ticks: {
                        maxRotation: 45,
                        minRotation: 45
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}

function initializePieChart() {
    if (pieChart) {
        pieChart.destroy();
    }

    const ctx = document.getElementById('pie_chart').getContext('2d');
    pieChart = new Chart(ctx, {
        type: 'pie',
        data: {
            labels: months,
            datasets: [{
                label: 'Sales Rates (%)',
                data: Array(12).fill(0),
                backgroundColor: colors.map(color => color.replace('1)', '0.2)')),
                borderColor: colors,
                borderWidth: 1
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top'
                }
            }
        }
    });
}

function updateCharts() {
    const data = getTableData();
    const monthlyData = Array(12).fill(0);

    data.labels.forEach((month, index) => {
        const monthIndex = months.indexOf(month);
        if (monthIndex !== -1) {
            monthlyData[monthIndex] = data.salesData[index];
        }
    });

    if (barChart) {
        barChart.data.datasets[0].data = monthlyData;
        barChart.update();
    }

    if (pieChart) {
        pieChart.data.datasets[0].data = monthlyData;
        pieChart.update();
    }
}

async function fetchMonthlyData() {
    try {
        const response = await fetch('http://localhost:3000/api/monthly-sales');
        const data = await response.json();
        
        const monthNames = {
            '01': 'January', '02': 'February', '03': 'March',
            '04': 'April', '05': 'May', '06': 'June',
            '07': 'July', '08': 'August', '09': 'September',
            '10': 'October', '11': 'November', '12': 'December'
        };

        const tableBody = document.getElementById('sale_tracking');
        tableBody.innerHTML = '';
        
        data.forEach(row => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${monthNames[row.month]}</td>
                <td>${row.total_sales}</td>
                <td>${row.sales_rate}</td>
            `;
            tableBody.appendChild(tr);
        });

        updateCharts();
    } catch (error) {
        console.error('Error fetching data:', error);
    }
}

// Initialize everything when the page loads
// Add this to your DOMContentLoaded event listener
document.addEventListener('DOMContentLoaded', () => {
    initializeBarChart();
    initializePieChart();
    fetchMonthlyData();
    fetchAndDisplayEvents(); // Add this line
    
    // Refresh events every minute
    setInterval(fetchAndDisplayEvents, 60000);
});

// Add this to your existing dashboard.js
function fetchAndDisplayEvents() {
    fetch('http://localhost:3000/events')
        .then(response => response.json())
        .then(events => {
            const eventsList = document.getElementById('Eventscalendar');
            eventsList.innerHTML = '';

            events.forEach(event => {
                const startDate = new Date(event.start);
                const endDate = new Date(event.end);
                
                const listItem = document.createElement('li');
                listItem.className = 'event-item';
                listItem.innerHTML = `
                    <div class="event-title">${event.title}</div>
                    <div class="event-time">
                        ${startDate.toLocaleTimeString()} - ${endDate.toLocaleTimeString()}
                    </div>
                    <div class="event-date">${startDate.toLocaleDateString()}</div>
                `;
                eventsList.appendChild(listItem);
            });
        })
        .catch(error => console.error('Error fetching events:', error));
}