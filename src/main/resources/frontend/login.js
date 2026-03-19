if (window.mountSkinRejuveLogos) window.mountSkinRejuveLogos();

const { request, setToken, getToken, getUserRole } = window.skinRejuveApi;
const authMsg = document.getElementById('authMsg');
const loginForm = document.getElementById('loginForm');
const forgotPasswordBtn = document.getElementById('forgotPasswordBtn');

function redirectForRole(role) {
  if (role === 'ADMIN') {
    window.location.replace('admin-dashboard.html');
    return;
  }
  window.location.replace('dashboard.html');
}

if (getToken()) {
  redirectForRole(getUserRole());
}

forgotPasswordBtn.addEventListener('click', async () => {
  const email = document.getElementById('email').value.trim();
  if (!email) {
    authMsg.textContent = 'Enter your email first so we can send a password reset link.';
    authMsg.dataset.state = 'error';
    return;
  }

  authMsg.textContent = 'Sending password reset email...';
  authMsg.dataset.state = 'info';
  const response = await request('/api/auth/forgot-password', 'POST', { email });
  authMsg.textContent = response?.message || 'If the account exists, a reset email was sent.';
  authMsg.dataset.state = response?.success ? 'success' : 'error';
});

loginForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const rememberMe = document.getElementById('rememberMe').checked;

  authMsg.textContent = 'Signing you in...';
  authMsg.dataset.state = 'info';

  const response = await request('/api/auth/login', 'POST', { email, password });
  const token = response?.data?.token;

  if (response?.success && token) {
    setToken(token, rememberMe);
    authMsg.textContent = 'Login successful. Redirecting...';
    authMsg.dataset.state = 'success';
    redirectForRole(getUserRole());
    return;
  }

  authMsg.textContent = response?.message || 'Unable to sign in.';
  authMsg.dataset.state = 'error';
});
