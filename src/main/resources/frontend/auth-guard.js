(function () {
  const api = window.skinRejuveApi || {};
  const getToken = api.getToken || (() => '');
  const getUserRole = api.getUserRole || (() => '');
  const setPostLoginRedirect = api.setPostLoginRedirect || (() => {});

  const config = window.skinRejuveAuthGuard;
  if (!config) return;

  const token = getToken();
  const role = getUserRole();
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const currentWithSearch = `${currentPath}${window.location.search || ''}`;

  if (config.requireAuth && !token) {
    setPostLoginRedirect(currentWithSearch);
    window.location.replace(config.redirectTo || 'index.html?auth=login');
    return;
  }

  if (config.roles && config.roles.length && token && !config.roles.includes(role)) {
    window.location.replace(config.unauthorizedRedirect || 'dashboard.html');
    return;
  }

  if (config.guestOnly && token) {
    if (role === 'ADMIN' || role === 'STAFF') {
      window.location.replace(config.authenticatedRedirectAdmin || 'admin-dashboard.html');
      return;
    }
    window.location.replace(config.authenticatedRedirect || 'dashboard.html');
  }
})();
