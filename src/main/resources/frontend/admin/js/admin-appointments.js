const { request, renderCurrency, renderDate, renderEmptyState } = window.adminShell;

function summarize(items) {
  const totals = {
    total: items.length,
    pending: items.filter((item) => item.status === 'PENDING').length,
    approved: items.filter((item) => item.status === 'APPROVED').length,
    revenue: items.reduce((sum, item) => sum + Number(item.servicePrice || 0), 0),
  };
  document.getElementById('appointmentHighlights').innerHTML = [
    { label: 'Total Requests', value: totals.total },
    { label: 'Pending Review', value: totals.pending },
    { label: 'Accepted', value: totals.approved },
    { label: 'Amount', value: renderCurrency(totals.revenue) },
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
    root.innerHTML = renderEmptyState('No appointments found.');
    return;
  }
  root.innerHTML = `
    <div class="table-wrap">
      <table class="data-table data-table-elevated">
        <thead>
          <tr>
            <th>Registrant</th>
            <th>Service</th>
            <th>Amount</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <td><strong>${item.patientName}</strong><span>${item.patientEmail}</span></td>
              <td>${item.serviceName}</td>
              <td>${renderCurrency(item.servicePrice)}</td>
              <td>${renderDate(item.startAt)}</td>
              <td><span class="status-pill">${item.status}</span></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
})();
