if (window.mountSkinRejuveLogos) window.mountSkinRejuveLogos();

const { request, getToken, setToken } = window.skinRejuveApi;

if (!getToken()) {
  window.location.replace('/frontend/landing/html/index.html?auth=login');
}

const profileMsg = document.getElementById('profileMsg');
const bookingMsg = document.getElementById('bookingMsg');
const historyEl = document.getElementById('history');
const serviceSelect = document.getElementById('serviceId');
const slotSelect = document.getElementById('slotId');

function setMessage(el, message, state = 'info') {
  el.textContent = message;
  el.dataset.state = state;
}

function formatMoney(price) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format((price || 0) / 1);
}

function formatDate(value) {
  return value ? new Date(value).toLocaleString() : '—';
}

function formatSlot(slot) {
  return `${formatDate(slot.startAt)} · ${slot.staffName}`;
}

function renderMetrics(metrics) {
  document.getElementById('dashboardOverview').innerHTML = (metrics || []).map((metric) => `
    <article class="metric-card metric-card-light">
      <div class="metric-label">${metric.label}</div>
      <div class="metric-value">${metric.value}</div>
    </article>
  `).join('');
}

function renderHistory(items) {
  if (!items.length) {
    historyEl.innerHTML = '<div class="empty-state">No appointments booked yet.</div>';
    return;
  }
  historyEl.innerHTML = `
    <div class="list-stack">
      ${items.map((item) => `
        <article class="list-card list-card-light">
          <div>
            <strong>${item.serviceName}</strong>
            <p>${formatDate(item.startAt)}</p>
          </div>
          <div class="list-card-meta">
            <span class="status-pill">${item.status}</span>
            <span>${formatMoney(item.servicePrice)}</span>
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

async function loadProfile() {
  const response = await request('/api/patient/profile');
  if (response?.success && response.data) {
    document.getElementById('firstName').value = response.data.firstName || '';
    document.getElementById('lastName').value = response.data.lastName || '';
    setMessage(profileMsg, 'Profile synced with the backend.', 'success');
    return;
  }
  setMessage(profileMsg, response?.message || 'Complete your profile to continue.', 'info');
}

async function loadOverview() {
  const response = await request('/api/patient/overview');
  const data = response?.data || {};
  renderMetrics(data.metrics || []);
  document.getElementById('nextAppointment').innerHTML = data.nextAppointment
    ? `<div class="next-appointment-card"><strong>Next appointment</strong><span>${data.nextAppointment.serviceName}</span><span>${formatDate(data.nextAppointment.startAt)}</span></div>`
    : '<div class="empty-state">No upcoming appointment booked yet.</div>';
}

async function loadServicesAndSlots() {
  const [servicesResponse, slotsResponse] = await Promise.all([
    request('/api/services'),
    request('/api/appointments/slots'),
  ]);

  const services = servicesResponse?.data || [];
  const slots = slotsResponse?.data || [];

  serviceSelect.innerHTML = services.length
    ? services.map((service) => `<option value="${service.id}">${service.name} · ${formatMoney(service.price)}</option>`).join('')
    : '<option value="">No services configured</option>';

  slotSelect.innerHTML = slots.length
    ? slots.map((slot) => `<option value="${slot.id}">${formatSlot(slot)}</option>`).join('')
    : '<option value="">No appointment slots available</option>';
}

async function loadHistory() {
  const response = await request('/api/appointments/history');
  renderHistory(response?.data || []);
}

document.getElementById('logoutBtn').onclick = () => {
  setToken('');
  window.location.replace('/frontend/landing/html/index.html?auth=login');
};

document.getElementById('saveProfileBtn').onclick = async () => {
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const response = await request('/api/patient/profile', 'POST', { firstName, lastName });
  setMessage(profileMsg, response?.message || (response?.success ? 'Profile saved.' : 'Unable to save profile.'), response?.success ? 'success' : 'error');
  if (response?.success) {
    await loadOverview();
  }
};

document.getElementById('bookBtn').onclick = async () => {
  const serviceId = serviceSelect.value;
  const slotId = slotSelect.value;
  const response = await request('/api/appointments', 'POST', { serviceId, slotId });
  setMessage(bookingMsg, response?.message || (response?.success ? 'Appointment booked successfully.' : 'Unable to book appointment.'), response?.success ? 'success' : 'error');
  if (response?.success) {
    await Promise.all([loadServicesAndSlots(), loadHistory(), loadOverview()]);
  }
};

document.getElementById('historyBtn').onclick = loadHistory;

const bookingIntent = new URLSearchParams(window.location.search).get('booking');
if (bookingIntent === '1') {
  document.getElementById('bookingPanel')?.classList.add('booking-focus');
  document.getElementById('serviceId')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

Promise.all([loadProfile(), loadServicesAndSlots(), loadHistory(), loadOverview()]);
