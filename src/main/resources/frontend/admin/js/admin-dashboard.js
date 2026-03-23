const { request } = window.adminShell;

let currentModalStep = 1;

let registrationItems = [];
let appointmentsCache = [];

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatRegistrationStatus(item) {
  if (['ADMIN', 'STAFF'].includes(item.role)) return 'Admin / Staff';
  if (item.profileComplete && item.intakeComplete) return 'Complete';
  if (item.emailVerified) return 'Verified';
  return 'Pending';
}

function registrationTone(item) {
  if (['ADMIN', 'STAFF'].includes(item.role)) return 'status-muted';
  if (item.profileComplete && item.intakeComplete) return 'status-good';
  if (item.emailVerified) return 'status-pill';
  return 'status-muted';
}

function renderMetrics(appointments, registrations, overview) {
  const root = document.getElementById('metricsGrid');
  const denied = appointments.filter((item) => item.status === 'DENIED').length;
  const completed = appointments.filter((item) => item.status === 'COMPLETED').length;
  const userCount = registrations.filter((item) => item.role === 'PATIENT').length || overview?.metrics?.[0]?.value || 0;
  const cards = [
    { label: 'Users', value: userCount, note: 'Patient accounts in the system' },
    { label: 'Appointments', value: appointments.length, note: 'Bookings submitted to the clinic' },
    { label: 'Denied Appt.', value: denied, note: 'Requests needing follow-up or rebooking' },
    { label: 'Completed', value: completed, note: 'Visits closed successfully' },
  ];

  root.innerHTML = cards.map((metric) => `
    <article class="metric-card dashboard-stat-card">
      <div class="metric-label">${metric.label}</div>
      <div class="metric-value">${metric.value}</div>
      <div class="metric-footnote">${metric.note}</div>
    </article>
  `).join('');
}

function renderRecentAppointments(items) {
  const root = document.getElementById('recentAppointments');
  if (!items.length) {
    root.innerHTML = renderEmptyState('No appointments found.');
    return;
  }

  root.innerHTML = `
    <div class="list-stack dashboard-appointment-stack">
      ${items.slice(0, 5).map((item) => `
        <article class="list-card appointment-list-card dashboard-appointment-card">
          <div>
            <strong>${escapeHtml(item.patientName)}</strong>
            <p>${escapeHtml(item.serviceName)} • ${escapeHtml(renderDate(item.startAt))}</p>
          </div>
          <div class="list-card-meta">
            <span class="status-pill">${escapeHtml(item.status)}</span>
            <strong>${escapeHtml(renderCurrency(item.servicePrice || 0))}</strong>
          </div>
        </article>
      `).join('')}
    </div>
  `;
}

function renderCapacityBoard(items) {
  const root = document.getElementById('slotCapacity');
  if (!items.length) {
    root.innerHTML = renderEmptyState('No schedule data found.');
    return;
  }

  const byStatus = items.reduce((acc, item) => {
    acc[item.status] = (acc[item.status] || 0) + 1;
    return acc;
  }, {});

  const upcoming = items
    .filter((item) => item.startAt)
    .sort((a, b) => new Date(a.startAt) - new Date(b.startAt))
    .slice(0, 4);

  root.innerHTML = `
    <div class="dashboard-columns dashboard-capacity-grid">
      <section class="list-card list-card-light dashboard-status-panel dashboard-overview-panel">
        <div>
          <strong>Appointment status</strong>
          <p>Live count of bookings in each workflow stage.</p>
        </div>
        <div class="badge-row">${Object.entries(byStatus).map(([status, count]) => `<span class="status-pill">${escapeHtml(status)}: ${count}</span>`).join('')}</div>
      </section>
      <section class="list-card list-card-light dashboard-status-panel dashboard-overview-panel">
        <div>
          <strong>Upcoming visits</strong>
          <p>Next patients on the clinic calendar.</p>
        </div>
        <div class="mini-timeline">${upcoming.map((item) => `<div><strong>${escapeHtml(item.patientName)}</strong><span>${escapeHtml(renderDate(item.startAt))}</span></div>`).join('')}</div>
      </section>
    </div>
  `;

  root.querySelectorAll('[data-row-index]').forEach((button) => {
    button.addEventListener('click', () => {
      const row = rows[Number(button.dataset.rowIndex)];
      window.alert(`Viewing ${row.name} (${row.status})`);
    });
  });
}

