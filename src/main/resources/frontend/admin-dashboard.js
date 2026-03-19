const { request, renderEmptyState, renderDate, renderCurrency } = window.adminShell;

function renderMetrics(metrics) {
  const root = document.getElementById('metricsGrid');
  root.innerHTML = metrics.map((metric) => `
    <article class="metric-card ${metric.tone || ''}">
      <div class="metric-label">${metric.label}</div>
      <div class="metric-value">${metric.value}</div>
      <div class="metric-footnote">${metric.note || ''}</div>
    </article>
  `).join('');
}

function renderRecentAppointments(items) {
  if (!items.length) return renderEmptyState('No appointments found.');
  return `<div class="list-stack">${items.map((item) => `
    <article class="list-card appointment-list-card">
      <div>
        <strong>${item.patientName}</strong>
        <p>${item.serviceName} • ${renderDate(item.startAt)}</p>
      </div>
      <div class="list-card-meta">
        <span class="status-pill">${item.status}</span>
        <strong>${renderCurrency(item.servicePrice || 0)}</strong>
      </div>
    </article>
  `).join('')}</div>`;
}

function renderCapacityBoard(items) {
  if (!items.length) return renderEmptyState('No schedule data found.');
  const byStatus = items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});
  const upcoming = items.filter((item) => item.startAt).sort((a, b) => new Date(a.startAt) - new Date(b.startAt)).slice(0, 4);

  return `
    <div class="dashboard-columns">
      <section class="list-card list-card-light dashboard-status-panel">
        <div>
          <strong>Status</strong>
          <p>Current appointment counts.</p>
        </div>
        <div class="badge-row">${Object.entries(byStatus).map(([status, count]) => `<span class="status-pill">${status}: ${count}</span>`).join('')}</div>
      </section>
      <section class="list-card list-card-light dashboard-status-panel">
        <div>
          <strong>Upcoming</strong>
          <p>Next scheduled visits.</p>
        </div>
        <div class="mini-timeline">${upcoming.map((item) => `<div><strong>${item.patientName}</strong><span>${renderDate(item.startAt)}</span></div>`).join('')}</div>
      </section>
    </div>
  `;
}

(async function loadPage() {
  const [overviewResponse, appointmentsResponse] = await Promise.all([
    request('/api/analytics/overview'),
    request('/api/admin/appointments'),
  ]);
  const data = overviewResponse?.data || {};
  const appointments = appointmentsResponse?.data || [];
  renderMetrics([
    { label: 'Users', value: data.totalPatients || 0, note: 'Registered profiles' },
    { label: 'Staff', value: data.totalStaff || 0, note: 'Clinic accounts' },
    { label: 'Services', value: data.totalServices || 0, note: 'Available treatments' },
    { label: 'Appointments', value: data.totalAppointments || 0, note: 'All bookings' },
  ]);
  document.getElementById('recentAppointments').innerHTML = renderRecentAppointments(appointments.slice(0, 5));
  document.getElementById('slotCapacity').innerHTML = renderCapacityBoard(appointments);
})();
