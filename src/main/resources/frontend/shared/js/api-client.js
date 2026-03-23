(function () {
  const sameOriginBase = window.location.origin;
  const configuredBase = window.SKINREJUVE_API_BASE || localStorage.getItem('skinrejuve.apiBase') || '';
  const apiBase = (configuredBase || sameOriginBase).replace(/\/$/, '');
  const postLoginRedirectKey = 'skinrejuve.postLoginRedirect';

  function getToken() {
    return localStorage.getItem('token') || sessionStorage.getItem('token') || '';
  }

  function setToken(token, remember = true) {
    const storage = remember ? localStorage : sessionStorage;
    const otherStorage = remember ? sessionStorage : localStorage;

    otherStorage.removeItem('token');
    if (token) {
      storage.setItem('token', token);
    } else {
      storage.removeItem('token');
    }
  }

  function setPostLoginRedirect(path) {
    if (path) sessionStorage.setItem(postLoginRedirectKey, path);
  }

  function consumePostLoginRedirect() {
    const value = sessionStorage.getItem(postLoginRedirectKey) || '';
    sessionStorage.removeItem(postLoginRedirectKey);
    return value;
  }

  function clearPostLoginRedirect() {
    sessionStorage.removeItem(postLoginRedirectKey);
  }

  function parseJsonSafe(text) {
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return null;
    }
  }

  function decodeTokenPayload(token) {
    if (!token || token.split('.').length < 2) return null;
    try {
      const payload = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const normalized = payload.padEnd(Math.ceil(payload.length / 4) * 4, '=');
      return JSON.parse(atob(normalized));
    } catch {
      return null;
    }
  }

  function getUserRole() {
    return decodeTokenPayload(getToken())?.role || '';
  }

  function normalizeBackendPath(pathOrUrl) {
    if (!pathOrUrl) return '';
    try {
      const url = new URL(pathOrUrl, apiBase);
      return `${url.pathname}${url.search}${url.hash}`;
    } catch {
      return pathOrUrl;
    }
  }

  async function request(path, method = 'GET', body) {
    const token = getToken();
    const normalizedPath = normalizeBackendPath(path);
    const response = await fetch(`${apiBase}${normalizedPath}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: body ? JSON.stringify(body) : undefined,
    });

    const text = await response.text();
    const data = parseJsonSafe(text);

    if (response.ok) {
      return data || { success: true };
    }

    return data || { success: false, message: `Request failed with status ${response.status}` };
  }

  window.skinRejuveApi = {
    apiBase,
    getToken,
    setToken,
    request,
    getUserRole,
    decodeTokenPayload,
    setPostLoginRedirect,
    consumePostLoginRedirect,
    clearPostLoginRedirect,
    normalizeBackendPath,
  };
})();
