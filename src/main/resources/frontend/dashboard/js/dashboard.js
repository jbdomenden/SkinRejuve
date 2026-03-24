if (window.mountSkinRejuveLogos) window.mountSkinRejuveLogos();

const { request, getToken, setToken, getUserEmail } = window.skinRejuveApi;

if (!getToken()) {
  window.location.replace('/frontend/landing/html/index.html?auth=login');
}

const SERVICE_CATALOG = [
  {
    id: 'doctors-procedures',
    title: 'Doctors Procedures',
    description: 'Physician-led aesthetic procedures tailored to your treatment plan.',
  },
  {
    id: 'embrace-morpheus',
    title: 'Embrace Morpheus',
    description: 'Advanced rejuvenation treatment for skin texture and contour support.',
  },
  {
    id: 'face-and-body-contouring',
    title: 'Face and Body Contouring',
    description: 'Non-invasive contouring options for defined and balanced results.',
  },
  {
    id: 'facial-services',
    title: 'Facial Services',
    description: 'Professional facial treatments for cleansing, hydration, and skin renewal.',
  },
  {
    id: 'gluta-drip',
    title: 'Gluta Drip',
    description: 'Wellness infusion service offered according to clinic protocol.',
  },
  {
    id: 'harmony-xl-pro',
    title: 'Harmony XL Pro',
    description: 'Light-based treatment options for selected skin concerns.',
  },
  {
    id: 'picoluxe-785',
    title: 'PicoLuxe 785',
    description: 'Laser treatment support for pigmentation-focused care.',
  },
];

const state = {
  appointments: [],
  filtered: [],
  profile: null,
};

