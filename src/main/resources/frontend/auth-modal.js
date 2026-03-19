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

  function setMessage(element, message, state) {
    if (!element) return;
    element.textContent = message;
    if (state) element.dataset.state = state;
  }

  function redirectForRole(role) {
    const intendedPath = consumePostLoginRedirect();
    if (role === 'ADMIN' || role === 'STAFF') {
      window.location.replace('admin-dashboard.html');
      return;
    }
    if (intendedPath) {
      window.location.replace(intendedPath);
      return;
    }
    window.location.replace('dashboard.html');
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
  }

  function openModal(tab = 'login', intent = '') {
    if (!authModal) return;
    if (intent === 'booking') {
      setPostLoginRedirect('dashboard.html?booking=1');
    } else if (!getToken()) {
      clearPostLoginRedirect();
    }
    authModal.hidden = false;
    document.body.classList.add('auth-modal-open');
    selectTab(tab);
  }

  function closeModal() {
    if (!authModal) return;
    authModal.hidden = true;
    document.body.classList.remove('auth-modal-open');
  }

  if (getToken()) {
    redirectForRole(getUserRole());
    return;
  }

  openButtons.forEach((button) => {
    button.addEventListener('click', () => {
      openModal(button.dataset.authOpen || 'login', button.dataset.authIntent || '');
    });
  });

  closeButtons.forEach((button) => button.addEventListener('click', closeModal));
  loginTabs.forEach((button) => button.addEventListener('click', () => selectTab(button.dataset.authTab)));

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
    const email = document.getElementById('registerEmail').value.trim();
    const password = document.getElementById('registerPassword').value;

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

    setMessage(registerMsg, 'Account ready. Signing you in...', 'info');
    const loginResponse = await request('/api/auth/login', 'POST', { email, password });
    const token = loginResponse?.data?.token;

    if (loginResponse?.success && token) {
      setToken(token, true);
      setMessage(registerMsg, 'Welcome to SkinRejuve. Redirecting...', 'success');
      redirectForRole(getUserRole());
      return;
    }

    setMessage(registerMsg, loginResponse?.message || response?.message || 'Account created. Please sign in.', loginResponse?.success ? 'success' : 'error');
  });
})();
