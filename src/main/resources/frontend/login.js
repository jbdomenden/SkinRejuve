if (window.mountSkinRejuveLogos) window.mountSkinRejuveLogos();

const { request, setToken, getToken } = window.skinRejuveApi;

if (getToken()) {
  window.location.replace('dashboard.html');
}

document.getElementById('loginBtn').onclick = async () => {
  const email = document.getElementById('email').value;
  const password = document.getElementById('password').value;
  const response = await request('/api/auth/login', 'POST', { email, password });

  if (response?.data?.accessToken) {
    setToken(response.data.accessToken);
    window.location.href = 'dashboard.html';
    return;
  }

  document.getElementById('authMsg').textContent = JSON.stringify(response, null, 2);
};
