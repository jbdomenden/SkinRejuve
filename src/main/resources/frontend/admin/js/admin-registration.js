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
    { label: 'Total Requests', value: total },
    { label: 'Pending Review', value: pending },
    { label: 'Accepted', value: complete },
    { label: 'Verified', value: verified },
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
            <th>Registrant</th>
            <th>Date of Birth</th>
            <th>Submitted</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <td><strong>${item.patientName}</strong><span>${item.email}</span></td>
              <td>${item.dateOfBirth || '—'}</td>
              <td>${renderDate(item.createdAt)}</td>
              <td>${badge(item.emailVerified ? 'Review' : 'Pending', item.emailVerified)}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
})();
