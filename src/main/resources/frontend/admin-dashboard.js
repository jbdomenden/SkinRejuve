const { request, renderEmptyState } = window.adminShell;

function renderMetrics(metrics) {
  const root = document.getElementById('metricsGrid');
  root.innerHTML = metrics.map((metric) => `
    <article class="metric-card">
      <div class="metric-label">${metric.label}</div>
      <div class="metric-value">${metric.value}</div>
    </article>
  `).join('');
}

(async function loadPage() {
  const response = await request('/api/analytics/overview');
  const data = response?.data || {};
  renderMetrics([
    { label: 'Patients', value: data.totalPatients || 0 },
    { label: 'Staff', value: data.totalStaff || 0 },
    { label: 'Services', value: data.totalServices || 0 },
    { label: 'Appointments', value: data.totalAppointments || 0 },
  ]);
  document.getElementById('recentAppointments').innerHTML = renderEmptyState('Use the landing-page editor and appointment views to manage current activity.');
  document.getElementById('slotCapacity').innerHTML = renderEmptyState('Analytics overview is live. Additional operational boards can be layered in here next.');
})();
