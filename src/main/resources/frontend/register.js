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
  registerMsg.textContent = response?.message || 'Registration complete.';
  registerMsg.dataset.state = response?.success ? 'success' : 'error';

  if (response?.success) {
    registerForm.reset();
  }
});
