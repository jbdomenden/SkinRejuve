if (window.mountSkinRejuveLogos) window.mountSkinRejuveLogos();

const api = window.skinRejuveApi;
if (!api) throw new Error('skinRejuveApi is required');

const { request, setToken, getToken, getUserRole } = api;

function redirectForRole(role) {
  if (role === 'ADMIN') {
    window.location.replace('/frontend/admin/html/admin-dashboard.html');
    return;
  }
  window.location.replace('/frontend/dashboard/html/dashboard.html');
}

if (document.getElementById('loginForm') && getToken()) {
  redirectForRole(getUserRole());
}

const loginForm = document.getElementById('loginForm');
if (loginForm) {
  const authMsg = document.getElementById('authMsg');

  loginForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const identifierEl = document.getElementById('loginIdentifier');
    const passwordEl = document.getElementById('loginPassword');
    const rememberMe = document.getElementById('rememberMe')?.checked;

    const identifierError = document.getElementById('loginIdentifierError');
    const passwordError = document.getElementById('loginPasswordError');
    identifierError.textContent = '';
    passwordError.textContent = '';

    const identifier = identifierEl.value.trim();
    const password = passwordEl.value;

    let valid = true;
    if (!identifier) {
      identifierError.textContent = 'Please enter your username or email.';
      valid = false;
    }
    if (!password) {
      passwordError.textContent = 'Please enter your password.';
      valid = false;
    }
    if (!valid) return;

    authMsg.textContent = 'Signing you in...';
    authMsg.dataset.state = 'info';

    const response = await request('/api/auth/login', 'POST', {
      email: identifier,
      password,
    });

    const token = response?.data?.token;
    if (response?.success && token) {
      setToken(token, rememberMe);
      authMsg.textContent = 'Sign in successful. Redirecting to your dashboard...';
      authMsg.dataset.state = 'success';
      redirectForRole(getUserRole());
      return;
    }

    authMsg.textContent = response?.message || 'Incorrect username/email or password. Please try again.';
    authMsg.dataset.state = 'error';
  });
}

const forgotForm = document.getElementById('forgotPasswordForm');
if (forgotForm) {
  const forgotMsg = document.getElementById('forgotMsg');

  forgotForm.addEventListener('submit', async (event) => {
    event.preventDefault();

    const emailEl = document.getElementById('forgotEmail');
    const email = emailEl.value.trim();

    if (!email) {
      forgotMsg.textContent = 'Please enter the email associated with your account.';
      forgotMsg.dataset.state = 'error';
      return;
    }

    forgotMsg.textContent = 'Sending reset link...';
    forgotMsg.dataset.state = 'info';

    const response = await request('/api/auth/forgot-password', 'POST', { email });

    if (!response?.success) {
      forgotMsg.textContent = response?.message || 'We could not find an account with that email.';
      forgotMsg.dataset.state = 'error';
      return;
    }

    forgotMsg.textContent = 'Reset instructions sent. Redirecting...';
    forgotMsg.dataset.state = 'success';
    window.setTimeout(() => {
      window.location.href = '/frontend/auth/html/reset-success.html';
    }, 700);
  });
}
