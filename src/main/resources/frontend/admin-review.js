const { request, renderDate, renderEmptyState, setPanelMessage } = window.adminShell;

async function loadReviewAppointments() {
  const response = await request('/api/admin/appointments');
  const items = response?.data || [];
  const root = document.getElementById('reviewAppointments');
  if (!items.length) {
    root.innerHTML = renderEmptyState('No appointments are ready for review.');
    return;
  }
  root.innerHTML = `
    <div class="list-stack">
      ${items.map((item) => `
        <button class="selection-card" type="button" data-appointment-id="${item.id}" data-status="${item.status}">
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
  setPanelMessage(document.getElementById('adminMsg'), response?.message || (response?.success ? 'Appointment updated.' : 'Unable to update appointment.'), response?.success ? 'success' : 'error');
  if (response?.success) {
    await loadReviewAppointments();
  }
};

loadReviewAppointments();
