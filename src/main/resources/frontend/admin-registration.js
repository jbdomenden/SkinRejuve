const { request, renderDate, renderEmptyState } = window.adminShell;

function badge(label, isGood) {
  return `<span class="status-pill ${isGood ? 'status-good' : 'status-muted'}">${label}</span>`;
}

function renderHighlights(items) {
  const total = items.length;
  const verified = items.filter((item) => item.emailVerified).length;
  const complete = items.filter((item) => item.profileComplete && item.intakeComplete).length;
  const pending = total - complete;
  document.getElementById('registrationHighlights').innerHTML = [
    { label: 'Total requests', value: total },
    { label: 'Email verified', value: verified },
    { label: 'Ready for booking', value: complete },
    { label: 'Pending completion', value: pending },
  ].map((metric) => `
    <article class="metric-card">
      <div class="metric-label">${metric.label}</div>
      <div class="metric-value">${metric.value}</div>
    </article>
  `).join('');
}

(async function loadRegistrations() {
  const response = await request('/api/admin/registrations');
  const items = response?.data || [];
  const root = document.getElementById('registrationsTable');
  renderHighlights(items);
  if (!items.length) {
    root.innerHTML = renderEmptyState('No registrations found.');
    return;
  }
  root.innerHTML = `
    <div class="table-wrap">
      <table class="data-table data-table-elevated">
        <thead>
          <tr>
            <th>Client</th>
            <th>Email verification</th>
            <th>Profile</th>
            <th>Intake</th>
            <th>Created</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <td><strong>${item.patientName}</strong><span>${item.email}</span></td>
              <td>${badge(item.emailVerified ? 'Verified' : 'Pending', item.emailVerified)}</td>
              <td>${badge(item.profileComplete ? 'Complete' : 'Pending', item.profileComplete)}</td>
              <td>${badge(item.intakeComplete ? 'Submitted' : 'Pending', item.intakeComplete)}</td>
              <td>${renderDate(item.createdAt)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
})();
