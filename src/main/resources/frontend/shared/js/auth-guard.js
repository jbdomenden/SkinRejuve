(function () {
  const api = window.skinRejuveApi || {};
  const getToken = api.getToken || (() => '');
  const getUserRole = api.getUserRole || (() => '');
  const setPostLoginRedirect = api.setPostLoginRedirect || (() => {});

  const config = window.skinRejuveAuthGuard;
  if (!config) return;

  const token = getToken();
  const role = getUserRole();
  const currentPath = window.location.pathname || '/frontend/landing/html/index.html';
  const currentWithSearch = `${currentPath}${window.location.search || ''}`;

  if (config.requireAuth && !token) {
    setPostLoginRedirect(currentWithSearch);
    window.location.replace(config.redirectTo || '/frontend/landing/html/index.html?auth=login');
    return;
  }

  if (config.roles && config.roles.length && token && !config.roles.includes(role)) {
    window.location.replace(config.unauthorizedRedirect || '/frontend/dashboard/html/dashboard.html');
    return;
  }

  if (config.guestOnly && token) {
    if (role === 'ADMIN' || role === 'STAFF') {
      window.location.replace(config.authenticatedRedirectAdmin || '/frontend/admin/html/admin-dashboard.html');
      return;
    }
    window.location.replace(config.authenticatedRedirect || '/frontend/dashboard/html/dashboard.html');
  }
})();
