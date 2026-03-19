if (window.mountSkinRejuveLogos) window.mountSkinRejuveLogos();

const { request, getToken, getUserRole, setToken } = window.skinRejuveApi;

if (!getToken()) {
  window.location.replace('login.html');
}

if (getUserRole() !== 'ADMIN' && getUserRole() !== 'STAFF') {
  window.location.replace('dashboard.html');
}

const page = document.body.dataset.adminPage || 'dashboard';
document.querySelectorAll('[data-admin-nav]').forEach((link) => {
  if (link.dataset.adminNav === page) {
    link.classList.add('active');
    link.setAttribute('aria-current', 'page');
  }
});

const logoutButton = document.getElementById('adminLogoutBtn');
if (logoutButton) {
  logoutButton.addEventListener('click', () => {
    setToken('');
    window.location.replace('login.html');
  });
}

window.adminShell = {
  request,
  renderCurrency(value) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format((value || 0) / 1);
  },
  renderDate(value) {
    return value ? new Date(value).toLocaleString() : '—';
  },
  setPanelMessage(element, message, state = 'info') {
    element.textContent = message;
    element.dataset.state = state;
  },
  renderEmptyState(message) {
    return `<div class="empty-state">${message}</div>`;
  }
};
