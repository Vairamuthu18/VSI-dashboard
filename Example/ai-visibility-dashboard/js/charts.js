function renderCharts(data) {
    if (!data.responses || data.responses.length === 0) return;

    // --- Main Trend Chart ---
    const ctxMain = document.getElementById('mainTrendChart').getContext('2d');

    // Create Gradient
    const gradient = ctxMain.createLinearGradient(0, 0, 0, 300);
    gradient.addColorStop(0, 'rgba(99, 102, 241, 0.4)'); // Indigo
    gradient.addColorStop(1, 'rgba(99, 102, 241, 0.0)');

    // Process dates
    const dates = [...new Set(data.responses.map(r => r.test_date))].sort().slice(-14); // Last 14 days
    const counts = dates.map(d => data.responses.filter(r => r.test_date === d && r.brand_mentioned).length);

    new Chart(ctxMain, {
        type: 'line',
        data: {
            labels: dates,
            datasets: [{
                label: 'Visibility Frequency',
                data: counts,
                borderColor: '#6366f1',
                backgroundColor: gradient,
                borderWidth: 3,
                tension: 0.4, // Smooth curve
                fill: true,
                pointBackgroundColor: '#ffffff',
                pointBorderColor: '#6366f1',
                pointBorderWidth: 2,
                pointRadius: 4,
                pointHoverRadius: 6
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
                legend: { display: false }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    grid: { color: 'rgba(0,0,0,0.05)' }
                },
                x: {
                    grid: { display: false }
                }
            }
        }
    });

    // --- Mini SoM Doughnut ---
    const ctxSom = document.getElementById('miniSomChart').getContext('2d');
    const myMentions = data.responses.filter(r => r.brand_mentioned).length;
    const total = data.responses.length;

    new Chart(ctxSom, {
        type: 'doughnut',
        data: {
            labels: ['Owned', 'Competitor'],
            datasets: [{
                data: [myMentions, total - myMentions],
                backgroundColor: ['#6366f1', '#e2e8f0'],
                borderWidth: 0,
                hoverOffset: 4
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            cutout: '75%',
            plugins: {
                legend: { display: false }
            }
        }
    });
}
