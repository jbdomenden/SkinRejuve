const { request } = window.adminShell;

const searchInput = document.getElementById('dashboardSearchInput');
const filterButton = document.getElementById('dashboardFilterBtn');
const addUserButton = document.getElementById('dashboardAddUserBtn');
let dashboardRows = [];
let appointmentsSnapshot = [];
let activeFilter = 'ALL';

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
  root.innerHTML = metrics.map((metric) => `
    <article class="metric-card dashboard-reference-metric ${metric.tone || ''}">
      <div class="metric-label">${metric.label}</div>
      <div class="metric-value">${metric.value}</div>
      <div class="metric-footnote">${metric.note}</div>
    </article>
  `).join('');
}

function buildRows(appointments) {
  if (!appointments.length) {
    return [
      { name: 'Account Registration', email: 'sample@gmail.com', date: '02/02/2004', status: 'Pending' },
      { name: 'Appointed Services', email: 'sample@gmail.com', date: '02/02/2004', status: 'Pending' },
      { name: 'Markku Punzalanmark', email: 'sample@gmail.com', date: '02/02/2004', status: 'Pending' },
      { name: 'Joselito Andrea', email: 'sample@gmail.com', date: '02/02/2004', status: 'Pending' },
      { name: 'Mark John', email: 'sample@gmail.com', date: '02/02/2004', status: 'Pending' },
    ];
  }

  return appointments.slice(0, 8).map((item) => ({
    name: item.patientName || item.customerName || item.serviceName || 'Guest User',
    email: item.email || item.patientEmail || item.customerEmail || 'sample@gmail.com',
    date: item.createdAt || item.startAt ? new Date(item.createdAt || item.startAt).toLocaleDateString('en-US') : '02/02/2004',
    status: (item.status || 'Pending').replace(/_/g, ' '),
  }));
}

function filteredRows() {
  const query = (searchInput.value || '').trim().toLowerCase();
  return dashboardRows.filter((row) => {
    const matchesQuery = !query || [row.name, row.email, row.status].join(' ').toLowerCase().includes(query);
    const matchesFilter = activeFilter === 'ALL' || row.status.toUpperCase() === activeFilter;
    return matchesQuery && matchesFilter;
  });
}

function renderTable() {
  const rows = filteredRows();
  const root = document.getElementById('dashboardUserTable');

  if (!rows.length) {
    root.innerHTML = '<div class="empty-state">No user records match this filter.</div>';
    return;
  }

  root.innerHTML = `
    <div class="table-wrap dashboard-table-wrap">
      <table class="data-table dashboard-reference-table">
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
          ${rows.map((row, index) => `
            <tr>
              <td>${row.name}</td>
              <td>${row.email}</td>
              <td>${row.date}</td>
              <td><span class="dashboard-status-text">${row.status}</span></td>
              <td><button class="dashboard-view-btn" type="button" data-row-index="${index}">View</button></td>
            </tr>
          `).join('')}
        </tbody>
      </table>
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

(async function loadPage() {
  bindToolbar();

  const [overviewResponse, appointmentsResponse] = await Promise.all([
    request('/api/analytics/overview'),
    request('/api/admin/appointments'),
  ]);

  const data = overviewResponse?.data || {};
  appointmentsSnapshot = appointmentsResponse?.data || [];
  dashboardRows = buildRows(appointmentsSnapshot);

  const deniedCount = appointmentsSnapshot.filter((item) => (item.status || '').toUpperCase() === 'DENIED').length;
  const completedCount = appointmentsSnapshot.filter((item) => (item.status || '').toUpperCase() === 'COMPLETED').length;

  renderMetrics([
    { label: 'Users', value: data.totalPatients || dashboardRows.length || 0 },
    { label: 'Appointments', value: data.totalAppointments || appointmentsSnapshot.length || 0 },
    { label: 'Denied Appt.', value: deniedCount || 1 },
    { label: 'Completed', value: completedCount || 1 },
  ]);

  renderTable();
})();
