if (window.mountSkinRejuveLogos) window.mountSkinRejuveLogos();

const { request, getToken } = window.skinRejuveApi;
if (!getToken()) {
  window.location.replace('/frontend/landing/html/index.html?auth=login');
}

const state = {
  services: [],
  slots: [],
  selectedServiceId: '',
  selectedDateKey: '',
  selectedSlotId: '',
  calendarDate: new Date(),
  lastFocusedServiceCard: null,
};

const FALLBACK_SERVICES = [
  { name: 'Doctors Procedures', startingPrice: 1500, description: 'Doctor-led treatment procedures tailored after consultation.' },
  { name: 'Embrace Morpheus', startingPrice: 6500, description: 'Targeted skin rejuvenation for texture and firmness concerns.' },
  { name: 'Face and Body Contouring', startingPrice: 4500, description: 'Contour-focused care designed for face and body areas.' },
  { name: 'Facial Services', startingPrice: 1200, description: 'Professional facial treatments selected for your skin condition.' },
  { name: 'Gluta Drip', startingPrice: 2200, description: 'Clinic-supervised drip session based on treatment protocol.' },
  { name: 'Harmony XL Pro', startingPrice: 5800, description: 'Multi-application laser platform for selected skin concerns.' },
  { name: 'PicoLuxe 785', startingPrice: 5200, description: 'Pico-laser treatment for selected pigmentation concerns.' },
];

const servicesState = document.getElementById('servicesState');
const servicesGrid = document.getElementById('servicesGrid');
const bookingModal = document.getElementById('bookingModal');
const resultModal = document.getElementById('resultModal');
const bookingForm = document.getElementById('bookingForm');
const serviceSelect = document.getElementById('serviceId');
const slotGrid = document.getElementById('slotGrid');
const slotEmpty = document.getElementById('slotEmpty');
const submitBookingBtn = document.getElementById('submitBookingBtn');
const bookingFormError = document.getElementById('bookingFormError');
const dateError = document.getElementById('dateError');
const slotError = document.getElementById('slotError');
const branchError = document.getElementById('branchError');
const calendarLabel = document.getElementById('calendarLabel');
const calendarDays = document.getElementById('calendarDays');
const serviceDescription = document.getElementById('serviceDescription');

