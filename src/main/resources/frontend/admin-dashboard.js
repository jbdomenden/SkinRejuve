const { request, renderCurrency, renderDate, renderEmptyState } = window.adminShell;

function renderMetrics(metrics) {
  const root = document.getElementById('metricsGrid');
  root.innerHTML = metrics.map((metric) => `
    <article class="metric-card">
      <div class="metric-label">${metric.label}</div>
      <div class="metric-value">${typeof metric.value === 'number' && metric.label.toLowerCase().includes('revenue') ? renderCurrency(metric.value) : metric.value}</div>
    </article>
  `).join('');
}

function renderAppointmentList(containerId, items, emptyMessage) {
  const root = document.getElementById(containerId);
  if (!items.length) {
    root.innerHTML = renderEmptyState(emptyMessage);
    return;
  }
  root.innerHTML = items.map((item) => `
    <article class="list-card">
      <div>
        <strong>${item.patientName || item.staffName}</strong>
        <p>${item.serviceName || item.startAt}</p>
      </div>
      <div class="list-card-meta">
        <span class="status-pill">${item.status || item.staffName}</span>
        <span>${renderDate(item.startAt)}</span>
      </div>
    </article>
  `).join('');
}

(async function loadPage() {
  const response = await request('/api/admin/overview');
  const data = response?.data || { metrics: [], recentAppointments: [], slotCapacity: [] };
  renderMetrics(data.metrics || []);
  renderAppointmentList('recentAppointments', data.recentAppointments || [], 'No appointments have been booked yet.');
  renderAppointmentList('slotCapacity', data.slotCapacity || [], 'No available slots are currently open.');
})();
