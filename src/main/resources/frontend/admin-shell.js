const { request, getToken, getUserRole, setToken, decodeTokenPayload } = window.skinRejuveApi;

if (!getToken()) {
  window.location.replace('index.html?auth=login');
}

if (getUserRole() !== 'ADMIN' && getUserRole() !== 'STAFF') {
  window.location.replace('dashboard.html');
}

const page = document.body.dataset.adminPage || 'dashboard';
const navGroup = page === 'review' ? 'appointments' : page;
const pageTitles = {
  dashboard: 'Operations overview',
  appointments: 'Manage schedules',
  registration: 'Review new signups',
  reports: 'Audit & analytics',
  landing: 'Settings & content controls',
};
const tokenPayload = decodeTokenPayload(getToken()) || {};
const displayName = tokenPayload.fullName || tokenPayload.name || tokenPayload.email || 'Admin';
const roleLabel = getUserRole() === 'STAFF' ? 'Staff' : 'Admin';

function sidebarIcon(kind) {
  const icons = {
    dashboard: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5v8.5a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="currentColor"/></svg>',
    appointments: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h2v2h6V2h2v2h2a2 2 0 0 1 2 2v13a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2h2zm12 8H5v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1zM7 13h3v3H7zm5 0h3v3h-3z" fill="currentColor"/></svg>',
    registration: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3h11a2 2 0 0 1 2 2v4h1.5A2.5 2.5 0 0 1 22 11.5V19a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2zm3 4v2h8V7zm0 5v2h8v-2zm0 5v2h5v-2zM4 7h1v12a3 3 0 0 0 3 3h9v1H8a4 4 0 0 1-4-4z" fill="currentColor"/></svg>',
    reports: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8 1.5V8h4.5zM8 12h8v1.75H8zm0 4h8v1.75H8zm0-8h3v1.75H8z" fill="currentColor"/></svg>',
    landing: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 1.75a3.25 3.25 0 0 1 3.21 2.74l.1.63a6.76 6.76 0 0 1 1.95 1.12l.6-.18a3.25 3.25 0 0 1 3.9 4.28l-.23.58c.37.7.64 1.44.79 2.22l.62.24a3.25 3.25 0 0 1 0 6.05l-.62.24a6.8 6.8 0 0 1-.8 2.22l.24.58a3.25 3.25 0 0 1-3.9 4.28l-.59-.18a6.76 6.76 0 0 1-1.96 1.12l-.09.63a3.25 3.25 0 0 1-6.42 0l-.1-.63a6.76 6.76 0 0 1-1.95-1.12l-.6.18a3.25 3.25 0 0 1-3.9-4.28l.23-.58A6.8 6.8 0 0 1 1.68 19l-.62-.24a3.25 3.25 0 0 1 0-6.05l.62-.24c.16-.78.43-1.52.8-2.22l-.24-.58a3.25 3.25 0 0 1 3.9-4.28l.59.18a6.76 6.76 0 0 1 1.96-1.12l.09-.63A3.25 3.25 0 0 1 12 1.75zm0 6a4.25 4.25 0 1 0 0 8.5 4.25 4.25 0 0 0 0-8.5z" fill="currentColor"/></svg>',
  };
  return icons[kind] || '';
}

function mountSidebar() {
  const sidebar = document.querySelector('.admin-sidebar');
  if (!sidebar) return;

  sidebar.innerHTML = `
    <div class="admin-sidebar-top">
      <div class="brand admin-sidebar-brand" data-skin-rejuve-logo data-logo-size="compact" data-logo-subtitle="ADMIN CONTROL CENTER"></div>
      <div class="sidebar-intro">
        <span class="sidebar-chip">${roleLabel}</span>
        <p>${pageTitles[navGroup] || 'Clinic operations'}</p>
      </div>
      <nav class="admin-nav-list" aria-label="Admin navigation">
        <a href="admin-dashboard.html" data-admin-nav="dashboard"><span class="admin-nav-icon">${sidebarIcon('dashboard')}</span><span class="admin-nav-copy"><strong>Dashboard</strong><small>Pulse of daily activity</small></span></a>
        <a href="admin-appointments.html" data-admin-nav="appointments"><span class="admin-nav-icon">${sidebarIcon('appointments')}</span><span class="admin-nav-copy"><strong>Appointments</strong><small>Bookings and queue flow</small></span></a>
        <a href="admin-registration.html" data-admin-nav="registration"><span class="admin-nav-icon">${sidebarIcon('registration')}</span><span class="admin-nav-copy"><strong>Registration</strong><small>New accounts and intake</small></span></a>
        <a href="admin-reports.html" data-admin-nav="reports"><span class="admin-nav-icon">${sidebarIcon('reports')}</span><span class="admin-nav-copy"><strong>Audit Log</strong><small>History, reports, and tracking</small></span></a>
        <a href="admin-landing.html" data-admin-nav="landing"><span class="admin-nav-icon">${sidebarIcon('landing')}</span><span class="admin-nav-copy"><strong>Settings</strong><small>Profile, security, and landing page</small></span></a>
      </nav>
    </div>
    <div class="sidebar-utility-card">
      <div>
        <span class="sidebar-utility-label">Active workspace</span>
        <strong>${pageTitles[navGroup] || 'Clinic operations'}</strong>
      </div>
      <span class="status-pill status-muted">${roleLabel}</span>
    </div>
    <div class="sidebar-user-card">
      <div class="sidebar-user-avatar">${displayName.trim().charAt(0).toUpperCase() || 'A'}</div>
      <div>
        <strong>${displayName}</strong>
        <span>${roleLabel}</span>
      </div>
    </div>
    <button class="secondary-btn admin-logout" id="adminLogoutBtn" type="button">LOG OUT</button>
  `;

  if (window.mountSkinRejuveLogos) window.mountSkinRejuveLogos();

  sidebar.querySelectorAll('[data-admin-nav]').forEach((link) => {
    if (link.dataset.adminNav === navGroup) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    }
  });

  const logoutButton = document.getElementById('adminLogoutBtn');
  if (logoutButton) {
    logoutButton.addEventListener('click', () => {
      setToken('');
      window.location.replace('index.html?auth=login');
    });
  }
}

mountSidebar();

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
