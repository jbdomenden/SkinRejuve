if (window.mountSkinRejuveLogos) window.mountSkinRejuveLogos();

const { request, getToken } = window.skinRejuveApi;

if (!getToken()) {
  window.location.replace('/frontend/landing/html/index.html?auth=login');
}

const isDashboardPage = Boolean(document.getElementById('historyBody'));
if (!isDashboardPage) {
  // no-op for pages that share this script.
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
  const patientName = document.getElementById('patientName');

  const bookingModal = document.getElementById('bookingModal');
  const resultModal = document.getElementById('resultModal');
  const slipModal = document.getElementById('slipModal');
  const cancelConfirmModal = document.getElementById('cancelConfirmModal');

  const slipDocument = document.getElementById('slipDocument');
  const slipReference = document.getElementById('slipReference');
  const slipStatus = document.getElementById('slipModalStatus');
  const slipFeedback = document.getElementById('slipFeedback');

  const summaryTotal = document.getElementById('summaryTotal');
  const summaryCompleted = document.getElementById('summaryCompleted');
  const summaryDenied = document.getElementById('summaryDenied');
  const summaryPending = document.getElementById('summaryPending');

  const editAppointmentBtn = document.getElementById('editAppointmentBtn');
  const cancelAppointmentBtn = document.getElementById('cancelAppointmentBtn');

  const serviceSelect = document.getElementById('serviceId');
  const submitBookingBtn = document.getElementById('submitBookingBtn');
  const bookingModalTitle = document.getElementById('bookingModalTitle');
  const bookingModalSubtitle = document.getElementById('bookingModalSubtitle');
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

  const editableStatuses = new Set(['PENDING', 'CONFIRMED']);
  const cancellableStatuses = new Set(['PENDING', 'CONFIRMED']);

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

  function formatDateLabel(value) {
    if (!value) return '—';
    return new Date(value).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  }

  function formatTimeLabel(value) {
    if (!value) return '—';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return '—';
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  }

  function money(value) {
    const amount = Number(value || 0);
    if (Number.isNaN(amount) || amount <= 0) return 'To be confirmed';
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format(amount);
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

  function normalizeServices(item) {
    if (Array.isArray(item.services) && item.services.length) return item.services;
    if (item.serviceName) return [item.serviceName];
    return ['Clinic Service'];
  }

  function escapeHtml(input = '') {
    return String(input)
      .replaceAll('&', '&amp;')
      .replaceAll('<', '&lt;')
      .replaceAll('>', '&gt;')
      .replaceAll('"', '&quot;')
      .replaceAll("'", '&#39;');
  }

  function openModal(modal) {
    modal.hidden = false;
    document.body.classList.add('auth-modal-open');
    const firstFocusable = modal.querySelector('button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])');
    if (firstFocusable) firstFocusable.focus();
  }

  function closeModal(modal) {
    modal.hidden = true;

    if (modal === slipModal && state.lastSlipTrigger) {
      state.lastSlipTrigger.setAttribute('aria-expanded', 'false');
      state.lastSlipTrigger.focus();
      state.lastSlipTrigger = null;
    }

    if (bookingModal.hidden && resultModal.hidden && slipModal.hidden && cancelConfirmModal.hidden) {
      document.body.classList.remove('auth-modal-open');
    }
  }

  function selectedRecord() {
    return state.history.find((item) => String(item.id) === String(state.selectedSlipId));
  }

  function setSlipFeedback(message = '', type = 'info') {
    if (!message) {
      slipFeedback.hidden = true;
      slipFeedback.textContent = '';
      slipFeedback.classList.remove('is-error', 'is-success');
      return;
    }

    slipFeedback.hidden = false;
    slipFeedback.textContent = message;
    slipFeedback.classList.toggle('is-error', type === 'error');
    slipFeedback.classList.toggle('is-success', type === 'success');
  }

  function canEdit(item) {
    return item && editableStatuses.has((item.status || '').toUpperCase());
  }

  function canCancel(item) {
    return item && cancellableStatuses.has((item.status || '').toUpperCase());
  }

  function updateSlipActionStates(item) {
    editAppointmentBtn.disabled = !canEdit(item);
    cancelAppointmentBtn.disabled = !canCancel(item);

    editAppointmentBtn.title = editAppointmentBtn.disabled ? 'This appointment can no longer be edited.' : '';
    cancelAppointmentBtn.title = cancelAppointmentBtn.disabled ? 'This appointment can no longer be cancelled.' : '';
  }

  function updateSummaryCards() {
    const counts = state.history.reduce((acc, item) => {
      const key = (item.status || 'PENDING').toUpperCase();
      acc[key] = (acc[key] || 0) + 1;
      return acc;
    }, {});

    summaryTotal.textContent = String(state.history.length);
    summaryCompleted.textContent = String(counts.COMPLETED || 0);
    summaryDenied.textContent = String(counts.DENIED || 0);
    summaryPending.textContent = String((counts.PENDING || 0) + (counts.CONFIRMED || 0) + (counts.IN_PROGRESS || 0));
  }

  function infoRow(label, value) {
    return `<div class="slip-info-row"><dt>${label}</dt><dd>${value || '—'}</dd></div>`;
  }

  function renderSlip(item) {
    if (!item) {
      setSlipFeedback('Appointment slip could not be found for this record.', 'error');
      slipDocument.innerHTML = '';
      return;
    }

    setSlipFeedback('');
    slipReference.textContent = `Reference: ${item.id || 'N/A'}`;
    slipStatus.textContent = friendlyStatus(item.status);
    slipStatus.className = `slip-status-line status-text--${statusClass(item.status)}`;

    const profile = state.profile || {};
    const services = normalizeServices(item);
    const allergies = profile.allergies || profile.allergyNotes || item.allergies || 'No known allergies';

    const chips = services.map((service) => `<span class="service-chip">${escapeHtml(service)}</span>`).join('');

    slipDocument.innerHTML = `
      <section class="slip-section">
        <h3>Personal Information</h3>
        <dl class="slip-info-grid">
          ${infoRow('First Name', escapeHtml(profile.firstName || item.firstName || ''))}
          ${infoRow('Last Name', escapeHtml(profile.lastName || item.lastName || ''))}
          ${infoRow('Date of Birth', escapeHtml(profile.dateOfBirth ? formatDateLabel(profile.dateOfBirth) : (item.dateOfBirth ? formatDateLabel(item.dateOfBirth) : '')))}
        </dl>
      </section>

      <section class="slip-section">
        <h3>Contact Details</h3>
        <dl class="slip-info-grid">
          ${infoRow('Email Address', escapeHtml(profile.email || item.email || ''))}
          ${infoRow('Phone Number', escapeHtml(profile.phone || profile.mobile || item.phone || ''))}
        </dl>
      </section>

      <section class="slip-section">
        <h3>Services</h3>
        <div class="service-chip-list">${chips}</div>
      </section>

      <section class="slip-section slip-section--split">
        <div>
          <h3>Pricing</h3>
          <dl class="slip-info-grid">
            ${infoRow('Total Amount', money(item.totalAmount || item.price || item.amount))}
          </dl>
        </div>
        <div>
          <h3>Allergies</h3>
          <p class="slip-text">${escapeHtml(allergies)}</p>
        </div>
      </section>

      <section class="slip-section">
        <h3>Additional Details</h3>
        <dl class="slip-info-grid">
          ${infoRow('Branch', escapeHtml(resolvedBranch(item)))}
          ${infoRow('Preferred Date', escapeHtml(formatDateLabel(item.preferredDate || item.startAt)))}
          ${infoRow('Preferred Time', escapeHtml(formatTimeLabel(item.preferredTime || item.startAt)))}
          ${infoRow('Doctor', escapeHtml(item.staffName || item.doctor || 'To be assigned by clinic'))}
          ${infoRow('Consultation Duration', escapeHtml(item.consultationDuration || '60 minutes'))}
          ${infoRow('Notes', escapeHtml(item.notes || item.doctorNotes || 'No additional notes provided.'))}
          ${infoRow('Intake Remarks', escapeHtml(item.intakeRemarks || profile.medicalConditions || 'No intake remarks provided.'))}
        </dl>
      </section>
    `;

    updateSlipActionStates(item);
  }

  function openSlip(id, trigger) {
    state.selectedSlipId = id;
    state.lastSlipTrigger = trigger || null;

    historyBody.querySelectorAll('[data-action="view-slip"]').forEach((button) => button.setAttribute('aria-expanded', 'false'));
    if (trigger) trigger.setAttribute('aria-expanded', 'true');

    renderSlip(selectedRecord());
    openModal(slipModal);
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
      const serviceLabel = normalizeServices(item).join(', ');
      const email = state.profile?.email || item.email || 'Not provided';

      row.dataset.id = item.id || '';
      row.innerHTML = `
        <td data-label="Services">${escapeHtml(serviceLabel)}</td>
        <td data-label="Date">${escapeHtml(formatDate(item.startAt || item.preferredDate))}</td>
        <td data-label="Status"><span class="status-pill status-pill--${statusClass(currentStatus)}">${friendlyStatus(currentStatus)}</span></td>
        <td data-label="Email">${escapeHtml(email)}</td>
        <td data-label="Action">
          <button
            type="button"
            class="table-action"
            data-action="view-slip"
            data-id="${item.id || ''}"
            aria-label="View appointment slip for ${escapeHtml(serviceLabel)} on ${escapeHtml(formatDateLabel(item.startAt || item.preferredDate))}"
            aria-expanded="false"
            aria-controls="slipModal"
          >
            View
          </button>
        </td>
      `;

      historyBody.appendChild(row);
    });
  }

  function applyHistoryFilters() {
    const searchValue = historySearch.value.trim().toLowerCase();
    const statusValue = statusFilter.value;

    state.filteredHistory = state.history.filter((item) => {
      const status = (item.status || '').toUpperCase();
      const statusMatch = statusValue === 'all' || status === statusValue;
      const searchMatch = !searchValue
        || normalizeServices(item).join(' ').toLowerCase().includes(searchValue)
        || friendlyStatus(status).toLowerCase().includes(searchValue)
        || String(item.id || '').toLowerCase().includes(searchValue)
        || resolvedBranch(item).toLowerCase().includes(searchValue);

      return statusMatch && searchMatch;
    }).sort((a, b) => new Date(b.startAt || b.preferredDate).getTime() - new Date(a.startAt || a.preferredDate).getTime());

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
      slotBtn.textContent = time;

      if (state.selectedSlotId === String(slot.id)) slotBtn.classList.add('is-selected');

      slotBtn.addEventListener('click', () => {
        state.selectedSlotId = String(slot.id);
        slotError.textContent = '';
        renderSlots();
        updateBookingActionState();
      });

      slotGrid.appendChild(slotBtn);
    });
  }

  function updateBookingActionState() {
    const isReady = Boolean(document.getElementById('branchSelect').value)
      && Boolean(serviceSelect.value)
      && Boolean(state.selectedDateKey)
      && Boolean(state.selectedSlotId);

    submitBookingBtn.disabled = !isReady;
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

  function updateServiceDescription() {
    const text = serviceSelect.options[serviceSelect.selectedIndex]?.textContent?.toLowerCase() || '';
    if (text.includes('laser')) {
      serviceDescription.textContent = 'A targeted treatment for pigmentation and skin renewal. Final protocol is confirmed by clinic assessment.';
    } else if (text.includes('facial')) {
      serviceDescription.textContent = 'A restorative facial service designed around your current skin condition and treatment goals.';
    } else {
      serviceDescription.textContent = 'A premium clinic service selected for your consultation. Final treatment suitability is confirmed by your specialist.';
    }
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
      setResultModal(true, 'Your appointment request has been submitted.', 'We will notify you once your appointment has been reviewed.');
      openModal(resultModal);
      await Promise.all([loadBookingData(), loadHistory()]);
      return;
    }

    setResultModal(false, 'Your appointment request could not be submitted.', response?.message || 'Please try again in a few minutes or contact the clinic for assistance.');
    openModal(resultModal);
  }

  async function loadProfile() {
    const response = await request('/api/patient/profile');
    if (response?.success && response.data) {
      state.profile = response.data;
      const fullName = `${response.data.firstName || ''} ${response.data.lastName || ''}`.trim();
      if (patientName) patientName.textContent = fullName || 'Patient';
    }
  }

  async function loadHistory() {
    historyLoading.hidden = false;
    const response = await request('/api/appointments/history');
    historyLoading.hidden = true;

    if (!response?.success) {
      historyEmpty.hidden = false;
      historyEmpty.innerHTML = `<p>${response?.message || 'Unable to load appointment records right now.'}</p>`;
      return;
    }

    state.history = response.data || [];
    updateSummaryCards();
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

    state.selectedDateKey = '';
    state.selectedSlotId = '';

    renderCalendar();
    renderSlots();
    updateServiceDescription();
    updateBookingActionState();
  }

  async function attemptCancelAppointment() {
    const item = selectedRecord();
    if (!item) return;

    if (!canCancel(item)) {
      closeModal(cancelConfirmModal);
      setSlipFeedback('This appointment can no longer be cancelled.', 'error');
      return;
    }

    const response = await request(`/api/appointments/${item.id}/status`, 'PATCH', { status: 'CANCELLED' });
    if (response?.success) {
      item.status = 'CANCELLED';
      applyHistoryFilters();
      updateSummaryCards();
      renderSlip(item);
      closeModal(cancelConfirmModal);
      setSlipFeedback('Appointment cancelled successfully.', 'success');
      return;
    }

    closeModal(cancelConfirmModal);
    setSlipFeedback(response?.message || 'This appointment can no longer be cancelled.', 'error');
  }

  function openEditFlow() {
    const item = selectedRecord();
    if (!item) return;

    if (!canEdit(item)) {
      setSlipFeedback('This appointment can no longer be edited.', 'error');
      return;
    }

    closeModal(slipModal);
    bookingModalTitle.textContent = 'Edit Appointment';
    bookingModalSubtitle.textContent = 'Update your appointment details below. Current values are prefilled where available.';
    if (item.serviceId) serviceSelect.value = item.serviceId;
    updateServiceDescription();
    updateBookingActionState();
    setSlipFeedback('');
    openModal(bookingModal);
  }

  function handleHistoryTableClick(event) {
    const trigger = event.target.closest('[data-action="view-slip"]');
    if (!trigger) return;

    const id = trigger.dataset.id;
    if (!id) return;

    openSlip(id, trigger);
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
    document.getElementById('openBookingBtn').addEventListener('click', () => {
      bookingModalTitle.textContent = 'Book an Appointment';
      bookingModalSubtitle.textContent = 'Choose your service, date, and preferred time slot to submit your request.';
      openModal(bookingModal);
    });

    const navBookingBtn = document.getElementById('openBookingFromNav');
    if (navBookingBtn) navBookingBtn.addEventListener('click', () => openModal(bookingModal));

    document.getElementById('closeBookingModal').addEventListener('click', () => closeModal(bookingModal));
    document.getElementById('cancelBookingBtn').addEventListener('click', () => closeModal(bookingModal));
    document.querySelector('[data-close-booking="true"]').addEventListener('click', () => closeModal(bookingModal));

    document.querySelector('[data-close-result="true"]').addEventListener('click', () => closeModal(resultModal));
    document.getElementById('resultModalCta').addEventListener('click', () => closeModal(resultModal));

    document.getElementById('closeSlipModal').addEventListener('click', () => closeModal(slipModal));
    document.querySelector('[data-close-slip="true"]').addEventListener('click', () => closeModal(slipModal));

    document.querySelector('[data-close-cancel-confirm="true"]').addEventListener('click', () => closeModal(cancelConfirmModal));
    document.getElementById('keepAppointmentBtn').addEventListener('click', () => closeModal(cancelConfirmModal));
    document.getElementById('confirmCancelBtn').addEventListener('click', attemptCancelAppointment);

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
    historyBody.addEventListener('click', handleHistoryTableClick);

    document.getElementById('bookingForm').addEventListener('submit', submitBooking);
    editAppointmentBtn.addEventListener('click', openEditFlow);
    cancelAppointmentBtn.addEventListener('click', () => {
      const item = selectedRecord();
      if (!canCancel(item)) {
        setSlipFeedback('This appointment can no longer be cancelled.', 'error');
        return;
      }
      openModal(cancelConfirmModal);
    });

    window.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (!cancelConfirmModal.hidden) closeModal(cancelConfirmModal);
        else if (!slipModal.hidden) closeModal(slipModal);
        else if (!bookingModal.hidden) closeModal(bookingModal);
        else if (!resultModal.hidden) closeModal(resultModal);
      }

      if (!slipModal.hidden) trapModalFocus(event, slipModal);
      if (!bookingModal.hidden) trapModalFocus(event, bookingModal);
      if (!cancelConfirmModal.hidden) trapModalFocus(event, cancelConfirmModal);
      if (!resultModal.hidden) trapModalFocus(event, resultModal);
    });
  }

  async function init() {
    setupEventListeners();
    await Promise.all([loadProfile(), loadHistory(), loadBookingData()]);

    const bookingIntent = new URLSearchParams(window.location.search).get('booking');
    if (bookingIntent === '1') openModal(bookingModal);
  }

  init();
}
