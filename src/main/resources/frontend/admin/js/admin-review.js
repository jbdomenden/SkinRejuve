const { request, renderDate, renderEmptyState, setPanelMessage } = window.adminShell;

function renderHighlights(items) {
  const counts = {
    total: items.length,
    pending: items.filter((item) => item.status === 'PENDING').length,
    denied: items.filter((item) => item.status === 'DENIED').length,
    completed: items.filter((item) => item.status === 'COMPLETED').length,
  };
  document.getElementById('reviewHighlights').innerHTML = [
    { label: 'Total Requests', value: counts.total },
    { label: 'Pending Review', value: counts.pending },
    { label: 'Rejected', value: counts.denied },
    { label: 'Completed', value: counts.completed },
  ].map((metric) => `
    <article class="metric-card">
      <div class="metric-label">${metric.label}</div>
      <div class="metric-value">${metric.value}</div>
    </article>
  `).join('');
}

async function loadReviewAppointments() {
  const response = await request('/api/admin/appointments');
  const items = response?.data || [];
  const root = document.getElementById('reviewAppointments');
  renderHighlights(items);
  if (!items.length) {
    root.innerHTML = renderEmptyState('No requests found.');
    return;
  }
  root.innerHTML = `
    <div class="list-stack">
      ${items.map((item) => `
        <button class="selection-card selection-card-rich" type="button" data-appointment-id="${item.id}" data-status="${item.status}">
          <div>
            <strong>${item.patientName}</strong>
            <p>${item.serviceName} • ${renderDate(item.startAt)}</p>
          </div>
          <span class="status-pill">${item.status}</span>
        </button>
      `).join('')}
    </div>
  `;

  root.querySelectorAll('[data-appointment-id]').forEach((button) => {
    button.addEventListener('click', () => {
      document.getElementById('appointmentId').value = button.dataset.appointmentId;
      document.getElementById('status').value = button.dataset.status;
      document.getElementById('denialReason').focus();
    });
  });
}

document.getElementById('updateBtn').onclick = async () => {
  const appointmentId = document.getElementById('appointmentId').value.trim();
  const status = document.getElementById('status').value;
  const denialReason = document.getElementById('denialReason').value.trim();
  const response = await request(`/api/appointments/${appointmentId}/status`, 'PATCH', { status, denialReason });
  setPanelMessage(document.getElementById('adminMsg'), response?.message || (response?.success ? 'Status updated.' : 'Unable to update status.'), response?.success ? 'success' : 'error');
  if (response?.success) {
    await loadReviewAppointments();
  }
};

loadReviewAppointments();
