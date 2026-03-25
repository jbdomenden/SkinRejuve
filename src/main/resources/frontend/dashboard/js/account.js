if (window.mountSkinRejuveLogos) window.mountSkinRejuveLogos();

const api = window.skinRejuveApi;
if (!api) throw new Error('skinRejuveApi is required');

const { request, getToken, decodeTokenPayload } = api;
if (!getToken()) {
  window.location.replace('/frontend/landing/html/index.html?auth=login');
}

const payload = decodeTokenPayload(getToken()) || {};

const state = {
  profile: null,
  isEditingProfile: false,
  memberSince: payload.iat ? new Date(payload.iat * 1000) : new Date(),
};

const identityName = document.getElementById('identityName');
const identityAvatar = document.getElementById('identityAvatar');
const profileView = document.getElementById('profileView');
const profileForm = document.getElementById('profileForm');
const editProfileBtn = document.getElementById('editProfileBtn');
const cancelProfileBtn = document.getElementById('cancelProfileBtn');
const profileStatus = document.getElementById('profileStatus');

const fullNameInput = document.getElementById('fullNameInput');
const usernameInput = document.getElementById('usernameInput');
const emailInput = document.getElementById('emailInput');
const phoneInput = document.getElementById('phoneInput');
const dobInput = document.getElementById('dobInput');
const memberSinceInput = document.getElementById('memberSinceInput');

const passwordForm = document.getElementById('passwordForm');
const passwordStatus = document.getElementById('passwordStatus');
const passwordStrength = document.getElementById('passwordStrength');
const updatePasswordBtn = document.getElementById('updatePasswordBtn');
const cancelPasswordBtn = document.getElementById('cancelPasswordBtn');
const currentPasswordInput = document.getElementById('currentPassword');
const newPasswordInput = document.getElementById('newPassword');
const confirmPasswordInput = document.getElementById('confirmPassword');

const preferencesForm = document.getElementById('preferencesForm');
const preferencesStatus = document.getElementById('preferencesStatus');
const prefEmail = document.getElementById('prefEmail');
const prefSms = document.getElementById('prefSms');
const prefNews = document.getElementById('prefNews');

function formatDateLabel(value) {
  if (!value) return 'Not provided';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return 'Not provided';
  return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
}

function formatIsoDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toISOString().slice(0, 10);
}

function splitName(fullName) {
  const normalized = (fullName || '').trim().replace(/\s+/g, ' ');
  if (!normalized) return { firstName: '', lastName: '' };
  const parts = normalized.split(' ');
  return {
    firstName: parts.shift() || '',
    lastName: parts.join(' ') || '-',
  };
}

function setStatus(target, message = '', stateName = '') {
  target.textContent = message;
  if (stateName) target.dataset.state = stateName;
  else delete target.dataset.state;
}

function renderProfileView() {
  const profile = state.profile || {};
  const fullName = [profile.firstName, profile.lastName].filter(Boolean).join(' ') || payload.fullName || 'Patient';
  const items = [
    { label: 'Full Name', value: fullName },
    { label: 'Username', value: payload.username || payload.preferred_username || payload.email || 'Not available' },
    { label: 'Email Address', value: profile.email || payload.email || 'Not available' },
    { label: 'Phone Number', value: profile.phone || 'Not provided' },
    { label: 'Date of Birth', value: formatDateLabel(profile.dateOfBirth) },
    { label: 'Member Since', value: formatDateLabel(state.memberSince) },
  ];

  profileView.innerHTML = items.map((item) => `
    <article class="profile-item">
      <span class="profile-item__label">${item.label}</span>
      <p class="profile-item__value">${item.value}</p>
    </article>
  `).join('');

  identityName.textContent = fullName;
  identityAvatar.textContent = fullName.charAt(0).toUpperCase() || 'P';

  fullNameInput.value = fullName;
  usernameInput.value = payload.username || payload.preferred_username || payload.email || '';
  emailInput.value = profile.email || payload.email || '';
  phoneInput.value = profile.phone || '';
  dobInput.value = formatIsoDate(profile.dateOfBirth);
  memberSinceInput.value = formatDateLabel(state.memberSince);
}

function setProfileEditMode(enabled) {
  state.isEditingProfile = enabled;
  profileView.hidden = enabled;
  profileForm.hidden = !enabled;
  editProfileBtn.hidden = enabled;
}

function profilePayload() {
  const { firstName, lastName } = splitName(fullNameInput.value);
  return {
    firstName,
    lastName: lastName === '-' ? '' : lastName,
    phone: phoneInput.value.trim(),
    dateOfBirth: dobInput.value || null,
  };
}

function validateProfileForm() {
  const emailValue = emailInput.value.trim();
  if (!fullNameInput.value.trim()) {
    setStatus(profileStatus, 'Full name is required.', 'error');
    return false;
  }
  if (!phoneInput.value.trim()) {
    setStatus(profileStatus, 'Phone number is required.', 'error');
    return false;
  }
  if (!/^\S+@\S+\.\S+$/.test(emailValue)) {
    setStatus(profileStatus, 'A valid email address is required.', 'error');
    return false;
  }
  if (!dobInput.value) {
    setStatus(profileStatus, 'Date of birth is required.', 'error');
    return false;
  }
  return true;
}

