(function sidebarModule() {
  const api = window.skinRejuveApi;
  const root = document.querySelector('[data-sidebar-root]');
  if (!api || !root) return;

  const { decodeTokenPayload, getToken, getUserRole, setToken } = api;
  const token = getToken();
  const payload = decodeTokenPayload(token) || {};
  const role = document.body.classList.contains('admin-bg') || ['ADMIN', 'STAFF'].includes(getUserRole())
    ? 'admin'
    : 'patient';

  const displayName = payload.fullName || payload.name || payload.email || (role === 'admin' ? 'Admin' : 'Patient');
  const roleLabel = role === 'admin' ? (getUserRole() === 'STAFF' ? 'Staff' : 'Admin') : 'Patient';
  const activePage = role === 'admin'
    ? (document.body.dataset.adminPage === 'review' ? 'appointments' : (document.body.dataset.adminPage || 'dashboard'))
    : (document.body.dataset.patientPage || 'history');

  const icons = {
    home: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 10.6 12 3l9 7.6v9.8a1 1 0 0 1-1 1h-5.5v-7h-5v7H4a1 1 0 0 1-1-1z" fill="currentColor"/></svg>',
    appointment: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 2h2v2h6V2h2v2h2a2 2 0 0 1 2 2v13a3 3 0 0 1-3 3H6a3 3 0 0 1-3-3V6a2 2 0 0 1 2-2h2zm12 8H5v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1z" fill="currentColor"/></svg>',
    history: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M11.5 3a9.5 9.5 0 1 1-9 12h2.4a7.2 7.2 0 1 0 1.8-6L6 11.7h6V5.7L9.8 8A9.4 9.4 0 0 1 11.5 3z" fill="currentColor"/></svg>',
    account: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 2.5a5.5 5.5 0 1 1 0 11 5.5 5.5 0 0 1 0-11zm0 13c4.7 0 8.5 2.6 8.5 5.7 0 .7-.6 1.3-1.3 1.3H4.8c-.7 0-1.3-.6-1.3-1.3 0-3.1 3.8-5.7 8.5-5.7z" fill="currentColor"/></svg>',
    logout: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M10 3h8a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-8v-2h8V5h-8zm1.4 4.4L10 8.8l2.2 2.2H3v2h9.2L10 15.2l1.4 1.4L16 12z" fill="currentColor"/></svg>',
    dashboard: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 11.5 12 4l9 7.5v8.5a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z" fill="currentColor"/></svg>',
    patients: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M9 4a4 4 0 1 1 0 8 4 4 0 0 1 0-8zm8.2 1.5a3.3 3.3 0 1 1-2.1 5.9 5.8 5.8 0 0 0 2.1-5.9zM3 19c0-2.8 3.1-5 6-5s6 2.2 6 5v1H3zm13.3 1v-1a6 6 0 0 0-1.8-4.3c2.5.1 5.5 1.8 5.5 4.3v1z" fill="currentColor"/></svg>',
    reports: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M6 2h9l5 5v13a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2zm8 1.5V8h4.5zM8 12h8v1.75H8zm0 4h8v1.75H8zm0-8h3v1.75H8z" fill="currentColor"/></svg>',
  };

  const patientLinks = [
    { key: 'home', label: 'Home', href: '/frontend/dashboard/html/dashboard.html' },
    { key: 'appointment', label: 'Appointment', button: true, id: 'openBookingFromNav' },
    { key: 'history', label: 'History', href: '/frontend/dashboard/html/dashboard.html#historyTableContainer' },
    { key: 'account', label: 'Account', href: '/frontend/dashboard/html/account.html' },
  ];

  const adminLinks = [
    { key: 'dashboard', label: 'Home', href: '/frontend/admin/html/admin-dashboard.html' },
    { key: 'appointments', label: 'Appointments', href: '/frontend/admin/html/admin-appointments.html' },
    { key: 'registration', label: 'Patients', href: '/frontend/admin/html/admin-registration.html' },
    { key: 'reports', label: 'Reports', href: '/frontend/admin/html/admin-reports.html' },
    { key: 'landing', label: 'Account', href: '/frontend/admin/html/admin-landing.html' },
  ];

  const links = role === 'admin' ? adminLinks : patientLinks;
  const navMarkup = links.map((link) => {
    const isActive = activePage === link.key;
    const attrs = isActive ? ' aria-current="page"' : '';
    const common = `class="app-sidebar__link${isActive ? ' is-active' : ''}" data-nav-key="${link.key}"${attrs}`;
    if (link.button) {
      return `<li><button ${common} type="button" id="${link.id}"><span class="app-sidebar__icon">${icons[link.key]}</span><span>${link.label}</span></button></li>`;
    }
    return `<li><a ${common} href="${link.href}"><span class="app-sidebar__icon">${icons[link.key] || icons.account}</span><span>${link.label}</span></a></li>`;
  }).join('');

  root.innerHTML = `
    <div class="app-sidebar__inner">
      <div class="app-sidebar__brand" data-skin-rejuve-logo data-logo-size="compact" data-logo-subtitle="SINCE 2011"></div>
      <nav class="app-sidebar__nav" aria-label="${role === 'admin' ? 'Admin navigation' : 'Patient navigation'}">
        <ul>${navMarkup}</ul>
      </nav>
      <div class="app-sidebar__footer">
        <div class="app-sidebar__user" aria-label="Signed in user">
          <div class="app-sidebar__avatar" aria-hidden="true">${displayName.trim().charAt(0).toUpperCase() || 'U'}</div>
          <div>
            <p class="app-sidebar__name" id="patientName">${displayName}</p>
            <p class="app-sidebar__role">${roleLabel}</p>
          </div>
        </div>
        <button class="app-sidebar__link app-sidebar__logout" id="logoutBtn" type="button">
          <span class="app-sidebar__icon">${icons.logout}</span>
          <span>Log Out</span>
        </button>
      </div>
    </div>
  `;

  const content = document.querySelector('[data-sidebar-content]');
  if (content) {
    const sidebarId = root.id || 'primarySidebar';
    root.id = sidebarId;
    const topbar = document.createElement('header');
    topbar.className = 'app-mobile-topbar';
    topbar.innerHTML = `
      <button class="app-mobile-topbar__toggle" type="button" aria-label="Open navigation menu" aria-controls="${sidebarId}" aria-expanded="false">
        <span></span><span></span><span></span>
      </button>
      <div class="app-mobile-topbar__brand" data-skin-rejuve-logo data-logo-size="compact" data-logo-subtitle="SINCE 2011"></div>
    `;
    content.prepend(topbar);
  }

  const backdrop = document.createElement('button');
  backdrop.type = 'button';
  backdrop.className = 'app-sidebar-backdrop';
  backdrop.setAttribute('aria-label', 'Close navigation menu');
  document.body.appendChild(backdrop);

  const toggle = document.querySelector('.app-mobile-topbar__toggle');
  let previousFocus = null;

  function closeSidebar() {
    document.body.classList.remove('sidebar-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
    if (previousFocus) previousFocus.focus();
  }

  function openSidebar() {
    previousFocus = document.activeElement;
    document.body.classList.add('sidebar-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'true');
    const firstFocusable = root.querySelector('a, button');
    if (firstFocusable) firstFocusable.focus();
  }

  function trapFocus(event) {
    if (!document.body.classList.contains('sidebar-open') || event.key !== 'Tab') return;
    const nodes = root.querySelectorAll('a[href], button:not([disabled])');
    if (!nodes.length) return;
    const first = nodes[0];
    const last = nodes[nodes.length - 1];
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }

  if (toggle) {
    toggle.addEventListener('click', () => {
      if (document.body.classList.contains('sidebar-open')) closeSidebar();
      else openSidebar();
    });
  }

  backdrop.addEventListener('click', closeSidebar);
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeSidebar();
    trapFocus(event);
  });

  root.querySelectorAll('.app-sidebar__link').forEach((link) => {
    link.addEventListener('click', () => {
      if (window.matchMedia('(max-width: 1024px)').matches) closeSidebar();
    });
  });

  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      setToken('');
      window.location.replace('/frontend/landing/html/index.html?auth=login');
    });
  }

  if (window.mountSkinRejuveLogos) window.mountSkinRejuveLogos();
})();
