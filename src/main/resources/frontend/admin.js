if (window.mountSkinRejuveLogos) window.mountSkinRejuveLogos();

const { request, getToken, getUserRole, setToken } = window.skinRejuveApi;

if (!getToken()) {
  window.location.replace('login.html');
}

if (getUserRole() !== 'ADMIN') {
  window.location.replace('dashboard.html');
}

document.getElementById('updateBtn').onclick = async () => {
  const appointmentId = document.getElementById('appointmentId').value;
  const status = document.getElementById('status').value;
  const denialReason = document.getElementById('denialReason').value;
  const r = await request(`/api/appointments/${appointmentId}/status`, 'PATCH', { status, denialReason });
  document.getElementById('adminMsg').textContent = JSON.stringify(r, null, 2);
};

const adminLogoutBtn = document.getElementById('adminLogoutBtn');
if (adminLogoutBtn) {
  adminLogoutBtn.addEventListener('click', () => {
    setToken('');
    window.location.replace('login.html');
  });
}
