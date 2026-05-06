let charts = {};

document.getElementById('csvUploader').addEventListener('change', function(e) {
    const file = e.target.files[0];
    
    Papa.parse(file, {
        header: true,
        dynamicTyping: true,
        skipEmptyLines: true,
        complete: function(results) {
            updateDashboard(results.data);
            document.getElementById('status').innerText = "✓ Data Loaded Successfully";
        }
    });
});

function updateDashboard(data) {
    // 1. Calculate KPIs
    const avgStock = Math.round(data.reduce((sum, row) => sum + row.StockLevel, 0) / data.length);
    const shortages = data.filter(row => row.Shortage === "Yes").length;
    const avgWork = Math.round(data.reduce((sum, row) => sum + row.WorkloadMin, 0) / data.length);
    const totalDelivered = data.reduce((sum, row) => sum + row.Delivered, 0);
    const totalReturned = data.reduce((sum, row) => sum + row.Returned, 0);
    const returnRate = Math.round((totalReturned / totalDelivered) * 100);

    document.getElementById('kpi-stock').innerText = avgStock + "%";
    document.getElementById('kpi-shortage').innerText = shortages;
    document.getElementById('kpi-work').innerText = avgWork + " min";
    document.getElementById('kpi-return').innerText = returnRate + "%";

    // 2. Render Stock Chart
    if (charts.stock) charts.stock.destroy();
    charts.stock = new Chart(document.getElementById('stockChart'), {
        type: 'line',
        data: {
            labels: data.map(row => row.Date),
            datasets: [{
                label: 'Stock Level %',
                data: data.map(row => row.StockLevel),
                borderColor: '#378ADD',
                tension: 0.4
            }]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });

    // 3. Render Delivered vs Returned Chart
    if (charts.ret) charts.ret.destroy();
    const categories = [...new Set(data.map(row => row.MedicationType))];
    charts.ret = new Chart(document.getElementById('returnChart'), {
        type: 'bar',
        data: {
            labels: categories,
            datasets: [
                {
                    label: 'Delivered',
                    backgroundColor: '#378ADD',
                    data: categories.map(cat => data.filter(r => r.MedicationType === cat).reduce((s, r) => s + r.Delivered, 0))
                },
                {
                    label: 'Returned',
                    backgroundColor: '#B4B2A9',
                    data: categories.map(cat => data.filter(r => r.MedicationType === cat).reduce((s, r) => s + r.Returned, 0))
                }
            ]
        },
        options: { responsive: true, maintainAspectRatio: false }
    });
}