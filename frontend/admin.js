if (window.mountSkinRejuveLogos) window.mountSkinRejuveLogos();

const api = 'http://localhost:8080';
let token = localStorage.getItem('token') || '';

async function request(path, method = 'GET', body) {
  const res = await fetch(`${api}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
    body: body ? JSON.stringify(body) : undefined,
  });
  return res.json();
}

document.getElementById('updateBtn').onclick = async () => {
  const appointmentId = document.getElementById('appointmentId').value;
  const status = document.getElementById('status').value;
  const denialReason = document.getElementById('denialReason').value;
  const r = await request(`/api/appointments/${appointmentId}`, 'PATCH', { status, denialReason });
  document.getElementById('adminMsg').textContent = JSON.stringify(r, null, 2);
};
