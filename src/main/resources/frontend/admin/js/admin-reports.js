const { request, renderCurrency, renderEmptyState } = window.adminShell;

(async function loadReports() {
  const response = await request('/api/admin/reports');
  const data = response?.data || { totals: {}, byStatus: {}, services: [] };
  document.getElementById('reportMetrics').innerHTML = [
    { label: 'Appointments', value: data.totals.appointments || 0 },
    { label: 'Completed', value: data.totals.completed || 0 },
    { label: 'Revenue', value: renderCurrency(data.totals.revenue || 0) },
  ].map((metric) => `
    <article class="metric-card">
      <div class="metric-label">${metric.label}</div>
      <div class="metric-value">${metric.value}</div>
    </article>
  `).join('');

  const statuses = Object.entries(data.byStatus || {});
  document.getElementById('statusMetrics').innerHTML = statuses.length
    ? `<div class="badge-row">${statuses.map(([status, count]) => `<span class="status-pill">${status}: ${count}</span>`).join('')}</div>`
    : renderEmptyState('No status data available yet.');

  const services = data.services || [];
  document.getElementById('servicePerformance').innerHTML = services.length
    ? `
      <div class="table-wrap">
        <table class="data-table">
          <thead>
            <tr><th>Service</th><th>Bookings</th><th>Completed</th><th>Revenue</th></tr>
          </thead>
          <tbody>
            ${services.map((service) => `
              <tr>
                <td>${service.name}</td>
                <td>${service.bookings}</td>
                <td>${service.completed}</td>
                <td>${renderCurrency(service.revenue)}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
    `
    : renderEmptyState('No service performance data available yet.');
})();
