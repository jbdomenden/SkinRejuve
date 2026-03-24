if (window.mountSkinRejuveLogos) window.mountSkinRejuveLogos();

const { request, getToken } = window.skinRejuveApi;

if (!getToken()) {
  window.location.replace('/frontend/landing/html/index.html?auth=login');
}

const isHistoryPage = Boolean(document.getElementById('historyBody'));
if (!isHistoryPage) {
  // This script is shared by legacy dashboard routes. Exit safely for non-history pages.
} else {

const state = {
  profile: null,
  history: [],
  filteredHistory: [],
  services: [],
  slots: [],
  selectedServiceId: '',
  selectedDateKey: '',
  selectedSlotId: '',
  calendarDate: new Date(),
  selectedSlipId: '',
  lastSlipTrigger: null,
};

const historyLoading = document.getElementById('historyLoading');
const historyEmpty = document.getElementById('historyEmpty');
const historyBody = document.getElementById('historyBody');
const historySearch = document.getElementById('historySearch');
const statusFilter = document.getElementById('statusFilter');
const dateFilter = document.getElementById('dateFilter');
const branchFilter = document.getElementById('branchFilter');
const serviceFilter = document.getElementById('serviceFilter');
const sortFilter = document.getElementById('sortFilter');
const patientName = document.getElementById('patientName');

const bookingModal = document.getElementById('bookingModal');
const resultModal = document.getElementById('resultModal');
const slipModal = document.getElementById('slipModal');
const slipDocument = document.getElementById('slipDocument');
const slipReference = document.getElementById('slipReference');
const slipError = document.getElementById('slipError');

const serviceSelect = document.getElementById('serviceId');
const submitBookingBtn = document.getElementById('submitBookingBtn');
const bookingFormError = document.getElementById('bookingFormError');
const dateError = document.getElementById('dateError');
const slotError = document.getElementById('slotError');
const slotGrid = document.getElementById('slotGrid');
const slotEmpty = document.getElementById('slotEmpty');
const calendarDays = document.getElementById('calendarDays');
const calendarLabel = document.getElementById('calendarLabel');
const serviceDescription = document.getElementById('serviceDescription');

const statusClassMap = {
  COMPLETED: 'completed',
  PENDING: 'pending',
  CONFIRMED: 'confirmed',
  DENIED: 'denied',
  CANCELLED: 'cancelled',
  IN_PROGRESS: 'in_progress',
};

const serviceDescriptions = {
  default: 'A clinic treatment option selected based on your care goals. Final treatment suitability is confirmed by clinic assessment.',
  laser: 'A laser treatment option commonly used for selected pigmentation and skin renewal concerns. Final treatment suitability is confirmed by clinic assessment.',
  facial: 'A clinic facial service that focuses on skin cleansing and renewal based on your assessment and skin condition.',
};

function formatDate(value) {
  if (!value) return '';
  return new Date(value).toLocaleString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

function formatDateOnly(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

function formatDateLabel(value) {
  if (!value) return '';
  return new Date(value).toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

function friendlyStatus(status) {
  return (status || 'PENDING').replaceAll('_', ' ').toLowerCase().replace(/(^|\s)\S/g, (m) => m.toUpperCase());
}

function statusClass(status) {
  return statusClassMap[status] || 'pending';
}

function resolvedBranch(item) {
  return item.branchName || item.branch || 'Olongapo Branch';
}

function openModal(modal) {
  modal.hidden = false;
  document.body.classList.add('auth-modal-open');
}

function closeModal(modal) {
  modal.hidden = true;

  if (modal === slipModal && state.lastSlipTrigger) {
    state.lastSlipTrigger.setAttribute('aria-expanded', 'false');
    state.lastSlipTrigger.focus();
    state.lastSlipTrigger = null;
  }

  if (bookingModal.hidden && resultModal.hidden && slipModal.hidden) {
    document.body.classList.remove('auth-modal-open');
  }
}

function setResultModal(success, message, details) {
  const icon = document.getElementById('resultIcon');
  const title = document.getElementById('resultModalTitle');
  const copy = document.getElementById('resultModalCopy');

  icon.textContent = success ? '✓' : '!';
  icon.classList.toggle('result-icon--success', success);
  icon.classList.toggle('result-icon--error', !success);

  title.textContent = message;
  copy.textContent = details;
}

function populateHistoryFilters() {
  const branchOptions = [...new Set(state.history.map((item) => resolvedBranch(item)).filter(Boolean))].sort();
  const serviceOptions = [...new Set(state.history.map((item) => item.serviceName).filter(Boolean))].sort();

  branchFilter.innerHTML = '<option value="all">All branches</option>';
  serviceFilter.innerHTML = '<option value="all">All services</option>';

  branchOptions.forEach((branch) => {
    const option = document.createElement('option');
    option.value = branch;
    option.textContent = branch;
    branchFilter.appendChild(option);
  });

  serviceOptions.forEach((service) => {
    const option = document.createElement('option');
    option.value = service;
    option.textContent = service;
    serviceFilter.appendChild(option);
  });
}

function buildSlipKV(entries) {
  const rows = entries
    .filter((entry) => entry?.value !== undefined && entry?.value !== null && String(entry.value).trim() !== '')
    .map((entry) => `<dt>${entry.label}</dt><dd>${entry.value}</dd>`)
    .join('');

  if (!rows) return '<p class="slip-empty">No information available for this section.</p>';
  return `<dl class="slip-kv">${rows}</dl>`;
}

function renderSlip(item) {
  if (!item) {
    slipDocument.innerHTML = '';
    slipError.hidden = false;
    slipError.textContent = 'Appointment slip could not be found for this record.';
    return;
  }

  slipError.hidden = true;
  slipReference.textContent = `Reference: ${item.id || 'N/A'}`;

  const profile = state.profile || {};
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || 'Patient';

  const patientSection = buildSlipKV([
    { label: 'Full name', value: fullName },
    { label: 'Sex', value: profile.sex || profile.gender },
    { label: 'Phone number', value: profile.phone || profile.mobile },
    { label: 'Email address', value: profile.email || '' },
    { label: 'Date of birth', value: profile.dateOfBirth ? formatDateLabel(profile.dateOfBirth) : '' },
    { label: 'Address', value: profile.address },
  ]);

  const appointmentSection = buildSlipKV([
    { label: 'Date and time', value: formatDate(item.startAt) },
    { label: 'Branch', value: resolvedBranch(item) },
    { label: 'Assigned specialist', value: item.staffName || 'Assigned by clinic' },
    { label: 'Service', value: item.serviceName },
    { label: 'Service details', value: item.serviceDescription || '' },
    { label: 'Treatment specifics', value: item.treatmentSpecifics || '' },
    { label: 'Session details', value: item.sessionDetails || '' },
    { label: 'Status', value: friendlyStatus(item.status) },
  ]);

  const healthSection = buildSlipKV([
    { label: 'Known allergies', value: profile.allergies || profile.allergyNotes },
    { label: 'Medical conditions', value: profile.medicalConditions },
    { label: 'Previous treatments', value: profile.pastTreatment },
  ]);

  const clinicActionsSection = buildSlipKV([
    { label: 'Doctor notes', value: item.doctorNotes || item.notes },
    { label: 'Post-treatment care', value: item.afterCareInstructions },
  ]);

  slipDocument.innerHTML = `
    <section class="slip-grid" aria-label="Appointment slip details">
      <article class="slip-section">
        <h3>Patient information</h3>
        ${patientSection}
      </article>
      <article class="slip-section">
        <h3>Appointment information</h3>
        ${appointmentSection}
      </article>
      <article class="slip-section">
        <h3>Health information</h3>
        ${healthSection}
      </article>
      <article class="slip-section">
        <h3>Clinic actions</h3>
        ${clinicActionsSection}
      </article>
    </section>
  `;
}

function openSlip(id, trigger) {
  state.selectedSlipId = id;
  state.lastSlipTrigger = trigger || null;

  historyBody.querySelectorAll('tr').forEach((row) => {
    row.classList.toggle('history-row-selected', row.dataset.id === id);
  });

  historyBody.querySelectorAll('[data-action="view-slip"]').forEach((button) => {
    button.setAttribute('aria-expanded', 'false');
  });
  if (trigger) {
    trigger.setAttribute('aria-expanded', 'true');
  }

  const selected = state.history.find((item) => String(item.id) === String(id));
  renderSlip(selected);
  openModal(slipModal);

  const firstFocusable = slipModal.querySelector('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])');
  if (firstFocusable) firstFocusable.focus();
}

function renderHistory() {
  historyBody.innerHTML = '';

  if (!state.filteredHistory.length) {
    historyEmpty.hidden = false;
    historyEmpty.innerHTML = '<p>No appointment history yet.</p><p>Your booked and completed treatments will appear here once available.</p>';
    return;
  }

  historyEmpty.hidden = true;

  state.filteredHistory.forEach((item) => {
    const row = document.createElement('tr');
    const currentStatus = item.status || 'PENDING';
    row.dataset.id = item.id || '';
    row.innerHTML = `
      <td data-label="Date">${formatDate(item.startAt)}</td>
      <td data-label="Service">${item.serviceName || 'Clinic service'}</td>
      <td data-label="Branch">${resolvedBranch(item)}</td>
      <td data-label="Status"><span class="status-pill status-pill--${statusClass(currentStatus)}">${friendlyStatus(currentStatus)}</span></td>
      <td data-label="Action">
        <button type="button" class="table-action" data-action="view-slip" data-id="${item.id || ''}" aria-expanded="false" aria-controls="slipModal">
          View Slip
        </button>
      </td>
    `;

    historyBody.appendChild(row);
  });
}

function applyHistoryFilters() {
  const searchValue = historySearch.value.trim().toLowerCase();
  const statusValue = statusFilter.value;
  const dateWindow = Number(dateFilter.value);
  const branchValue = branchFilter.value;
  const serviceValue = serviceFilter.value;
  const sortValue = sortFilter.value;
  const now = Date.now();

  let rows = state.history.filter((item) => {
    const statusMatch = statusValue === 'all' || (item.status || '').toUpperCase() === statusValue;
    const branchMatch = branchValue === 'all' || resolvedBranch(item) === branchValue;
    const serviceMatch = serviceValue === 'all' || item.serviceName === serviceValue;

    const searchMatch = !searchValue
      || (item.serviceName || '').toLowerCase().includes(searchValue)
      || (item.status || '').toLowerCase().includes(searchValue)
      || resolvedBranch(item).toLowerCase().includes(searchValue)
      || String(item.id || '').toLowerCase().includes(searchValue);

    const dateMatch = Number.isNaN(dateWindow) || dateFilter.value === 'all'
      ? true
      : (now - new Date(item.startAt).getTime()) <= (dateWindow * 24 * 60 * 60 * 1000);

    return statusMatch && searchMatch && dateMatch && branchMatch && serviceMatch;
  });

  rows = rows.sort((a, b) => {
    const dateA = new Date(a.startAt).getTime();
    const dateB = new Date(b.startAt).getTime();
    if (sortValue === 'date_asc') return dateA - dateB;
    if (sortValue === 'service_asc') return (a.serviceName || '').localeCompare(b.serviceName || '');
    if (sortValue === 'status_asc') return (a.status || '').localeCompare(b.status || '');
    return dateB - dateA;
  });

  state.filteredHistory = rows;
  renderHistory();
}

function groupedSlotsByDate() {
  return state.slots.reduce((acc, slot) => {
    const key = formatDateOnly(slot.startAt);
    if (!acc[key]) acc[key] = [];
    acc[key].push(slot);
    return acc;
  }, {});
}

function getAvailableDateSet() {
  return new Set(Object.keys(groupedSlotsByDate()));
}

function renderCalendar() {
  const date = state.calendarDate;
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const availableDates = getAvailableDateSet();
  const todayKey = formatDateOnly(new Date());

  calendarLabel.textContent = firstDay.toLocaleString('en-US', { month: 'long', year: 'numeric' });
  calendarDays.innerHTML = '';

  for (let i = 0; i < startDay; i += 1) {
    const pad = document.createElement('span');
    pad.className = 'calendar__day is-outside';
    pad.setAttribute('aria-hidden', 'true');
    calendarDays.appendChild(pad);
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    const dayDate = new Date(year, month, day);
    const dayKey = formatDateOnly(dayDate);
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'calendar__day';
    button.textContent = String(day);
    button.dataset.date = dayKey;

    const isPast = dayDate < new Date(new Date().setHours(0, 0, 0, 0));
    const hasSlots = availableDates.has(dayKey);

    if (dayKey === todayKey) button.classList.add('is-today');
    if (state.selectedDateKey === dayKey) button.classList.add('is-selected');

    if (isPast || !hasSlots) {
      button.disabled = true;
      button.classList.add('is-disabled');
    }

    button.addEventListener('click', () => {
      state.selectedDateKey = dayKey;
      state.selectedSlotId = '';
      dateError.textContent = '';
      renderCalendar();
      renderSlots();
      updateBookingActionState();
    });

    calendarDays.appendChild(button);
  }
}

function renderSlots() {
  const slotsForDate = groupedSlotsByDate()[state.selectedDateKey] || [];
  slotGrid.innerHTML = '';

  if (!slotsForDate.length) {
    slotEmpty.hidden = false;
    return;
  }

  slotEmpty.hidden = true;

  slotsForDate.forEach((slot) => {
    const slotBtn = document.createElement('button');
    slotBtn.type = 'button';
    slotBtn.className = 'slot-button';
    slotBtn.dataset.slotId = slot.id;
    slotBtn.setAttribute('role', 'radio');
    slotBtn.setAttribute('aria-checked', String(state.selectedSlotId === String(slot.id)));

    const time = new Date(slot.startAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    slotBtn.textContent = `${time}`;

    if (state.selectedSlotId === String(slot.id)) {
      slotBtn.classList.add('is-selected');
    }

    slotBtn.addEventListener('click', () => {
      state.selectedSlotId = String(slot.id);
      slotError.textContent = '';
      renderSlots();
      updateBookingActionState();
    });

    slotGrid.appendChild(slotBtn);
  });
}

function updateServiceDescription() {
  const selectedText = serviceSelect.options[serviceSelect.selectedIndex]?.textContent?.toLowerCase() || '';
  const match = selectedText.includes('laser') ? 'laser' : selectedText.includes('facial') ? 'facial' : 'default';
  serviceDescription.textContent = serviceDescriptions[match];
}

function updateBookingActionState() {
  const isReady = Boolean(document.getElementById('branchSelect').value)
    && Boolean(serviceSelect.value)
    && Boolean(state.selectedDateKey)
    && Boolean(state.selectedSlotId);

  submitBookingBtn.disabled = !isReady;
}

async function loadProfile() {
  const response = await request('/api/patient/profile');
  if (response?.success && response.data) {
    state.profile = response.data;
    const fullName = `${response.data.firstName || ''} ${response.data.lastName || ''}`.trim();
    patientName.textContent = fullName || 'Patient';
  } else {
    state.profile = null;
  }
}

async function loadHistory() {
  historyLoading.hidden = false;
  const response = await request('/api/appointments/history');
  historyLoading.hidden = true;

  if (!response?.success) {
    historyEmpty.hidden = false;
    historyEmpty.innerHTML = `<p>${response?.message || 'Unable to load appointment history right now.'}</p>`;
    return;
  }

  state.history = response.data || [];
  populateHistoryFilters();
  applyHistoryFilters();
}

async function loadBookingData() {
  const [servicesResponse, slotsResponse] = await Promise.all([
    request('/api/services'),
    request('/api/appointments/slots'),
  ]);

  state.services = servicesResponse?.data || [];
  state.slots = slotsResponse?.data || [];

  serviceSelect.innerHTML = '<option value="">Select service</option>';
  state.services.forEach((service) => {
    const option = document.createElement('option');
    option.value = service.id;
    option.textContent = service.name;
    serviceSelect.appendChild(option);
  });

  state.selectedServiceId = '';
  state.selectedDateKey = '';
  state.selectedSlotId = '';

  renderCalendar();
  renderSlots();
  updateServiceDescription();
  updateBookingActionState();
}

function validateBookingForm() {
  let valid = true;
  bookingFormError.textContent = '';
  dateError.textContent = '';
  slotError.textContent = '';

  if (!document.getElementById('branchSelect').value) {
    valid = false;
    bookingFormError.textContent = 'Please select a clinic branch.';
  }

  if (!serviceSelect.value) {
    valid = false;
    bookingFormError.textContent = 'Please select a service.';
  }

  if (!state.selectedDateKey) {
    valid = false;
    dateError.textContent = 'Please choose a preferred date.';
  }

  if (!state.selectedSlotId) {
    valid = false;
    slotError.textContent = 'Please choose an available time slot.';
  }

  return valid;
}

async function submitBooking(event) {
  event.preventDefault();
  if (!validateBookingForm()) return;

  submitBookingBtn.textContent = 'Submitting...';
  submitBookingBtn.disabled = true;

  const response = await request('/api/appointments', 'POST', {
    serviceId: serviceSelect.value,
    slotId: state.selectedSlotId,
  });

  submitBookingBtn.textContent = 'Submit Appointment Request';
  updateBookingActionState();

  if (response?.success) {
    closeModal(bookingModal);
    setResultModal(
      true,
      'Your appointment request has been submitted.',
      'We will notify you once your appointment has been reviewed.',
    );
    openModal(resultModal);
    await Promise.all([loadBookingData(), loadHistory()]);
    return;
  }

  setResultModal(
    false,
    'Your appointment request could not be submitted.',
    response?.message || 'Please try again in a few minutes or contact the clinic for assistance.',
  );
  openModal(resultModal);
}

function handleHistoryTableClick(event) {
  const trigger = event.target.closest('[data-action="view-slip"]');
  if (!trigger) return;

  const id = trigger.dataset.id;
  if (!id) return;

  openSlip(id, trigger);
}

function printHistoryTable() {
  window.print();
}

function printSlip() {
  const bodyMarkup = slipDocument.innerHTML;
  const referenceText = slipReference.textContent;
  if (!bodyMarkup.trim()) return;

  const popup = window.open('', '_blank', 'width=900,height=700');
  if (!popup) return;

  popup.document.write(`
    <html>
      <head>
        <title>Skin Rejuve Appointment Slip</title>
        <style>
          body { font-family: Inter, Arial, sans-serif; padding: 24px; color: #3f2a12; }
          h1 { margin: 0 0 8px; }
          .meta { margin-bottom: 18px; color: #715335; }
          .slip-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 16px; }
          .slip-section { border: 1px solid #dfcab0; border-radius: 12px; padding: 12px; }
          .slip-kv { display: grid; grid-template-columns: 150px 1fr; gap: 6px 10px; margin: 0; }
          .slip-kv dt { font-weight: 700; color: #6f5232; }
          .slip-kv dd { margin: 0; }
        </style>
      </head>
      <body>
        <h1>Appointment Slip</h1>
        <p class="meta">${referenceText}</p>
        ${bodyMarkup}
      </body>
    </html>
  `);
  popup.document.close();
  popup.focus();
  popup.print();
}


function trapModalFocus(event, modal) {
  if (event.key !== 'Tab' || modal.hidden) return;

  const focusable = modal.querySelectorAll('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
  if (!focusable.length) return;

  const first = focusable[0];
  const last = focusable[focusable.length - 1];

  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

function setupEventListeners() {
  document.getElementById('openBookingBtn').addEventListener('click', () => openModal(bookingModal));
  document.getElementById('openBookingFromNav').addEventListener('click', () => openModal(bookingModal));

  document.getElementById('closeBookingModal').addEventListener('click', () => closeModal(bookingModal));
  document.getElementById('cancelBookingBtn').addEventListener('click', () => closeModal(bookingModal));
  document.querySelector('[data-close-booking="true"]').addEventListener('click', () => closeModal(bookingModal));

  document.querySelector('[data-close-result="true"]').addEventListener('click', () => closeModal(resultModal));
  document.getElementById('resultModalCta').addEventListener('click', () => closeModal(resultModal));

  document.getElementById('closeSlipModal').addEventListener('click', () => closeModal(slipModal));
  document.getElementById('closeSlipFooterBtn').addEventListener('click', () => closeModal(slipModal));
  document.querySelector('[data-close-slip="true"]').addEventListener('click', () => closeModal(slipModal));

  document.getElementById('printHistoryBtn').addEventListener('click', printHistoryTable);
  document.getElementById('printSlipBtn').addEventListener('click', printSlip);
  document.getElementById('downloadSlipBtn').addEventListener('click', printSlip);

  document.getElementById('prevMonth').addEventListener('click', () => {
    state.calendarDate = new Date(state.calendarDate.getFullYear(), state.calendarDate.getMonth() - 1, 1);
    renderCalendar();
  });

  document.getElementById('nextMonth').addEventListener('click', () => {
    state.calendarDate = new Date(state.calendarDate.getFullYear(), state.calendarDate.getMonth() + 1, 1);
    renderCalendar();
  });

  serviceSelect.addEventListener('change', () => {
    state.selectedServiceId = serviceSelect.value;
    updateServiceDescription();
    updateBookingActionState();
  });

  historySearch.addEventListener('input', applyHistoryFilters);
  statusFilter.addEventListener('change', applyHistoryFilters);
  dateFilter.addEventListener('change', applyHistoryFilters);
  branchFilter.addEventListener('change', applyHistoryFilters);
  serviceFilter.addEventListener('change', applyHistoryFilters);
  sortFilter.addEventListener('change', applyHistoryFilters);

  historyBody.addEventListener('click', handleHistoryTableClick);

  document.getElementById('bookingForm').addEventListener('submit', submitBooking);

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (!bookingModal.hidden) closeModal(bookingModal);
      if (!resultModal.hidden) closeModal(resultModal);
      if (!slipModal.hidden) closeModal(slipModal);
    }

    if (!slipModal.hidden) {
      trapModalFocus(event, slipModal);
    }
  });
}

async function init() {
  setupEventListeners();
  await Promise.all([loadProfile(), loadHistory(), loadBookingData()]);

  const bookingIntent = new URLSearchParams(window.location.search).get('booking');
  if (bookingIntent === '1') {
    openModal(bookingModal);
  }
}

init();

}