function escapeHtml(value = '') {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function normalizeStatus(raw = '') {
  const clean = String(raw).trim().toUpperCase().replace(/\s+/g, '_');
  if (clean === 'INPROGRESS') return 'IN_PROGRESS';
  return clean || 'PENDING';
}

function formatStatus(status) {
  return normalizeStatus(status).replaceAll('_', ' ').toLowerCase().replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value) {
  if (!value) return '—';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return '—';
  return parsed.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
}

function formatSlot(slot) {
  const staff = slot?.staffName ? ` · ${slot.staffName}` : '';
  return `${formatDate(slot.startAt)}${staff}`;
}

function setStateBanner(el, message, kind = 'info') {
  if (!el) return;
  el.textContent = message;
  el.dataset.state = kind;
}

function logout() {
  setToken('');
  window.location.replace('/frontend/landing/html/index.html?auth=login');
}

function setupShellInteractions() {
  const layout = document.querySelector('.patient-layout');
  const toggle = document.getElementById('mobileMenuToggle');
  const backdrop = document.getElementById('sidebarBackdrop');
  const logoutBtn = document.getElementById('logoutBtn');
  const mobileLogout = document.getElementById('mobileLogoutBtn');

  const closeMenu = () => {
    layout?.classList.remove('nav-open');
    if (toggle) toggle.setAttribute('aria-expanded', 'false');
  };

  toggle?.addEventListener('click', () => {
    const next = !layout?.classList.contains('nav-open');
    layout?.classList.toggle('nav-open', next);
    toggle.setAttribute('aria-expanded', String(next));
  });

  backdrop?.addEventListener('click', closeMenu);
  document.querySelectorAll('.sidebar-nav a').forEach((item) => item.addEventListener('click', closeMenu));

  logoutBtn?.addEventListener('click', logout);
  mobileLogout?.addEventListener('click', logout);
}

function setSidebarProfile(profile) {
  const userName = document.getElementById('sidebarUserName');
  if (!userName) return;
  const fullName = [profile?.firstName, profile?.lastName].filter(Boolean).join(' ').trim();
  userName.textContent = fullName || getUserEmail() || 'Skin Rejuve Patient';
}

function computeMetrics(appointments = []) {
  const counts = appointments.reduce((acc, item) => {
    const status = normalizeStatus(item.status);
    acc.total += 1;
    if (status === 'COMPLETED') acc.completed += 1;
    if (status === 'DENIED') acc.denied += 1;
    if (status === 'PENDING' || status === 'IN_PROGRESS') acc.pending += 1;
    return acc;
  }, { total: 0, completed: 0, denied: 0, pending: 0 });

  return [
    { label: 'Total Records', value: counts.total },
    { label: 'Completed Appointments', value: counts.completed },
    { label: 'Denied Appointments', value: counts.denied },
    { label: 'Pending Appointments', value: counts.pending },
  ];
}

function renderMetrics(appointments) {
  const root = document.getElementById('dashboardOverview');
  if (!root) return;

  const cards = computeMetrics(appointments);
  root.innerHTML = cards.map((metric) => `
    <article class="kpi-card" aria-label="${metric.label}">
      <p class="kpi-label">${metric.label}</p>
      <p class="kpi-value">${metric.value}</p>
    </article>
  `).join('');
}

function renderRecords(items = []) {
  const tableBody = document.getElementById('recordsTableBody');
  const tableWrap = document.getElementById('recordsTableWrap');
  const stateBanner = document.getElementById('recordsState');
  if (!tableBody || !tableWrap || !stateBanner) return;

  if (!items.length) {
    tableWrap.hidden = true;
    setStateBanner(stateBanner, 'No appointments found yet. Book your first appointment to get started.', 'info');
    return;
  }

  tableWrap.hidden = false;
  stateBanner.hidden = true;
  tableBody.innerHTML = items.map((item) => {
    const status = normalizeStatus(item.status);
    const details = encodeURIComponent(`${item.serviceName || 'Service'} | ${formatDate(item.startAt)} | ${formatStatus(status)}`);
    return `
      <tr>
        <td class="wrap-cell" data-label="Service">${escapeHtml(item.serviceName || 'General Service')}</td>
        <td data-label="Date">${escapeHtml(formatDate(item.startAt))}</td>
        <td data-label="Status"><span class="status-pill status-${status.toLowerCase()}">${formatStatus(status)}</span></td>
        <td class="wrap-cell" data-label="Email">${escapeHtml(item.patientEmail || getUserEmail() || '—')}</td>
        <td data-label="Action"><a class="action-btn" href="/frontend/dashboard/html/dashboard.html?view=${details}">View</a></td>
      </tr>
    `;
  }).join('');
}

function applyRecordFilters() {
  const searchValue = (document.getElementById('recordsSearch')?.value || '').toLowerCase().trim();
  const statusFilter = document.getElementById('statusFilter')?.value || 'all';

  state.filtered = state.appointments.filter((item) => {
    const status = normalizeStatus(item.status);
    const matchStatus = statusFilter === 'all' || status === statusFilter;
    const haystack = `${item.serviceName || ''} ${item.patientEmail || getUserEmail() || ''} ${formatDate(item.startAt)}`.toLowerCase();
    const matchSearch = !searchValue || haystack.includes(searchValue);
    return matchStatus && matchSearch;
  });

  const stateBanner = document.getElementById('recordsState');
  if (state.filtered.length === 0 && state.appointments.length > 0) {
    document.getElementById('recordsTableWrap').hidden = true;
    setStateBanner(stateBanner, 'No matching appointments for your current filters.', 'info');
    stateBanner.hidden = false;
    return;
  }

  if (stateBanner) stateBanner.hidden = false;
  renderRecords(state.filtered);
}

async function loadProfile() {
  const profileMsg = document.getElementById('profileMsg');
  const response = await request('/api/patient/profile');
  if (!response?.success || !response.data) {
    if (profileMsg) {
      profileMsg.textContent = 'Complete your profile details to keep your account current.';
      profileMsg.dataset.state = 'info';
    }
    setSidebarProfile(null);
    return;
  }

  state.profile = response.data;
  const firstNameInput = document.getElementById('firstName');
  const lastNameInput = document.getElementById('lastName');
  if (firstNameInput) firstNameInput.value = state.profile.firstName || '';
  if (lastNameInput) lastNameInput.value = state.profile.lastName || '';

  setSidebarProfile(state.profile);
}

async function loadAppointments() {
  const stateBanner = document.getElementById('recordsState');
  const tableWrap = document.getElementById('recordsTableWrap');
  if (!stateBanner || !tableWrap) return;

  stateBanner.hidden = false;
  tableWrap.hidden = true;
  setStateBanner(stateBanner, 'Loading appointment records…', 'info');

  const response = await request('/api/appointments/history');
  if (!response?.success) {
    setStateBanner(stateBanner, response?.message || 'Unable to load appointments right now. Please try again.', 'error');
    return;
  }

  state.appointments = response.data || [];
  renderMetrics(state.appointments);
  applyRecordFilters();
}

async function loadServicesAndSlots() {
  const serviceSelect = document.getElementById('serviceId');
  const slotSelect = document.getElementById('slotId');
  if (!serviceSelect || !slotSelect) return;

  const [servicesResponse, slotsResponse] = await Promise.all([
    request('/api/services'),
    request('/api/appointments/slots'),
  ]);

  const services = servicesResponse?.data || [];
  const slots = slotsResponse?.data || [];

  serviceSelect.innerHTML = services.length
    ? services.map((service) => `<option value="${service.id}">${escapeHtml(service.name)}</option>`).join('')
    : '<option value="">No services available</option>' ;

  slotSelect.innerHTML = slots.length
    ? slots.map((slot) => `<option value="${slot.id}">${escapeHtml(formatSlot(slot))}</option>`).join('')
    : '<option value="">No slots available</option>' ;

  const selectedServiceId = new URLSearchParams(window.location.search).get('serviceId');
  if (selectedServiceId && services.some((service) => String(service.id) === selectedServiceId)) {
    serviceSelect.value = selectedServiceId;
  }
}

function bindDashboardEvents() {
  const search = document.getElementById('recordsSearch');
  const status = document.getElementById('statusFilter');
  search?.addEventListener('input', applyRecordFilters);
  status?.addEventListener('change', applyRecordFilters);

  const bookingForm = document.getElementById('bookingForm');
  const bookingMsg = document.getElementById('bookingMsg');

  bookingForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const serviceId = document.getElementById('serviceId')?.value;
    const slotId = document.getElementById('slotId')?.value;
    const response = await request('/api/appointments', 'POST', { serviceId, slotId });
    if (bookingMsg) {
      bookingMsg.textContent = response?.message || (response?.success ? 'Appointment request submitted successfully.' : 'Unable to submit appointment request.');
      bookingMsg.dataset.state = response?.success ? 'success' : 'error';
    }
    if (response?.success) {
      await Promise.all([loadAppointments(), loadServicesAndSlots()]);
    }
  });

  const profileForm = document.getElementById('profileForm');
  const profileMsg = document.getElementById('profileMsg');
  profileForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const firstName = document.getElementById('firstName')?.value.trim();
    const lastName = document.getElementById('lastName')?.value.trim();
    const response = await request('/api/patient/profile', 'POST', { firstName, lastName });
    if (profileMsg) {
      profileMsg.textContent = response?.message || (response?.success ? 'Profile saved successfully.' : 'Unable to save profile.');
      profileMsg.dataset.state = response?.success ? 'success' : 'error';
    }
    if (response?.success) {
      state.profile = response.data || { firstName, lastName };
      setSidebarProfile(state.profile);
    }
  });
}

