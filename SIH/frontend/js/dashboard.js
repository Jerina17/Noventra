// Noventra Government Monitoring Dashboard & Chart Analytics Engine

let occupationsChartInstance = null;
let skillGapsChartInstance = null;
let incomeProgressionChartInstance = null;

window.loadDashboardMetrics = async function() {
  try {
    const data = await safeApiCall('/api/dashboard/summary');

    // Update Counter Numbers
    const totalEl = document.getElementById('dashTotalBeneficiaries');
    if (totalEl) totalEl.textContent = data.total_beneficiaries || 12;

    // Occupations Bar Chart
    const occupationsCtx = document.getElementById('occupationsChart');
    if (occupationsCtx) {
      const topOcc = data.top_occupations || [['Agriculture', 5], ['Tailoring', 4], ['Retail', 2]];
      const labels = topOcc.map(item => item[0]);
      const counts = topOcc.map(item => item[1]);

      if (occupationsChartInstance) occupationsChartInstance.destroy();
      occupationsChartInstance = new Chart(occupationsCtx, {
        type: 'bar',
        data: {
          labels: labels,
          datasets: [{
            label: 'Beneficiaries',
            data: counts,
            backgroundColor: '#2563eb',
            borderRadius: 8
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { display: false } },
          scales: { y: { beginAtZero: true } }
        }
      });
    }

    // Skill Gaps Pie Chart
    const skillGapsCtx = document.getElementById('skillGapsChart');
    if (skillGapsCtx) {
      const gaps = data.common_skill_gaps || [['Food Safety Certification', 6], ['Solar Equipment Maintenance', 4], ['Digital Billing', 3]];
      const labels = gaps.map(item => item[0]);
      const counts = gaps.map(item => item[1]);

      if (skillGapsChartInstance) skillGapsChartInstance.destroy();
      skillGapsChartInstance = new Chart(skillGapsCtx, {
        type: 'doughnut',
        data: {
          labels: labels,
          datasets: [{
            data: counts,
            backgroundColor: ['#2563eb', '#14b8a6', '#f59e0b', '#0ea5e9', '#22c55e']
          }]
        },
        options: {
          responsive: true,
          plugins: { legend: { position: 'bottom' } }
        }
      });
    }

    // Income Progression Chart
    const incomeCtx = document.getElementById('incomeProgressionChart');
    if (incomeCtx) {
      if (incomeProgressionChartInstance) incomeProgressionChartInstance.destroy();
      incomeProgressionChartInstance = new Chart(incomeCtx, {
        type: 'line',
        data: {
          labels: ['Before Training', 'NSQF L3 Completion', 'NSQF L4 Certified', '1-Year Enterprise'],
          datasets: [{
            label: 'Estimated Monthly Wage (₹)',
            data: [7500, 14000, 22000, 35000],
            borderColor: '#22c55e',
            backgroundColor: 'rgba(34, 197, 94, 0.1)',
            fill: true,
            tension: 0.3
          }]
        },
        options: {
          responsive: true,
          scales: { y: { beginAtZero: true } }
        }
      });
    }

  } catch (err) {
    console.error('Failed to load dashboard analytics:', err);
  }
};

document.addEventListener('DOMContentLoaded', () => {
  const refreshBtn = document.getElementById('refreshDashboardBtn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', () => {
      window.loadDashboardMetrics();
      showToast('Dashboard metrics refreshed', 'info');
    });
  }

  const exportPdfBtn = document.getElementById('exportDashboardPdfBtn');
  const generateReportBtn = document.getElementById('generateReportBtn');

  const triggerReport = () => {
    window.print();
  };

  if (exportPdfBtn) exportPdfBtn.addEventListener('click', triggerReport);
  if (generateReportBtn) generateReportBtn.addEventListener('click', triggerReport);
});
