if (window.mountSkinRejuveLogos) window.mountSkinRejuveLogos();

const { request } = window.skinRejuveApi;
const registerForm = document.getElementById('registerForm');
const registerMsg = document.getElementById('registerMsg');

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  const email = document.getElementById('registerEmail').value.trim();
  const password = document.getElementById('registerPassword').value;

  registerMsg.textContent = 'Creating your account...';
  registerMsg.dataset.state = 'info';

  const response = await request('/api/auth/register', 'POST', { email, password });
  const verifyToken = response?.data?.verifyToken;
  const baseMessage = response?.message || 'Registration complete. Verify the email with the backend /api/auth/verify-email endpoint.';
  registerMsg.textContent = verifyToken ? `${baseMessage} Verification token: ${verifyToken}` : baseMessage;
  registerMsg.dataset.state = response?.success ? 'success' : 'error';

  if (response?.success) {
    registerForm.reset();
  }
});