async function initDashboardPage() {
  bindDashboardEvents();
  await Promise.all([loadProfile(), loadAppointments(), loadServicesAndSlots()]);
  if (new URLSearchParams(window.location.search).get('booking') === '1') {
    document.getElementById('bookingPanel')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

function toParam(title) {
  return encodeURIComponent(title.toLowerCase());
}

function matchAvailableService(apiServices, title) {
  return apiServices.find((service) => service?.name?.toLowerCase().includes(title.toLowerCase()));
}

function renderServiceCards(availableServices) {
  const grid = document.getElementById('servicesGrid');
  const stateBanner = document.getElementById('servicesState');
  if (!grid || !stateBanner) return;

  if (!availableServices.length) {
    grid.hidden = true;
    setStateBanner(stateBanner, 'No services are available at the moment. Please check back shortly.', 'info');
    return;
  }

  const selectedParam = (new URLSearchParams(window.location.search).get('service') || '').toLowerCase();
  grid.innerHTML = SERVICE_CATALOG.map((service) => {
    const match = matchAvailableService(availableServices, service.title);
    const targetQuery = match ? `serviceId=${encodeURIComponent(match.id)}&service=${toParam(match.name)}` : `service=${toParam(service.title)}`;
    const isSelected = selectedParam.includes(service.title.toLowerCase()) || selectedParam === service.title.toLowerCase();
    return `
      <article class="service-card ${isSelected ? 'is-selected' : ''}" tabindex="0" data-service-title="${escapeHtml(service.title)}">
        <h3>${service.title}</h3>
        <p>${service.description}</p>
        <a class="service-cta" href="/frontend/dashboard/html/dashboard.html?booking=1&${targetQuery}">Select Service</a>
      </article>
    `;
  }).join('');

  stateBanner.hidden = true;
  grid.hidden = false;

  grid.querySelectorAll('.service-card').forEach((card) => {
    card.addEventListener('click', (event) => {
      if (event.target.closest('.service-cta')) return;
      card.querySelector('.service-cta')?.click();
    });
    card.addEventListener('keydown', (event) => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        card.querySelector('.service-cta')?.click();
      }
    });
  });
}

async function initServicesPage() {
  await loadProfile();
  const stateBanner = document.getElementById('servicesState');
  setStateBanner(stateBanner, 'Loading services…', 'info');

  const response = await request('/api/services');
  if (!response?.success) {
    setStateBanner(stateBanner, 'Unable to load services. Please refresh and try again.', 'error');
    return;
  }
  renderServiceCards(response.data || []);
}

function handleViewQuery() {
  const view = new URLSearchParams(window.location.search).get('view');
  if (!view) return;
  setTimeout(() => {
    window.alert(decodeURIComponent(view));
    const next = new URL(window.location.href);
    next.searchParams.delete('view');
    window.history.replaceState({}, '', next.toString());
  }, 0);
}

setupShellInteractions();
handleViewQuery();

const page = document.body.dataset.page;
if (page === 'services') {
  initServicesPage();
} else {
  initDashboardPage();
}
