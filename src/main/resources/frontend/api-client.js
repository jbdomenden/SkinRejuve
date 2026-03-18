const api = 'http://localhost:8080';

function getToken() {
  return localStorage.getItem('token') || '';
}

function setToken(token) {
  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
}

async function request(path, method = 'GET', body) {
  const token = getToken();
  const response = await fetch(`${api}${path}`, {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  return response.json();
}

window.skinRejuveApi = { getToken, setToken, request };
