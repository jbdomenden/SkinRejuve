const { request, setPanelMessage } = window.adminShell;

const form = document.getElementById('landingContentForm');
const message = document.getElementById('landingEditorMsg');

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
    'experienceHeading', 'contactHeading', 'contactDescription', 'contactPhone', 'contactPhoneLabel',
    'locationHeading', 'address', 'mapUrl', 'directionsUrl', 'updatedAtLabel'
  ].forEach((id) => setValue(id, content[id]));

  document.getElementById('featureBullets').value = (content.featureBullets || []).join('\n');
  fillTextArea('proofCards', content.proofCards, 'title', 'description');
  fillTextArea('services', content.services, 'title', 'description');
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

(async function init() {
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
