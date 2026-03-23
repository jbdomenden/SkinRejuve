const { request, setPanelMessage } = window.adminShell;
const tokenPayload = window.skinRejuveApi.decodeTokenPayload(window.skinRejuveApi.getToken()) || {};

const form = document.getElementById('landingContentForm');
const message = document.getElementById('landingEditorMsg');
const profileForm = document.getElementById('adminProfileForm');
const securityForm = document.getElementById('adminSecurityForm');
const profileMessage = document.getElementById('profileSettingsMsg');
const securityMessage = document.getElementById('securitySettingsMsg');
const profileToggle = document.getElementById('toggleProfileEditBtn');
const securityToggle = document.getElementById('toggleSecurityEditBtn');

function serializeCards(value) {
  return value.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
    const [title, ...rest] = line.split('|');
    return { title: (title || '').trim(), description: rest.join('|').trim() };
  }).filter((item) => item.title && item.description);
}

function serializeLinks(value) {
  return value.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
    const [label, ...rest] = line.split('|');
    return { label: (label || '').trim(), url: rest.join('|').trim() };
  }).filter((item) => item.label && item.url);
}

function serializeGalleryItems(value) {
  return value.split('\n').map((line) => line.trim()).filter(Boolean).map((line) => {
    const [title, description = '', imageUrl = '', href = '', ctaLabel = ''] = line.split('|').map((part) => part.trim());
    return { title, description, imageUrl, href, ctaLabel };
  }).filter((item) => item.title && item.description && item.href);
}

function fillTextArea(id, items, keyA, keyB) {
  document.getElementById(id).value = (items || []).map((item) => `${item[keyA]} | ${item[keyB]}`).join('\n');
}

function setValue(id, value) {
  document.getElementById(id).value = value || '';
}

function populateForm(content) {
  [
    'eyebrow', 'heroTitle', 'heroDescription', 'primaryCtaLabel', 'secondaryCtaLabel', 'featureTitle',
    'quickStatLabel', 'quickStatValue', 'quickStatDescription', 'servicesHeading', 'servicesSubheading',
    'galleryHeading', 'galleryDescription', 'experienceHeading', 'contactHeading', 'contactDescription', 'contactPhone', 'contactPhoneLabel',
    'locationHeading', 'address', 'mapUrl', 'directionsUrl', 'updatedAtLabel'
  ].forEach((id) => setValue(id, content[id]));

  document.getElementById('featureBullets').value = (content.featureBullets || []).join('\n');
  fillTextArea('proofCards', content.proofCards, 'title', 'description');
  fillTextArea('services', content.services, 'title', 'description');
  document.getElementById('galleryImages').value = (content.galleryImages || []).map((item) => `${item.title} | ${item.description} | ${item.imageUrl || ''} | ${item.href} | ${item.ctaLabel || ''}`).join('\n');
  fillTextArea('experiencePoints', content.experiencePoints, 'title', 'description');
  fillTextArea('socialLinks', content.socialLinks, 'label', 'url');
}

function collectPayload() {
  return {
    eyebrow: document.getElementById('eyebrow').value.trim(),
    heroTitle: document.getElementById('heroTitle').value.trim(),
    heroDescription: document.getElementById('heroDescription').value.trim(),
    primaryCtaLabel: document.getElementById('primaryCtaLabel').value.trim(),
    secondaryCtaLabel: document.getElementById('secondaryCtaLabel').value.trim(),
    proofCards: serializeCards(document.getElementById('proofCards').value),
    featureTitle: document.getElementById('featureTitle').value.trim(),
    featureBullets: document.getElementById('featureBullets').value.split('\n').map((line) => line.trim()).filter(Boolean),
    quickStatLabel: document.getElementById('quickStatLabel').value.trim(),
    quickStatValue: document.getElementById('quickStatValue').value.trim(),
    quickStatDescription: document.getElementById('quickStatDescription').value.trim(),
    servicesHeading: document.getElementById('servicesHeading').value.trim(),
    servicesSubheading: document.getElementById('servicesSubheading').value.trim(),
    services: serializeCards(document.getElementById('services').value),
    galleryHeading: document.getElementById('galleryHeading').value.trim(),
    galleryDescription: document.getElementById('galleryDescription').value.trim(),
    galleryImages: serializeGalleryItems(document.getElementById('galleryImages').value),
    experienceHeading: document.getElementById('experienceHeading').value.trim(),
    experiencePoints: serializeCards(document.getElementById('experiencePoints').value),
    contactHeading: document.getElementById('contactHeading').value.trim(),
    contactDescription: document.getElementById('contactDescription').value.trim(),
    contactPhone: document.getElementById('contactPhone').value.trim(),
    contactPhoneLabel: document.getElementById('contactPhoneLabel').value.trim(),
    socialLinks: serializeLinks(document.getElementById('socialLinks').value),
    locationHeading: document.getElementById('locationHeading').value.trim(),
    address: document.getElementById('address').value.trim(),
    mapUrl: document.getElementById('mapUrl').value.trim(),
    directionsUrl: document.getElementById('directionsUrl').value.trim(),
    updatedAtLabel: document.getElementById('updatedAtLabel').value.trim(),
  };
}