function bindToolbar() {
  searchInput.addEventListener('input', renderTable);

  filterButton.addEventListener('click', () => {
    const statusCycle = ['ALL', 'PENDING', 'DENIED', 'COMPLETED'];
    activeFilter = statusCycle[(statusCycle.indexOf(activeFilter) + 1) % statusCycle.length];
    filterButton.textContent = activeFilter === 'ALL' ? 'Filter' : activeFilter;
    renderTable();
  });

  addUserButton.addEventListener('click', () => {
    window.alert('Add user flow can be connected here.');
  });
}

function renderUserManagement(items) {
  const root = document.getElementById('userManagementTable');
  if (!items.length) {
    root.innerHTML = renderEmptyState('No users match the current search and filter.');
    return;
  }

  root.innerHTML = `
    <div class="table-wrap dashboard-table-wrap">
      <table class="data-table data-table-elevated dashboard-user-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Date</th>
            <th>Status</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          ${items.map((item) => `
            <tr>
              <td>
                <strong>${escapeHtml(item.patientName)}</strong>
                <span>${escapeHtml(item.role)}</span>
              </td>
              <td>${escapeHtml(item.email)}</td>
              <td>${escapeHtml(renderDate(item.createdAt))}</td>
              <td><span class="status-pill ${registrationTone(item)}">${escapeHtml(formatRegistrationStatus(item))}</span></td>
              <td><a class="table-action-btn" href="/frontend/admin/html/admin-registration.html">View</a></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
  `;
}

function applyUserFilters() {
  const query = (document.getElementById('dashboardUserSearch')?.value || '').trim().toLowerCase();
  const filterValue = document.getElementById('dashboardUserFilter')?.value || 'ALL';

  const filtered = registrationItems.filter((item) => {
    const haystack = [item.patientName, item.email, item.role].join(' ').toLowerCase();
    const matchesQuery = !query || haystack.includes(query);
    let matchesFilter = true;

    if (filterValue === 'PENDING') matchesFilter = formatRegistrationStatus(item) === 'Pending';
    if (filterValue === 'COMPLETE') matchesFilter = formatRegistrationStatus(item) === 'Complete';
    if (filterValue === 'VERIFIED') matchesFilter = formatRegistrationStatus(item) === 'Verified';
    if (filterValue === 'ADMIN') matchesFilter = ['ADMIN', 'STAFF'].includes(item.role);

    return matchesQuery && matchesFilter;
  });

  renderUserManagement(filtered);
}


function setModalMessage(message, state = '') {
  const element = document.getElementById('addUserFormMessage');
  if (!element) return;
  element.textContent = message;
  element.dataset.state = state;
}

function toggleAddUserModal(show) {
  const modal = document.getElementById('addUserModal');
  if (!modal) return;
  modal.hidden = !show;
  document.body.classList.toggle('modal-open', show);
  if (show && window.mountSkinRejuveLogos) window.mountSkinRejuveLogos();
  if (!show) {
    currentModalStep = 1;
    updateModalStep();
    document.getElementById('addUserForm')?.reset();
    const noAllergyOption = document.querySelector('input[name="hasAllergies"][value="false"]');
    if (noAllergyOption) noAllergyOption.checked = true;
    setModalMessage('');
  }
}

function updateModalStep() {
  document.querySelectorAll('.dashboard-form-step').forEach((step) => {
    step.classList.toggle('is-active', Number(step.dataset.step) === currentModalStep);
  });
}

function readAddUserPayload(form) {
  const data = new FormData(form);
  return {
    fullName: data.get('fullName')?.toString().trim() || '',
    username: data.get('username')?.toString().trim() || '',
    email: data.get('email')?.toString().trim() || '',
    phone: data.get('phone')?.toString().trim() || '',
    dateOfBirth: data.get('dateOfBirth')?.toString() || '',
    password: data.get('password')?.toString() || '',
    confirmPassword: data.get('confirmPassword')?.toString() || '',
    skinTypes: data.getAll('skinTypes').map((item) => item.toString()),
    hasAllergies: data.get('hasAllergies') === 'true',
    allergyNotes: data.get('allergyNotes')?.toString().trim() || '',
    medicalConditions: data.get('medicalConditions')?.toString().trim() || '',
    pastTreatment: data.get('pastTreatment')?.toString().trim() || '',
  };
}

function validateStepOne(payload) {
  if (!payload.fullName || !payload.username || !payload.email || !payload.phone || !payload.dateOfBirth || !payload.password) {
    return 'Please complete all required fields before proceeding.';
  }
  if (payload.password !== payload.confirmPassword) return 'Passwords do not match.';
  if (payload.password.length < 8) return 'Password must be at least 8 characters long.';
  return '';
}

async function refreshDashboardData() {
  const [overviewResponse, appointmentsResponse, registrationsResponse] = await Promise.all([
    request('/api/admin/overview'),
    request('/api/admin/appointments'),
    request('/api/admin/registrations'),
  ]);

  const overview = overviewResponse?.data || {};
  appointmentsCache = appointmentsResponse?.data || [];
  registrationItems = registrationsResponse?.data || [];

  renderMetrics(appointmentsCache, registrationItems, overview);
  renderRecentAppointments(appointmentsCache);
  renderCapacityBoard(appointmentsCache);
  applyUserFilters();
}

function attachAddUserModal() {
  const openBtn = document.getElementById('openAddUserModalBtn');
  const closeBtn = document.getElementById('closeAddUserModalBtn');
  const backBtn = document.getElementById('backAddUserStepBtn');
  const nextBtn = document.getElementById('nextAddUserStepBtn');
  const form = document.getElementById('addUserForm');
  const modal = document.getElementById('addUserModal');

  openBtn?.addEventListener('click', () => toggleAddUserModal(true));
  closeBtn?.addEventListener('click', () => toggleAddUserModal(false));
  modal?.addEventListener('click', (event) => {
    if (event.target === modal) toggleAddUserModal(false);
  });
  backBtn?.addEventListener('click', () => {
    currentModalStep = 1;
    updateModalStep();
    setModalMessage('');
  });
  nextBtn?.addEventListener('click', () => {
    const payload = readAddUserPayload(form);
    const validationError = validateStepOne(payload);
    if (validationError) {
      setModalMessage(validationError, 'error');
      return;
    }
    currentModalStep = 2;
    updateModalStep();
    setModalMessage('');
  });

  form?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const payload = readAddUserPayload(form);
    const validationError = validateStepOne(payload);
    if (validationError) {
      currentModalStep = 1;
      updateModalStep();
      setModalMessage(validationError, 'error');
      return;
    }

    setModalMessage('Creating user...', 'info');
    const response = await request('/api/admin/users', 'POST', {
      fullName: payload.fullName,
      username: payload.username,
      email: payload.email,
      phone: payload.phone,
      dateOfBirth: payload.dateOfBirth,
      password: payload.password,
      skinTypes: payload.skinTypes,
      hasAllergies: payload.hasAllergies,
      allergyNotes: payload.allergyNotes,
      medicalConditions: payload.medicalConditions,
      pastTreatment: payload.pastTreatment,
    });

    if (!response?.success) {
      setModalMessage(response?.message || 'Unable to add user right now.', 'error');
      return;
    }

    await refreshDashboardData();
    setModalMessage('User added successfully.', 'success');
    window.setTimeout(() => toggleAddUserModal(false), 700);
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !document.getElementById('addUserModal')?.hidden) toggleAddUserModal(false);
  });
}

function attachDashboardControls() {
  document.getElementById('dashboardUserSearch')?.addEventListener('input', applyUserFilters);
  document.getElementById('dashboardUserFilter')?.addEventListener('change', applyUserFilters);
}

(async function loadPage() {
  await refreshDashboardData();
  attachDashboardControls();
  attachAddUserModal();
})();
