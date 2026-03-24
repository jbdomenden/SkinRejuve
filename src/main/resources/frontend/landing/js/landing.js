if (window.mountSkinRejuveLogos) window.mountSkinRejuveLogos();

(function () {
  const branchData = window.skinRejuveBranchData || [];
  const serviceData = window.skinRejuveServiceData || [];

  const serviceGrid = document.getElementById('servicesGrid');
  const branchGrid = document.getElementById('branchGrid');
  const galleryGrid = document.getElementById('landingGalleryGrid');
  const bookingModal = document.getElementById('bookingModal');
  const serviceModal = document.getElementById('serviceModal');
  const bookingProgress = document.getElementById('bookingProgress');
  const bookingSteps = Array.from(document.querySelectorAll('[data-booking-step]'));
  const bookingBranch = document.getElementById('bookingBranch');
  const bookingCategory = document.getElementById('bookingCategory');
  const bookingService = document.getElementById('bookingService');
  const bookingDate = document.getElementById('bookingDate');
  const bookingTime = document.getElementById('bookingTime');
  const bookingReview = document.getElementById('bookingReview');
  const bookingMsg = document.getElementById('bookingMsg');
  const bookingServiceSummary = document.getElementById('bookingServiceSummary');
  const bookingBackBtn = document.getElementById('bookingBackBtn');
  const bookingNextBtn = document.getElementById('bookingNextBtn');
  const serviceModalTitle = document.getElementById('serviceModalTitle');
  const serviceModalDescription = document.getElementById('serviceModalDescription');
  const serviceModalList = document.getElementById('serviceModalList');
  const navToggle = document.querySelector('[data-nav-toggle]');
  const navPanel = document.querySelector('[data-nav-panel]');
  const galleryCards = [
    {
      title: 'Facebook updates',
      description: 'Follow clinic announcements, branch updates, and patient-ready service highlights on Facebook.',
      href: 'https://www.facebook.com/skinrejuve',
      ctaLabel: 'Open Facebook',
    },
    {
      title: 'Instagram treatments',
      description: 'Browse treatment highlights, clinic aesthetics, and polished brand moments on Instagram.',
      href: 'https://www.instagram.com/skinrejuve',
      ctaLabel: 'Open Instagram',
    },
    {
      title: 'TikTok or reels',
      description: 'Watch short-form skincare education, clinic stories, and quick treatment features.',
      href: 'https://www.tiktok.com/@skinrejuve',
      ctaLabel: 'Open channel',
    },
  ];

  let activeBookingStep = 1;
  let lastFocusedElement = null;
  const bookingState = {
    branch: '',
    category: '',
    service: '',
    date: '',
    time: '',
  };

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function openModal(modal) {
    if (!modal) return;
    lastFocusedElement = document.activeElement;
    modal.hidden = false;
    document.body.classList.add('auth-modal-open');
    const focusTarget = modal.querySelector('button, [href], input, select, textarea');
    focusTarget?.focus();
  }

  function closeModal(modal) {
    if (!modal) return;
    modal.hidden = true;
    if (!document.querySelector('.modal-shell:not([hidden]), .auth-modal:not([hidden])')) {
      document.body.classList.remove('auth-modal-open');
    }
    lastFocusedElement?.focus?.();
  }

  function renderServices() {
    serviceGrid.innerHTML = serviceData.map((service) => `
      <article class="service-card">
        <span class="service-card-index">${escapeHtml(service.title)}</span>
        <h3>${escapeHtml(service.title)}</h3>
        <p>${escapeHtml(service.description)}</p>
        <p class="service-concerns"><strong>Common concerns:</strong> ${escapeHtml(service.concerns)}</p>
        <ul class="service-example-list">
          ${service.examples.map((example) => `<li>${escapeHtml(example)}</li>`).join('')}
        </ul>
        <div class="service-card-actions">
          <button class="landing-btn landing-btn-secondary" type="button" data-service-details="${escapeHtml(service.id)}">View Treatments</button>
          <button class="landing-btn" type="button" data-book-category="${escapeHtml(service.id)}">Book Now</button>
        </div>
      </article>
    `).join('');
  }

  function renderBranches() {
    branchGrid.innerHTML = branchData.map((branch) => `
      <article class="branch-card" itemscope itemtype="https://schema.org/MedicalClinic">
        <div class="branch-meta">
          <span class="showcase-label">${escapeHtml(branch.shortName)}</span>
          <h3 itemprop="name">${escapeHtml(branch.name)}</h3>
          <p class="branch-address" itemprop="address">${escapeHtml(branch.address)}</p>
          <p><strong>Clinic hours:</strong> ${escapeHtml(branch.hours)}</p>
          <p><strong>Landline:</strong> ${branch.landlineHref ? `<a href="${escapeHtml(branch.landlineHref)}">${escapeHtml(branch.landlineLabel)}</a>` : escapeHtml(branch.landlineLabel)}</p>
          <p><strong>Mobile:</strong> <a href="${escapeHtml(branch.mobileHref)}">${escapeHtml(branch.mobileLabel)}</a></p>
        </div>
        <div class="branch-actions">
          <a class="landing-btn landing-btn-secondary" href="${escapeHtml(branch.directionsUrl)}" target="_blank" rel="noreferrer">Get Directions</a>
          <a class="landing-btn landing-btn-secondary" href="${escapeHtml(branch.mobileHref)}">Call</a>
          <a class="landing-btn" href="${escapeHtml(branch.messageUrl)}" target="_blank" rel="noreferrer">Message</a>
        </div>
      </article>
    `).join('');
  }

  function renderGallery() {
    galleryGrid.innerHTML = galleryCards.map((item, index) => `
      <a class="clinic-gallery-card" href="${escapeHtml(item.href)}" target="_blank" rel="noreferrer">
        <div class="clinic-gallery-media is-gallery-cover" aria-hidden="true">0${index + 1}</div>
        <div class="clinic-gallery-copy">
          <span class="showcase-label">Public channel</span>
          <h3>${escapeHtml(item.title)}</h3>
          <p>${escapeHtml(item.description)}</p>
          <strong>${escapeHtml(item.ctaLabel)}</strong>
        </div>
      </a>
    `).join('');
  }

  function populateBranchSelects() {
    const options = ['<option value="">Select a branch</option>'].concat(
      branchData.map((branch) => `<option value="${escapeHtml(branch.id)}">${escapeHtml(branch.name)}</option>`),
    );
    bookingBranch.innerHTML = options.join('');
    const registerBranch = document.getElementById('registerPreferredBranch');
    if (registerBranch) registerBranch.innerHTML = options.join('');
  }

  function populateCategorySelect() {
    bookingCategory.innerHTML = ['<option value="">Select a category</option>'].concat(
      serviceData.map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.title)}</option>`),
    ).join('');
  }

  function populateServiceSelect(categoryId) {
    const match = serviceData.find((item) => item.id === categoryId);
    const treatments = match?.treatments || [];
    bookingService.innerHTML = ['<option value="">Select a treatment</option>'].concat(
      treatments.map((item) => `<option value="${escapeHtml(item.name)}">${escapeHtml(item.name)}</option>`),
    ).join('');
    bookingServiceSummary.innerHTML = match
      ? `<p><strong>${escapeHtml(match.title)}:</strong> ${escapeHtml(match.description)}</p><p>${escapeHtml(match.concerns)}</p>`
      : '';
  }

  function renderBookingProgress() {
    bookingProgress.innerHTML = [1, 2, 3, 4, 5].map((step) => `
      <span class="progress-pill ${step === activeBookingStep ? 'is-active' : ''} ${step < activeBookingStep ? 'is-complete' : ''}">Step ${step}</span>
    `).join('');
  }

  function showBookingStep(step) {
    activeBookingStep = step;
    bookingSteps.forEach((section) => {
      section.hidden = Number(section.dataset.bookingStep) !== step;
    });
    bookingBackBtn.hidden = step === 1;
    bookingNextBtn.hidden = step === 5;
    renderBookingProgress();
    bookingMsg.textContent = '';
  }

  function getBranchLabel(id) {
    return branchData.find((branch) => branch.id === id)?.name || '';
  }

  function getCategoryLabel(id) {
    return serviceData.find((service) => service.id === id)?.title || '';
  }

  function updateBookingReview() {
    bookingReview.innerHTML = `
      <p><strong>Branch:</strong> ${escapeHtml(getBranchLabel(bookingState.branch))}</p>
      <p><strong>Category:</strong> ${escapeHtml(getCategoryLabel(bookingState.category))}</p>
      <p><strong>Treatment:</strong> ${escapeHtml(bookingState.service)}</p>
      <p><strong>Date:</strong> ${escapeHtml(bookingState.date)}</p>
      <p><strong>Time:</strong> ${escapeHtml(bookingState.time)}</p>
    `;
  }

  function validateBookingStep(step) {
    if (step === 1 && !bookingBranch.value) return 'Please choose a branch to continue.';
    if (step === 2 && !bookingCategory.value) return 'Please choose a service category.';
    if (step === 3 && !bookingService.value) return 'Please choose a treatment.';
    if (step === 4 && (!bookingDate.value || !bookingTime.value)) return 'Please choose a date and time.';
    return '';
  }

  function syncBookingState() {
    bookingState.branch = bookingBranch.value;
    bookingState.category = bookingCategory.value;
    bookingState.service = bookingService.value;
    bookingState.date = bookingDate.value;
    bookingState.time = bookingTime.value;
    updateBookingReview();
  }

  function resetBookingFlow(prefilledCategory = '') {
    document.getElementById('bookingFlowForm').reset();
    populateCategorySelect();
    populateServiceSelect(prefilledCategory);
    if (prefilledCategory) bookingCategory.value = prefilledCategory;
    const today = new Date().toISOString().split('T')[0];
    bookingDate.min = today;
    Object.keys(bookingState).forEach((key) => { bookingState[key] = ''; });
    bookingServiceSummary.innerHTML = '';
    bookingReview.innerHTML = '';
    showBookingStep(1);
  }

  function openBookingModal(prefilledCategory = '') {
    resetBookingFlow(prefilledCategory);
    if (prefilledCategory) {
      bookingCategory.value = prefilledCategory;
    }
    openModal(bookingModal);
  }

  function showServiceDetails(serviceId) {
    const match = serviceData.find((service) => service.id === serviceId);
    if (!match) return;
    serviceModalTitle.textContent = match.title;
    serviceModalDescription.textContent = `${match.description} ${match.concerns}`;
    serviceModalList.innerHTML = match.treatments.map((item) => `
      <article class="service-detail-card">
        <h3>${escapeHtml(item.name)}</h3>
        <p>${escapeHtml(item.detail)}</p>
      </article>
    `).join('');
    openModal(serviceModal);
  }

  function handleBookingNext() {
    syncBookingState();
    const error = validateBookingStep(activeBookingStep);
    if (error) {
      bookingMsg.textContent = error;
      bookingMsg.dataset.state = 'error';
      return;
    }
    if (activeBookingStep === 2) populateServiceSelect(bookingCategory.value);
    if (activeBookingStep === 4) updateBookingReview();
    showBookingStep(Math.min(activeBookingStep + 1, 5));
  }

  function bindEvents() {
    document.querySelectorAll('[data-booking-open]').forEach((button) => {
      button.addEventListener('click', () => openBookingModal());
    });

    document.addEventListener('click', (event) => {
      const serviceButton = event.target.closest('[data-service-details]');
      const bookCategoryButton = event.target.closest('[data-book-category]');
      const closeButton = event.target.closest('[data-modal-close]');
      if (serviceButton) showServiceDetails(serviceButton.dataset.serviceDetails);
      if (bookCategoryButton) openBookingModal(bookCategoryButton.dataset.bookCategory);
      if (closeButton) closeModal(document.getElementById(closeButton.dataset.modalClose));
    });

    bookingNextBtn?.addEventListener('click', handleBookingNext);
    bookingBackBtn?.addEventListener('click', () => showBookingStep(Math.max(activeBookingStep - 1, 1)));
    bookingCategory?.addEventListener('change', () => {
      populateServiceSelect(bookingCategory.value);
      syncBookingState();
    });
    [bookingBranch, bookingService, bookingDate, bookingTime].forEach((element) => {
      element?.addEventListener('change', syncBookingState);
    });

    navToggle?.addEventListener('click', () => {
      const isOpen = navPanel.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    navPanel?.querySelectorAll('a, button').forEach((item) => {
      item.addEventListener('click', () => {
        navPanel.classList.remove('is-open');
        navToggle?.setAttribute('aria-expanded', 'false');
      });
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        if (!bookingModal.hidden) closeModal(bookingModal);
        if (!serviceModal.hidden) closeModal(serviceModal);
      }
    });
  }

  renderServices();
  renderBranches();
  renderGallery();
  populateBranchSelects();
  populateCategorySelect();
  populateServiceSelect('');
  bindEvents();
})();
