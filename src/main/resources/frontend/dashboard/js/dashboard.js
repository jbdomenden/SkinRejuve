if (window.mountSkinRejuveLogos) window.mountSkinRejuveLogos();

const { request, getToken, setToken } = window.skinRejuveApi;

if (!getToken()) {
  window.location.replace('/frontend/landing/html/index.html?auth=login');
}

const state = {
  history: [],
  filteredHistory: [],
  services: [],
  slots: [],
  selectedServiceId: '',
  selectedDateKey: '',
  selectedSlotId: '',
  calendarDate: new Date(),
};

const historyLoading = document.getElementById('historyLoading');
const historyEmpty = document.getElementById('historyEmpty');
const historyBody = document.getElementById('historyBody');
const historySearch = document.getElementById('historySearch');
const statusFilter = document.getElementById('statusFilter');
const dateFilter = document.getElementById('dateFilter');
const patientName = document.getElementById('patientName');

const bookingModal = document.getElementById('bookingModal');
const resultModal = document.getElementById('resultModal');
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
  if (!value) return '—';
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

function friendlyStatus(status) {
  return status.replaceAll('_', ' ').toLowerCase().replace(/(^|\s)\S/g, (m) => m.toUpperCase());
}

function statusClass(status) {
  return statusClassMap[status] || 'pending';
}

function openModal(modal) {
  modal.hidden = false;
  document.body.classList.add('auth-modal-open');
}

function closeModal(modal) {
  modal.hidden = true;
  if (bookingModal.hidden && resultModal.hidden) {
    document.body.classList.remove('auth-modal-open');
  }
}

function setResultModal(success, message, details) {
  const icon = document.getElementById('resultIcon');
  const title = document.getElementById('resultModalTitle');
  const copy = document.getElementById('resultModalCopy');

  icon.textContent = success ? '✓' : '!';
  icon.style.background = success ? '#dff2e7' : '#fde9e8';
  icon.style.color = success ? '#1f7a45' : '#9f3934';
  icon.style.borderColor = success ? '#9fceb2' : '#efbfbc';

  title.textContent = message;
  copy.textContent = details;
}

function renderHistory() {
  historyBody.innerHTML = '';

  if (!state.filteredHistory.length) {
    historyEmpty.hidden = false;
    return;
  }

  historyEmpty.hidden = true;

  state.filteredHistory.forEach((item) => {
    const row = document.createElement('tr');
    const currentStatus = item.status || 'PENDING';
    row.innerHTML = `
      <td data-label="Service">${item.serviceName || 'Service not specified'}</td>
      <td data-label="Date">${formatDate(item.startAt)}</td>
      <td data-label="Status"><span class="status-pill status-pill--${statusClass(currentStatus)}">${friendlyStatus(currentStatus)}</span></td>
      <td data-label="Email">${item.email || 'On file'}</td>
      <td data-label="Action"><button type="button" class="table-action" data-id="${item.id || ''}">View</button></td>
    `;
    historyBody.appendChild(row);
  });
}

function applyHistoryFilters() {
  const searchValue = historySearch.value.trim().toLowerCase();
  const statusValue = statusFilter.value;
  const dateWindow = Number(dateFilter.value);
  const now = Date.now();

  state.filteredHistory = state.history.filter((item) => {
    const statusMatch = statusValue === 'all' || (item.status || '').toUpperCase() === statusValue;

    const searchMatch = !searchValue
      || (item.serviceName || '').toLowerCase().includes(searchValue)
      || (item.status || '').toLowerCase().includes(searchValue)
      || (item.email || '').toLowerCase().includes(searchValue);

    const dateMatch = Number.isNaN(dateWindow) || dateFilter.value === 'all'
      ? true
      : (now - new Date(item.startAt).getTime()) <= (dateWindow * 24 * 60 * 60 * 1000);

    return statusMatch && searchMatch && dateMatch;
  });

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
    patientName.textContent = `${response.data.firstName || ''} ${response.data.lastName || ''}`.trim() || 'Patient';
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

function setupEventListeners() {
  document.getElementById('logoutBtn').addEventListener('click', () => {
    setToken('');
    window.location.replace('/frontend/landing/html/index.html?auth=login');
  });

  document.getElementById('openBookingBtn').addEventListener('click', () => openModal(bookingModal));
  document.getElementById('openBookingFromNav').addEventListener('click', () => openModal(bookingModal));
  document.getElementById('closeBookingModal').addEventListener('click', () => closeModal(bookingModal));
  document.getElementById('cancelBookingBtn').addEventListener('click', () => closeModal(bookingModal));
  document.querySelector('[data-close-booking="true"]').addEventListener('click', () => closeModal(bookingModal));

  document.querySelector('[data-close-result="true"]').addEventListener('click', () => closeModal(resultModal));
  document.getElementById('resultModalCta').addEventListener('click', () => closeModal(resultModal));

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

  document.getElementById('bookingForm').addEventListener('submit', submitBooking);

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (!bookingModal.hidden) closeModal(bookingModal);
      if (!resultModal.hidden) closeModal(resultModal);
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
