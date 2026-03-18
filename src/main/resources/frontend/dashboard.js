if (window.mountSkinRejuveLogos) window.mountSkinRejuveLogos();

const { request, getToken, setToken } = window.skinRejuveApi;

if (!getToken()) {
  window.location.replace('login.html');
}

document.getElementById('logoutBtn').onclick = () => {
  setToken('');
  window.location.replace('login.html');
};

document.getElementById('saveProfileBtn').onclick = async () => {
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const response = await request('/api/patient/profile', 'POST', { firstName, lastName });
  document.getElementById('profileMsg').textContent = JSON.stringify(response, null, 2);
};

document.getElementById('bookBtn').onclick = async () => {
  const serviceId = document.getElementById('serviceId').value;
  const dateRaw = document.getElementById('startAt').value;
  const startAt = dateRaw ? new Date(dateRaw).toISOString() : '';
  const response = await request('/api/appointments', 'POST', { serviceId, startAt });
  document.getElementById('history').textContent = JSON.stringify(response, null, 2);
};

document.getElementById('historyBtn').onclick = async () => {
  const response = await request('/api/appointments/history');
  document.getElementById('history').textContent = JSON.stringify(response, null, 2);
};
