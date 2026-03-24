const { request, getToken, getUserRole } = window.skinRejuveApi;

if (!getToken()) {
  window.location.replace('/frontend/landing/html/index.html?auth=login');
}

if (getUserRole() !== 'ADMIN' && getUserRole() !== 'STAFF') {
  window.location.replace('/frontend/dashboard/html/dashboard.html');
}

window.adminShell = {
  request,
  renderCurrency(value) {
    return new Intl.NumberFormat('en-PH', { style: 'currency', currency: 'PHP' }).format((value || 0) / 1);
  },
  renderDate(value) {
    return value ? new Date(value).toLocaleString() : '—';
  },
  setPanelMessage(element, message, state = 'info') {
    element.textContent = message;
    element.dataset.state = state;
  },
  renderEmptyState(message) {
    return `<div class="empty-state">${message}</div>`;
  }
};
