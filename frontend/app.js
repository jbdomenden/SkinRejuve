const api = 'http://localhost:8080';
let token = localStorage.getItem('token') || '';

const loginTab = document.getElementById('loginTab');
const registerTab = document.getElementById('registerTab');
const loginPanel = document.getElementById('loginPanel');
const registerPanel = document.getElementById('registerPanel');

loginTab.onclick = () => {
  loginTab.classList.add('tab-active');
  registerTab.classList.remove('tab-active');
  loginPanel.classList.remove('hidden');
  registerPanel.classList.add('hidden');
};

registerTab.onclick = () => {
  registerTab.classList.add('tab-active');
  loginTab.classList.remove('tab-active');
  registerPanel.classList.remove('hidden');
  loginPanel.classList.add('hidden');
};

async function request(path, method = 'GET', body) {
  const res = await fetch(`${api}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

document.getElementById('registerBtn').onclick = async () => {
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const r = await request('/api/auth/register', 'POST', { email, password });
  document.getElementById('registerMsg').textContent = JSON.stringify(r, null, 2);
};

document.getElementById('loginBtn').onclick = async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const r = await request('/api/auth/login', 'POST', { email, password });
  if (r?.data?.accessToken) {
    token = r.data.accessToken;
    localStorage.setItem('token', token);
  }
  document.getElementById('authMsg').textContent = JSON.stringify(r, null, 2);
};

document.getElementById('saveProfileBtn').onclick = async () => {
  const firstName = document.getElementById('firstName').value;
  const lastName = document.getElementById('lastName').value;
  const r = await request('/api/patient/profile', 'POST', { firstName, lastName });
  document.getElementById('profileMsg').textContent = JSON.stringify(r, null, 2);
};

document.getElementById('bookBtn').onclick = async () => {
  const serviceId = document.getElementById('serviceId').value;
  const dateRaw = document.getElementById('startAt').value;
  const startAt = dateRaw ? new Date(dateRaw).toISOString() : '';
  const r = await request('/api/appointments', 'POST', { serviceId, startAt });
  document.getElementById('history').textContent = JSON.stringify(r, null, 2);
};

document.getElementById('historyBtn').onclick = async () => {
  const r = await request('/api/appointments/history');
  document.getElementById('history').textContent = JSON.stringify(r, null, 2);
};
