if (window.mountSkinRejuveLogos) window.mountSkinRejuveLogos();

(function () {
  const {
    request,
    setToken,
    getToken,
    getUserRole,
    consumePostLoginRedirect,
    setPostLoginRedirect,
    clearPostLoginRedirect,
    normalizeBackendPath,
  } = window.skinRejuveApi;

  const authModal = document.getElementById('authModal');
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const authMsg = document.getElementById('authMsg');
  const registerMsg = document.getElementById('registerMsg');
  const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');
  const loginTabs = Array.from(document.querySelectorAll('[data-auth-tab]'));
  const panels = Array.from(document.querySelectorAll('[data-auth-panel]'));
  const openButtons = Array.from(document.querySelectorAll('[data-auth-open]'));
  const closeButtons = Array.from(document.querySelectorAll('[data-auth-close]'));
  const registerSteps = Array.from(document.querySelectorAll('[data-register-step]'));
  const registerNextBtn = document.getElementById('registerNextBtn');
  const registerBackBtn = document.getElementById('registerBackBtn');
  const registerBtn = document.getElementById('registerBtn');
  const registerProgress = document.getElementById('registerProgress');
  const registerReview = document.getElementById('registerReview');

  let activeRegisterStep = 1;
  let lastFocusedElement = null;

  function setMessage(element, message, state) {
    if (!element) return;
    element.textContent = message;
    if (state) element.dataset.state = state;
  }

  function splitName(fullName) {
    const parts = fullName.trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return { firstName: '', lastName: '' };
    if (parts.length === 1) return { firstName: parts[0], lastName: parts[0] };
    return {
      firstName: parts.slice(0, -1).join(' '),
      lastName: parts.slice(-1).join(' '),
    };
  }

  function redirectForRole(role) {
    const intendedPath = consumePostLoginRedirect();
    if (role === 'ADMIN' || role === 'STAFF') {
      window.location.replace('/frontend/admin/html/admin-dashboard.html');
      return;
    }
    if (intendedPath) {
      window.location.replace(intendedPath);
      return;
    }
    window.location.replace('/frontend/dashboard/html/dashboard.html');
  }

  function renderRegisterProgress() {
    if (!registerProgress) return;
    registerProgress.innerHTML = [1, 2, 3, 4].map((step) => `
      <span class="progress-pill ${step === activeRegisterStep ? 'is-active' : ''} ${step < activeRegisterStep ? 'is-complete' : ''}">Step ${step}</span>
    `).join('');
  }

  function buildReviewPanel() {
    const preferredBranch = document.getElementById('registerPreferredBranch');
    const skinType = registerForm.querySelector('input[name="skinType"]:checked')?.value || 'Not selected';
    const allergyChoice = registerForm.querySelector('input[name="allergiesChoice"]:checked')?.value || '';
    registerReview.innerHTML = `
      <p><strong>Name:</strong> ${document.getElementById('registerFullName').value.trim()}</p>
      <p><strong>Email:</strong> ${document.getElementById('registerEmail').value.trim()}</p>
      <p><strong>Phone:</strong> ${document.getElementById('registerPhone').value.trim()}</p>
      <p><strong>Preferred branch:</strong> ${preferredBranch.options[preferredBranch.selectedIndex]?.text || ''}</p>
      <p><strong>Skin type:</strong> ${skinType}</p>
      <p><strong>Allergies:</strong> ${allergyChoice || 'Not specified'}</p>
    `;
  }

  function renderRegisterStep(step) {
    activeRegisterStep = step;
    registerSteps.forEach((section) => {
      section.hidden = Number(section.dataset.registerStep) !== step;
    });
    registerBackBtn.hidden = step === 1;
    registerNextBtn.hidden = step === 4;
    registerBtn.hidden = step !== 4;
    if (step === 4) buildReviewPanel();
    renderRegisterProgress();
    setMessage(registerMsg, '', 'info');
  }

  function selectTab(tab) {
    loginTabs.forEach((button) => {
      const active = button.dataset.authTab === tab;
      button.classList.toggle('tab-active', active);
      button.setAttribute('aria-selected', String(active));
    });
    panels.forEach((panel) => {
      panel.hidden = panel.dataset.authPanel !== tab;
    });
    if (tab === 'register') renderRegisterStep(1);
  }

  function openModal(tab = 'login', intent = '') {
    if (!authModal) return;
    lastFocusedElement = document.activeElement;
    if (intent === 'booking') {
      setPostLoginRedirect('/frontend/dashboard/html/dashboard.html?booking=1');
    } else if (!getToken()) {
      clearPostLoginRedirect();
    }
    authModal.hidden = false;
    document.body.classList.add('auth-modal-open');
    selectTab(tab);
    authModal.querySelector('button, input, select')?.focus();
  }

  function closeModal() {
    if (!authModal) return;
    authModal.hidden = true;
    if (!document.querySelector('.modal-shell:not([hidden])')) {
      document.body.classList.remove('auth-modal-open');
    }
    lastFocusedElement?.focus?.();
  }

  function validateRegisterStep(step) {
    const fullName = document.getElementById('registerFullName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;
    const confirmPassword = document.getElementById('registerConfirmPassword').value;
    const phone = document.getElementById('registerPhone').value.trim();
    const dob = document.getElementById('registerDob').value;
    const preferredBranch = document.getElementById('registerPreferredBranch').value;
    const allergies = registerForm.querySelector('input[name="allergiesChoice"]:checked')?.value || '';
    const allergyNotes = document.getElementById('registerAllergyNotes').value.trim();
    const privacyConsent = document.getElementById('privacyConsent').checked;
    const skinType = registerForm.querySelector('input[name="skinType"]:checked')?.value || '';

    if (step === 1) {
      if (!fullName) return 'Please enter your full name to continue.';
      if (!email) return 'Please enter your email address.';
      if (!phone) return 'Please enter your contact number.';
      if (!dob) return 'Please enter your date of birth.';
      if (!password || password.length < 8) return 'Please create a password with at least 8 characters.';
      if (password !== confirmPassword) return 'Password and confirm password must match.';
    }

    if (step === 2) {
      if (!preferredBranch) return 'Please choose your preferred branch.';
    }

    if (step === 3) {
      if (!skinType) return 'Please select your skin type.';
      if (!allergies) return 'Please tell us whether you have allergies.';
      if (allergies === 'YES' && !allergyNotes) return 'Please list your allergies or sensitivities.';
    }

    if (step === 4 && !privacyConsent) {
      return 'Please accept the privacy and consent policy before continuing.';
    }

    return '';
  }

  async function completeRegistration() {
    const fullName = document.getElementById('registerFullName').value.trim();
    const email = document.getElementById('registerEmail').value.trim();
    const phone = document.getElementById('registerPhone').value.trim();
    const dateOfBirth = document.getElementById('registerDob').value;
    const password = document.getElementById('registerPassword').value;
    const username = document.getElementById('registerUsername').value.trim();
    const allergiesChoice = registerForm.querySelector('input[name="allergiesChoice"]:checked')?.value || '';
    const allergyNotes = document.getElementById('registerAllergyNotes').value.trim();
    const conditions = document.getElementById('registerConditions').value.trim();
    const pastTreatments = document.getElementById('registerTreatments').value.trim();
    const preferredBranch = document.getElementById('registerPreferredBranch').selectedOptions[0]?.textContent || '';
    const skinType = registerForm.querySelector('input[name="skinType"]:checked')?.value || '';

    const finalValidationMessage = validateRegisterStep(4);
    if (finalValidationMessage) {
      setMessage(registerMsg, finalValidationMessage, 'error');
      return;
    }

    const { firstName, lastName } = splitName(fullName);
    const notes = [
      skinType ? `Skin type: ${skinType}` : '',
      username ? `Preferred username: ${username}` : '',
      preferredBranch ? `Preferred branch: ${preferredBranch}` : '',
      pastTreatments ? `Past treatment: ${pastTreatments}` : '',
    ].filter(Boolean).join(' • ');

    setMessage(registerMsg, 'Creating your account...', 'info');
    const response = await request('/api/auth/register', 'POST', { email, password });
    if (!response?.success) {
      setMessage(registerMsg, response?.message || 'Unable to create your account.', 'error');
      return;
    }

    const verificationUrl = response?.data?.verificationUrl;
    if (verificationUrl) {
      setMessage(registerMsg, 'Account created. Verifying your email with the backend...', 'info');
      const verifyResponse = await request(normalizeBackendPath(verificationUrl));
      if (!verifyResponse?.success) {
        setMessage(registerMsg, verifyResponse?.message || 'Account created, but email verification still needs to be completed.', 'error');
        return;
      }
    }

    setMessage(registerMsg, 'Signing you in and preparing your profile...', 'info');
    const loginResponse = await request('/api/auth/login', 'POST', { email, password });
    const token = loginResponse?.data?.token;

    if (!(loginResponse?.success && token)) {
      setMessage(registerMsg, loginResponse?.message || 'Account created. Please sign in.', 'error');
      return;
    }

    setToken(token, true);

    const profileResponse = await request('/api/patient/profile', 'POST', {
      firstName,
      lastName,
      phone: phone || null,
      dateOfBirth: dateOfBirth || null,
    });

    const intakeResponse = profileResponse?.success
      ? await request('/api/patient/intake', 'POST', {
          allergies: allergiesChoice === 'YES' ? allergyNotes || 'Patient reported allergies' : 'No known allergies provided during signup',
          medications: null,
          conditions: conditions || null,
          notes: notes || null,
        })
      : null;

    if (!profileResponse?.success || !intakeResponse?.success) {
      setMessage(registerMsg, 'Your account was created, but some profile details still need review after login.', 'info');
      redirectForRole(getUserRole());
      return;
    }

    setMessage(registerMsg, 'Welcome to Skin Rejuve. Redirecting...', 'success');
    redirectForRole(getUserRole());
  }

  openButtons.forEach((button) => {
    button.addEventListener('click', () => {
      if (getToken()) {
        const intent = button.dataset.authIntent || '';
        if (intent === 'booking') {
          setPostLoginRedirect('/frontend/dashboard/html/dashboard.html?booking=1');
        }
        redirectForRole(getUserRole());
        return;
      }
      openModal(button.dataset.authOpen || 'login', button.dataset.authIntent || '');
    });
  });

  closeButtons.forEach((button) => button.addEventListener('click', closeModal));
  loginTabs.forEach((button) => button.addEventListener('click', () => selectTab(button.dataset.authTab)));

  registerNextBtn?.addEventListener('click', () => {
    const error = validateRegisterStep(activeRegisterStep);
    if (error) {
      setMessage(registerMsg, error, 'error');
      return;
    }
    renderRegisterStep(Math.min(activeRegisterStep + 1, 4));
  });

  registerBackBtn?.addEventListener('click', () => renderRegisterStep(Math.max(activeRegisterStep - 1, 1)));

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && authModal && !authModal.hidden) closeModal();
  });

  const params = new URLSearchParams(window.location.search);
  const requestedModal = params.get('auth');
  const requestedIntent = params.get('intent');
  if (requestedModal === 'login' || requestedModal === 'register') {
    openModal(requestedModal, requestedIntent || '');
  }

  forgotPasswordBtn?.addEventListener('click', async () => {
    const email = document.getElementById('email').value.trim();
    if (!email) {
      setMessage(authMsg, 'Enter your email first so we can send a password reset link.', 'error');
      return;
    }

    setMessage(authMsg, 'Sending password reset email...', 'info');
    const response = await request('/api/auth/forgot-password', 'POST', { email });
    setMessage(authMsg, response?.message || 'If the account exists, a reset email was sent.', response?.success ? 'success' : 'error');
  });

  loginForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value;
    const rememberMe = document.getElementById('rememberMe').checked;

    setMessage(authMsg, 'Signing you in...', 'info');
    const response = await request('/api/auth/login', 'POST', { email, password });
    const token = response?.data?.token;

    if (response?.success && token) {
      setToken(token, rememberMe);
      setMessage(authMsg, 'Login successful. Redirecting...', 'success');
      redirectForRole(getUserRole());
      return;
    }

    setMessage(authMsg, response?.message || 'Unable to sign in.', 'error');
  });

  registerForm?.addEventListener('submit', async (event) => {
    event.preventDefault();
    await completeRegistration();
  });

  renderRegisterProgress();
})();