function formatDateOnly(value) {
  const date = new Date(value);
  date.setHours(0, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

function groupedSlotsByDate() {
  return state.slots.reduce((acc, slot) => {
    const key = formatDateOnly(slot.startAt);
    if (!acc[key]) acc[key] = [];
    acc[key].push(slot);
    return acc;
  }, {});
}

function getServiceById(serviceId) {
  return state.services.find((service) => String(service.id) === String(serviceId));
}

function renderServiceCards() {
  servicesGrid.innerHTML = '';

  state.services.forEach((service) => {
    const card = document.createElement('button');
    card.type = 'button';
    card.className = 'service-card';
    card.dataset.serviceId = service.id;
    card.setAttribute('role', 'option');

    const isSelected = String(service.id) === String(state.selectedServiceId);
    card.setAttribute('aria-selected', String(isSelected));
    if (isSelected) card.classList.add('is-selected');

    card.innerHTML = `
      <span class="service-card__name">${service.name}</span>
      <span class="service-card__description">${service.description || 'Clinic service tailored to your treatment assessment.'}</span>
      <span class="service-card__price">Starts at ₱${Number(service.startingPrice || 0).toLocaleString()}</span>
    `;

    card.addEventListener('click', () => handleServiceSelection(service.id, card, true));
    servicesGrid.appendChild(card);
  });
}

function populateServiceSelect() {
  serviceSelect.innerHTML = '';
  state.services.forEach((service) => {
    const option = document.createElement('option');
    option.value = service.id;
    option.textContent = service.name;
    serviceSelect.appendChild(option);
  });

  if (state.selectedServiceId) {
    serviceSelect.value = String(state.selectedServiceId);
  }
  updateServiceDescription();
}

function updateServiceDescription() {
  const selectedService = getServiceById(serviceSelect.value);
  serviceDescription.textContent = selectedService?.description
    || 'Your selected service will be reviewed by our clinic team before final confirmation.';
}

function handleServiceSelection(serviceId, card, openBooking) {
  state.selectedServiceId = String(serviceId);
  state.lastFocusedServiceCard = card;

  renderServiceCards();
  populateServiceSelect();
  serviceSelect.value = state.selectedServiceId;
  updateServiceDescription();
  updateBookingActionState();

  if (openBooking) {
    openModal(bookingModal);
  }
}

function openModal(modal) {
  modal.hidden = false;
  document.body.classList.add('auth-modal-open');
  const firstFocusable = modal.querySelector('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
  if (firstFocusable) firstFocusable.focus();
}

function closeModal(modal) {
  modal.hidden = true;
  if (bookingModal.hidden && resultModal.hidden) {
    document.body.classList.remove('auth-modal-open');
  }

  if (modal === bookingModal && state.lastFocusedServiceCard) {
    state.lastFocusedServiceCard.focus();
  }
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

function renderCalendar() {
  const date = state.calendarDate;
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstDay = new Date(year, month, 1);
  const startDay = firstDay.getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const availableDates = new Set(Object.keys(groupedSlotsByDate()));
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

    const isPast = dayDate < new Date(new Date().setHours(0, 0, 0, 0));
    const hasSlots = availableDates.has(dayKey);
    if (dayKey === todayKey) button.classList.add('is-today');
    if (dayKey === state.selectedDateKey) button.classList.add('is-selected');

    if (isPast || !hasSlots) {
      button.disabled = true;
      button.classList.add('is-disabled');
    }

    button.addEventListener('click', () => {
      state.selectedDateKey = dayKey;
      state.selectedSlotId = '';
      dateError.textContent = '';
      slotError.textContent = '';
      renderCalendar();
      renderSlots();
      updateBookingActionState();
    });

    calendarDays.appendChild(button);
  }
}

function renderSlots() {
  slotGrid.innerHTML = '';
  const slotsForDate = groupedSlotsByDate()[state.selectedDateKey] || [];

  if (!slotsForDate.length) {
    slotEmpty.hidden = false;
    return;
  }
  slotEmpty.hidden = true;

  slotsForDate.forEach((slot) => {
    const slotButton = document.createElement('button');
    slotButton.type = 'button';
    slotButton.className = 'slot-button';
    slotButton.setAttribute('role', 'radio');
    slotButton.setAttribute('aria-checked', String(state.selectedSlotId === String(slot.id)));

    const time = new Date(slot.startAt).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
    slotButton.textContent = time;

    if (state.selectedSlotId === String(slot.id)) {
      slotButton.classList.add('is-selected');
    }

    slotButton.addEventListener('click', () => {
      state.selectedSlotId = String(slot.id);
      slotError.textContent = '';
      renderSlots();
      updateBookingActionState();
    });

    slotGrid.appendChild(slotButton);
  });
}

function updateBookingActionState() {
  const ready = Boolean(document.getElementById('branchSelect').value)
    && Boolean(serviceSelect.value)
    && Boolean(state.selectedDateKey)
    && Boolean(state.selectedSlotId);
  submitBookingBtn.disabled = !ready;
}

function validateBookingForm() {
  let valid = true;
  bookingFormError.textContent = '';
  dateError.textContent = '';
  slotError.textContent = '';
  branchError.textContent = '';

  if (!document.getElementById('branchSelect').value) {
    valid = false;
    branchError.textContent = 'Please select a clinic branch.';
  }

  if (!serviceSelect.value) {
    valid = false;
    bookingFormError.textContent = 'Please select a treatment service.';
  }

  if (!state.selectedDateKey) {
    valid = false;
    dateError.textContent = 'Please select your preferred date.';
  }

  if (!state.selectedSlotId) {
    valid = false;
    slotError.textContent = 'Please select an available time slot.';
  }

  return valid;
}

async function submitBooking(event) {
  event.preventDefault();
  if (!validateBookingForm()) return;

  submitBookingBtn.textContent = 'Confirming appointment...';
  submitBookingBtn.disabled = true;

  const response = await request('/api/appointments', 'POST', {
    serviceId: serviceSelect.value,
    slotId: state.selectedSlotId,
  });

  submitBookingBtn.textContent = 'Confirm Appointment';
  updateBookingActionState();

  if (response?.success) {
    closeModal(bookingModal);
    openModal(resultModal);
    return;
  }

  bookingFormError.textContent = response?.message || 'Unable to submit your request right now. Please try again.';
}

function setServices(rawServices) {
  const fromApi = (rawServices || []).map((service) => ({
    id: service.id,
    name: service.name,
    description: service.description,
    startingPrice: service.startingPrice || service.price || 0,
  }));

  if (fromApi.length) {
    state.services = fromApi;
    return;
  }

  state.services = FALLBACK_SERVICES.map((service, index) => ({
    id: `fallback-${index + 1}`,
    ...service,
  }));
}

async function loadPageData() {
  servicesState.textContent = 'Loading services…';

  const [servicesResponse, slotsResponse] = await Promise.all([
    request('/api/services'),
    request('/api/appointments/slots'),
  ]);

  setServices(servicesResponse?.data || []);
  state.slots = slotsResponse?.data || [];

  if (!state.services.length) {
    servicesState.textContent = 'No services are available right now. Please try again shortly.';
    return;
  }

  servicesState.hidden = true;
  servicesGrid.hidden = false;

  if (!state.selectedServiceId) {
    state.selectedServiceId = String(state.services[0].id);
  }

  renderServiceCards();
  populateServiceSelect();
  renderCalendar();
  renderSlots();
  updateBookingActionState();
}

function setupEventListeners() {
  document.getElementById('closeBookingModal').addEventListener('click', () => closeModal(bookingModal));
  document.getElementById('cancelBookingBtn').addEventListener('click', () => closeModal(bookingModal));
  document.querySelector('[data-close-booking="true"]').addEventListener('click', () => closeModal(bookingModal));

  document.querySelector('[data-close-result="true"]').addEventListener('click', () => closeModal(resultModal));
  document.getElementById('resultModalCta').addEventListener('click', () => {
    closeModal(resultModal);
    window.location.assign('/frontend/dashboard/html/dashboard.html');
  });

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
    renderServiceCards();
    updateServiceDescription();
    updateBookingActionState();
  });

  bookingForm.addEventListener('submit', submitBooking);

  window.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') {
      if (!bookingModal.hidden) closeModal(bookingModal);
      else if (!resultModal.hidden) closeModal(resultModal);
    }

    if (!bookingModal.hidden) trapModalFocus(event, bookingModal);
    if (!resultModal.hidden) trapModalFocus(event, resultModal);
  });
}

async function init() {
  setupEventListeners();
  await loadPageData();
}

init();
