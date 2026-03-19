const { request, renderCurrency, renderDate, renderEmptyState } = window.adminShell;

function summarize(items) {
  const totals = {
    total: items.length,
    pending: items.filter((item) => item.status === 'PENDING').length,
    approved: items.filter((item) => item.status === 'APPROVED').length,
    revenue: items.reduce((sum, item) => sum + Number(item.servicePrice || 0), 0),
  };
  document.getElementById('appointmentHighlights').innerHTML = [
    { label: 'Total requests', value: totals.total },
    { label: 'Pending review', value: totals.pending },
    { label: 'Approved', value: totals.approved },
    { label: 'Projected revenue', value: renderCurrency(totals.revenue) },
  ].map((metric) => `
    <article class="metric-card">
      <div class="metric-label">${metric.label}</div>
      <div class="metric-value">${metric.value}</div>
    </article>
  `).join('');
}

(async function loadAppointments() {
  const response = await request('/api/admin/appointments');
  const items = response?.data || [];
  const root = document.getElementById('appointmentsTable');
  summarize(items);
  if (!items.length) {
    root.innerHTML = renderEmptyState('No appointments are available yet.');
    return;
  }
  root.innerHTML = `
    <div class="table-wrap">
      <table class="data-table data-table-elevated">
        <thead>
          <tr>
            <th>Patient</th>
            <th>Service</th>
            <th>Visit time</th>
            <th>Status</th>
            <th>Revenue</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <td><strong>${item.patientName}</strong><span>${item.patientEmail}</span></td>
              <td>${item.serviceName}</td>
              <td>${renderDate(item.startAt)}</td>
              <td><span class="status-pill">${item.status}</span></td>
              <td>${renderCurrency(item.servicePrice)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
})();
