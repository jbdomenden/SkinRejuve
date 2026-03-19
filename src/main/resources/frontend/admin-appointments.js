const { request, renderCurrency, renderDate, renderEmptyState } = window.adminShell;

(async function loadAppointments() {
  const response = await request('/api/admin/appointments');
  const items = response?.data || [];
  const root = document.getElementById('appointmentsTable');
  if (!items.length) {
    root.innerHTML = renderEmptyState('No appointments are available yet.');
    return;
  }
  root.innerHTML = `
    <div class="table-wrap">
      <table class="data-table">
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
