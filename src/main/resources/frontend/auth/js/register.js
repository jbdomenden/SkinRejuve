if (window.mountSkinRejuveLogos) window.mountSkinRejuveLogos();

const api = window.skinRejuveApi;
if (!api) throw new Error('skinRejuveApi is required');

const { request } = api;
const registerForm = document.getElementById('registerForm');
const registerMsg = document.getElementById('registerMsg');
const stepIndicator = document.getElementById('stepIndicator');
const steps = [...document.querySelectorAll('[data-step]')];

let currentStep = 1;

function setStep(step) {
  currentStep = step;
  steps.forEach((panel) => {
    panel.hidden = Number(panel.dataset.step) !== step;
  });
  stepIndicator.textContent = `Step ${step} of 3 · ${step === 1 ? 'Account details' : step === 2 ? 'Skin and medical history' : 'Data privacy consent'}`;
}

function validateStepOne(form) {
  const data = new FormData(form);
  const username = (data.get('username') || '').toString().trim();
  const password = (data.get('password') || '').toString();
  const confirmPassword = (data.get('confirmPassword') || '').toString();
  const email = (data.get('email') || '').toString().trim();

  if (username.length < 6) {
    registerMsg.textContent = 'Username must be at least 6 characters.';
    registerMsg.dataset.state = 'error';
    return false;
  }
  if (!/^\S+@\S+\.\S+$/.test(email)) {
    registerMsg.textContent = 'Please provide a valid email address.';
    registerMsg.dataset.state = 'error';
    return false;
  }
  if (password.length < 8) {
    registerMsg.textContent = 'Password must be at least 8 characters.';
    registerMsg.dataset.state = 'error';
    return false;
  }
  if (password !== confirmPassword) {
    registerMsg.textContent = 'Password and confirm password must match.';
    registerMsg.dataset.state = 'error';
    return false;
  }

  registerMsg.textContent = '';
  return true;
}

function validateStepTwo(form) {
  const data = new FormData(form);
  const skinType = data.get('skinType');
  const hasAllergies = data.get('hasAllergies');
  const allergyText = (data.get('allergies') || '').toString().trim();

  if (!skinType) {
    registerMsg.textContent = 'Please select your skin type.';
    registerMsg.dataset.state = 'error';
    return false;
  }
  if (!hasAllergies) {
    registerMsg.textContent = 'Please choose whether you have allergies.';
    registerMsg.dataset.state = 'error';
    return false;
  }
  if (hasAllergies === 'yes' && allergyText.length < 2) {
    registerMsg.textContent = 'Please specify your allergies so we can prepare your consultation safely.';
    registerMsg.dataset.state = 'error';
    return false;
  }

  registerMsg.textContent = '';
  return true;
}

function toggleAllergyField() {
  const hasAllergies = document.querySelector('input[name="hasAllergies"]:checked')?.value;
  const wrap = document.getElementById('allergyDetailWrap');
  const field = document.getElementById('allergies');
  const show = hasAllergies === 'yes';
  wrap.hidden = !show;
  field.required = show;
  if (!show) field.value = '';
}

document.querySelectorAll('input[name="hasAllergies"]').forEach((radio) => {
  radio.addEventListener('change', toggleAllergyField);
});

const privacyConsent = document.getElementById('privacyConsent');
const submitRegistrationBtn = document.getElementById('submitRegistrationBtn');
privacyConsent.addEventListener('change', () => {
  submitRegistrationBtn.disabled = !privacyConsent.checked;
});

registerForm.querySelectorAll('[data-action="next"]').forEach((button) => {
  button.addEventListener('click', () => {
    if (currentStep === 1 && !validateStepOne(registerForm)) return;
    if (currentStep === 2 && !validateStepTwo(registerForm)) return;
    setStep(Math.min(3, currentStep + 1));
  });
});

registerForm.querySelectorAll('[data-action="back"]').forEach((button) => {
  button.addEventListener('click', () => {
    setStep(Math.max(1, currentStep - 1));
  });
});

registerForm.addEventListener('submit', async (event) => {
  event.preventDefault();

  if (!privacyConsent.checked) {
    registerMsg.textContent = 'You must agree to the Data Privacy Policy to continue registration.';
    registerMsg.dataset.state = 'error';
    return;
  }

  const data = new FormData(registerForm);
  const payload = {
    email: (data.get('email') || '').toString().trim(),
    password: (data.get('password') || '').toString(),
  };

  registerMsg.textContent = 'Creating your account...';
  registerMsg.dataset.state = 'info';

  const response = await request('/api/auth/register', 'POST', payload);
  if (!response?.success) {
    registerMsg.textContent = response?.message || 'Registration could not be completed at this time.';
    registerMsg.dataset.state = 'error';
    return;
  }

  const intakeProfile = {
    fullName: data.get('fullName'),
    username: data.get('username'),
    email: data.get('email'),
    phoneNumber: data.get('phoneNumber'),
    dateOfBirth: data.get('dateOfBirth'),
    skinType: data.get('skinType'),
    hasAllergies: data.get('hasAllergies'),
    allergies: data.get('allergies'),
    medicalConditions: data.get('medicalConditions'),
    pastTreatments: data.get('pastTreatments'),
    consentedAt: new Date().toISOString(),
  };
  localStorage.setItem('skinRejuve.registrationDraft', JSON.stringify(intakeProfile));

  registerMsg.textContent = 'Registration complete. Please sign in to continue your patient onboarding.';
  registerMsg.dataset.state = 'success';

  window.setTimeout(() => {
    window.location.href = '/frontend/auth/html/login.html';
  }, 1100);
});

setStep(1);