function passwordStrengthLabel(value) {
  const hasLength = value.length >= 8;
  const hasUpper = /[A-Z]/.test(value);
  const hasNumber = /\d/.test(value);
  const score = [hasLength, hasUpper, hasNumber].filter(Boolean).length;
  if (!value) return 'Password strength: waiting for input.';
  if (score <= 1) return 'Password strength: weak.';
  if (score === 2) return 'Password strength: moderate.';
  return 'Password strength: strong.';
}

function validatePasswordForm() {
  const currentPassword = currentPasswordInput.value;
  const newPassword = newPasswordInput.value;
  const confirmPassword = confirmPasswordInput.value;

  const hasLength = newPassword.length >= 8;
  const hasUpper = /[A-Z]/.test(newPassword);
  const hasNumber = /\d/.test(newPassword);
  const valid = Boolean(currentPassword)
    && hasLength
    && hasUpper
    && hasNumber
    && newPassword === confirmPassword
    && newPassword !== currentPassword;

  updatePasswordBtn.disabled = !valid;
  passwordStrength.textContent = passwordStrengthLabel(newPassword);
  return valid;
}

function loadPreferences() {
  const raw = localStorage.getItem('skinRejuve.preferences');
  if (!raw) return;
  try {
    const prefs = JSON.parse(raw);
    prefEmail.checked = Boolean(prefs.email);
    prefSms.checked = Boolean(prefs.sms);
    prefNews.checked = Boolean(prefs.news);
  } catch {
    // ignore corrupted preferences
  }
}

async function loadProfile() {
  const response = await request('/api/patient/profile');
  if (response?.success && response.data) {
    state.profile = {
      ...response.data,
      email: payload.email || '',
    };
  } else {
    state.profile = {
      firstName: payload.fullName?.split(' ')[0] || 'Patient',
      lastName: payload.fullName?.split(' ').slice(1).join(' ') || '',
      email: payload.email || '',
      phone: '',
      dateOfBirth: '',
    };
  }
  renderProfileView();
}

editProfileBtn.addEventListener('click', () => {
  setProfileEditMode(true);
  setStatus(profileStatus);
});

cancelProfileBtn.addEventListener('click', () => {
  setProfileEditMode(false);
  renderProfileView();
  setStatus(profileStatus);
});

profileForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!validateProfileForm()) return;

  setStatus(profileStatus, 'Saving profile changes...', 'info');
  const response = await request('/api/patient/profile', 'POST', profilePayload());
  if (!response?.success) {
    setStatus(profileStatus, response?.message || 'Unable to save profile right now.', 'error');
    return;
  }

  state.profile = {
    ...response.data,
    email: emailInput.value.trim(),
  };

  renderProfileView();
  setProfileEditMode(false);
  setStatus(profileStatus, 'Profile updated successfully.', 'success');
});

document.querySelectorAll('.toggle-password').forEach((btn) => {
  btn.addEventListener('click', () => {
    const target = document.getElementById(btn.dataset.target);
    const isPassword = target.type === 'password';
    target.type = isPassword ? 'text' : 'password';
    btn.textContent = isPassword ? 'Hide' : 'Show';
  });
});

[currentPasswordInput, newPasswordInput, confirmPasswordInput].forEach((input) => {
  input.addEventListener('input', () => {
    validatePasswordForm();
    setStatus(passwordStatus);
  });
});

cancelPasswordBtn.addEventListener('click', () => {
  passwordForm.reset();
  passwordStrength.textContent = 'Password strength: waiting for input.';
  updatePasswordBtn.disabled = true;
  setStatus(passwordStatus);
});

passwordForm.addEventListener('submit', async (event) => {
  event.preventDefault();
  if (!validatePasswordForm()) {
    setStatus(passwordStatus, 'Please complete all password fields and meet the password requirements.', 'error');
    return;
  }

  setStatus(passwordStatus, 'Updating password...', 'info');
  const response = await request('/api/auth/change-password', 'POST', {
    currentPassword: currentPasswordInput.value,
    newPassword: newPasswordInput.value,
  });

  if (!response?.success) {
    setStatus(passwordStatus, response?.message || 'Unable to update password at this time.', 'error');
    return;
  }

  passwordForm.reset();
  updatePasswordBtn.disabled = true;
  passwordStrength.textContent = 'Password strength: waiting for input.';
  setStatus(passwordStatus, 'Password updated successfully.', 'success');
});

preferencesForm.addEventListener('submit', (event) => {
  event.preventDefault();
  const prefs = {
    email: prefEmail.checked,
    sms: prefSms.checked,
    news: prefNews.checked,
  };
  localStorage.setItem('skinRejuve.preferences', JSON.stringify(prefs));
  setStatus(preferencesStatus, 'Preferences saved successfully.', 'success');
});

loadProfile();
loadPreferences();
setProfileEditMode(false);