function getStoredSettings() {
  try {
    return JSON.parse(window.localStorage.getItem('skinrejuveAdminSettings') || '{}');
  } catch (error) {
    return {};
  }
}

function saveStoredSettings(payload) {
  window.localStorage.setItem('skinrejuveAdminSettings', JSON.stringify(payload));
}

function buildProfileDefaults() {
  const stored = getStoredSettings();
  return {
    fullName: stored.fullName || tokenPayload.fullName || tokenPayload.name || 'Juan John Cruz',
    username: stored.username || tokenPayload.sub || tokenPayload.username || 'ADMIN123',
    birthday: stored.birthday || 'March 4, 2026',
    phone: stored.phone || '+63 917 000 1234',
    email: stored.email || tokenPayload.email || 'juanjohncruz@gmail.com',
    memberSince: stored.memberSince || 'January 2024',
  };
}

function populateSettingsProfile() {
  const defaults = buildProfileDefaults();
  setValue('settingsFullName', defaults.fullName);
  setValue('settingsUsername', defaults.username);
  setValue('settingsBirthday', defaults.birthday);
  setValue('settingsPhone', defaults.phone);
  setValue('settingsEmail', defaults.email);
  setValue('settingsMemberSince', defaults.memberSince);
  document.getElementById('settingsProfileName').textContent = defaults.fullName;
  document.getElementById('settingsProfileRole').textContent = `${defaults.username} · Administrator account`;
  document.getElementById('settingsAvatar').textContent = defaults.fullName.trim().charAt(0).toUpperCase() || 'A';
}

function setEditable(formElement, editable) {
  formElement.querySelectorAll('input, textarea').forEach((input) => {
    input.disabled = !editable;
  });
}

function syncToggleLabel(button, editable) {
  button.textContent = editable ? 'LOCK' : 'EDIT';
}

function initSettingsForms() {
  setEditable(profileForm, false);
  setEditable(securityForm, false);
  syncToggleLabel(profileToggle, false);
  syncToggleLabel(securityToggle, false);

  profileToggle.addEventListener('click', () => {
    const editable = profileForm.querySelector('input').disabled;
    setEditable(profileForm, editable);
    syncToggleLabel(profileToggle, editable);
  });

  securityToggle.addEventListener('click', () => {
    const editable = securityForm.querySelector('input').disabled;
    setEditable(securityForm, editable);
    syncToggleLabel(securityToggle, editable);
  });

  profileForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const payload = {
      ...getStoredSettings(),
      fullName: document.getElementById('settingsFullName').value.trim(),
      username: document.getElementById('settingsUsername').value.trim(),
      birthday: document.getElementById('settingsBirthday').value.trim(),
      phone: document.getElementById('settingsPhone').value.trim(),
      email: document.getElementById('settingsEmail').value.trim(),
      memberSince: document.getElementById('settingsMemberSince').value.trim(),
    };
    saveStoredSettings(payload);
    populateSettingsProfile();
    setEditable(profileForm, false);
    syncToggleLabel(profileToggle, false);
    setPanelMessage(profileMessage, 'Administrator profile saved on this device.', 'success');
  });

  securityForm.addEventListener('submit', (event) => {
    event.preventDefault();
    const newPassword = document.getElementById('settingsNewPassword').value.trim();
    const confirmPassword = document.getElementById('settingsConfirmPassword').value.trim();

    if (!newPassword || newPassword.length < 8) {
      setPanelMessage(securityMessage, 'New password must be at least 8 characters.', 'error');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPanelMessage(securityMessage, 'New password and confirmation must match.', 'error');
      return;
    }

    const payload = {
      ...getStoredSettings(),
      currentPasswordMask: 'Updated just now',
    };
    saveStoredSettings(payload);
    securityForm.reset();
    setEditable(securityForm, false);
    syncToggleLabel(securityToggle, false);
    setPanelMessage(securityMessage, 'Security details updated locally for the admin workspace.', 'success');
  });
}

(async function init() {
  populateSettingsProfile();
  initSettingsForms();

  const response = await request('/api/admin/landing-content');
  if (response?.success && response.data) {
    populateForm(response.data);
  } else {
    setPanelMessage(message, response?.message || 'Unable to load landing content.', 'error');
  }
})();

form.addEventListener('submit', async (event) => {
  event.preventDefault();
  setPanelMessage(message, 'Saving landing content...', 'info');
  const response = await request('/api/admin/landing-content', 'PUT', collectPayload());
  setPanelMessage(message, response?.message || (response?.success ? 'Landing page updated.' : 'Unable to update landing page.'), response?.success ? 'success' : 'error');
  if (response?.success && response.data) {
    populateForm(response.data);
  }
});
