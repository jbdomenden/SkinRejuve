if (window.mountSkinRejuveLogos) window.mountSkinRejuveLogos();

const { request, getToken, setToken } = window.skinRejuveApi;

if (!getToken()) {
  window.location.replace('login.html');
}

const profileMsg = document.getElementById('profileMsg');
const historyEl = document.getElementById('history');
const serviceSelect = document.getElementById('serviceId');
const slotSelect = document.getElementById('slotId');

function setMessage(el, message, state = 'info') {
  el.textContent = message;
  el.dataset.state = state;
}

function formatMoney(priceCents) {
  return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format((priceCents || 0) / 100);
}

function formatSlot(slot) {
  const start = new Date(slot.startAt);
  return `${start.toLocaleString()} · Staff ${slot.staffId.slice(0, 8)}`;
}

async function loadProfile() {
  const response = await request('/api/patient/profile');
  if (response?.success && response.data) {
    document.getElementById('firstName').value = response.data.firstName || '';
    document.getElementById('lastName').value = response.data.lastName || '';
    setMessage(profileMsg, 'Profile loaded from the live backend.', 'success');
    return;
  }
  setMessage(profileMsg, response?.message || 'Complete your profile to continue.', 'info');
}

async function loadServicesAndSlots() {
  const [servicesResponse, slotsResponse] = await Promise.all([
    request('/api/services'),
    request('/api/appointments/slots'),
  ]);

  const services = servicesResponse?.data || [];
  const slots = slotsResponse?.data || [];

  serviceSelect.innerHTML = services.length
    ? services.map((service) => `<option value="${service.id}">${service.name} · ${formatMoney(service.priceCents)}</option>`).join('')
    : '<option value="">No services configured</option>';

  slotSelect.innerHTML = slots.length
    ? slots.map((slot) => `<option value="${slot.id}">${formatSlot(slot)}</option>`).join('')
    : '<option value="">No appointment slots available</option>';
}

async function loadHistory() {
  historyEl.textContent = 'Loading appointment history...';
  const response = await request('/api/appointments/history');
  historyEl.textContent = JSON.stringify(response, null, 2);
}

document.getElementById('logoutBtn').onclick = () => {
  setToken('');
  window.location.replace('login.html');
};

document.getElementById('saveProfileBtn').onclick = async () => {
  const firstName = document.getElementById('firstName').value.trim();
  const lastName = document.getElementById('lastName').value.trim();
  const response = await request('/api/patient/profile', 'POST', { firstName, lastName });
  setMessage(profileMsg, response?.message || (response?.success ? 'Profile saved.' : 'Unable to save profile.'), response?.success ? 'success' : 'error');
};

document.getElementById('bookBtn').onclick = async () => {
  const serviceId = serviceSelect.value;
  const slotId = slotSelect.value;
  const response = await request('/api/appointments', 'POST', { serviceId, slotId });
  historyEl.textContent = JSON.stringify(response, null, 2);
  if (response?.success) {
    await loadServicesAndSlots();
  }
};

document.getElementById('historyBtn').onclick = loadHistory;

loadProfile();
loadServicesAndSlots();
loadHistory();
