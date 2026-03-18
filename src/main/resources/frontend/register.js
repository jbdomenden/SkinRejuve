if (window.mountSkinRejuveLogos) window.mountSkinRejuveLogos();

const { request } = window.skinRejuveApi;

document.getElementById('registerBtn').onclick = async () => {
  const email = document.getElementById('registerEmail').value;
  const password = document.getElementById('registerPassword').value;
  const response = await request('/api/auth/register', 'POST', { email, password });
  document.getElementById('registerMsg').textContent = JSON.stringify(response, null, 2);
};
