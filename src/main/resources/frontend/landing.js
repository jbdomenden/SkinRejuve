if (window.mountSkinRejuveLogos) window.mountSkinRejuveLogos();

(function () {
  const { request } = window.skinRejuveApi;

  function escapeHtml(value) {
    return String(value || '').replace(/[&<>"']/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function renderInfoCards(items) {
    return (items || []).map((item) => `
      <article>
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.description)}</span>
      </article>
    `).join('');
  }

  function renderServiceCards(items) {
    return (items || []).map((item, index) => `
      <article class="service-card">
        <span>${String(index + 1).padStart(2, '0')}</span>
        <h3>${escapeHtml(item.title)}</h3>
        <p>${escapeHtml(item.description)}</p>
      </article>
    `).join('');
  }

  function renderExperiencePoints(items) {
    return (items || []).map((item) => `
      <article>
        <strong>${escapeHtml(item.title)}</strong>
        <p>${escapeHtml(item.description)}</p>
      </article>
    `).join('');
  }

  function renderSocialLinks(items, stacked) {
    return (items || []).map((item) => `
      <a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.label)}</a>
    `).join('');
  }

  function renderFeatureBullets(items) {
    return (items || []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  }

  function applyContent(content) {
    document.getElementById('landingEyebrow').textContent = content.eyebrow || '';
    document.getElementById('landingHeroTitle').textContent = content.heroTitle || '';
    document.getElementById('landingHeroDescription').textContent = content.heroDescription || '';
    document.querySelectorAll('[data-landing-primary-cta]').forEach((node) => { node.textContent = content.primaryCtaLabel || 'Create patient account'; });
    document.querySelectorAll('[data-landing-secondary-cta]').forEach((node) => { node.textContent = content.secondaryCtaLabel || 'Sign in to portal'; });
    document.getElementById('landingProofCards').innerHTML = renderInfoCards(content.proofCards);
    document.getElementById('landingFeatureTitle').textContent = content.featureTitle || '';
    document.getElementById('landingFeatureBullets').innerHTML = renderFeatureBullets(content.featureBullets);
    document.getElementById('landingQuickStatLabel').textContent = content.quickStatLabel || '';
    document.getElementById('landingQuickStatValue').textContent = content.quickStatValue || '';
    document.getElementById('landingQuickStatDescription').textContent = content.quickStatDescription || '';
    document.getElementById('servicesHeading').textContent = content.servicesHeading || '';
    document.getElementById('servicesSubheading').textContent = content.servicesSubheading || '';
    document.getElementById('servicesGrid').innerHTML = renderServiceCards(content.services);
    document.getElementById('experienceHeading').textContent = content.experienceHeading || '';
    document.getElementById('experiencePoints').innerHTML = renderExperiencePoints(content.experiencePoints);
    document.getElementById('contactHeading').textContent = content.contactHeading || '';
    document.getElementById('contactDescription').textContent = content.contactDescription || '';
    document.getElementById('contactPhoneLabel').textContent = content.contactPhoneLabel || 'Clinic line';
    const phoneLink = document.getElementById('contactPhone');
    phoneLink.textContent = content.contactPhone || '';
    phoneLink.href = `tel:${(content.contactPhone || '').replace(/[^\d+]/g, '')}`;
    document.getElementById('landingSocialLinks').innerHTML = renderSocialLinks(content.socialLinks);
    document.getElementById('contactSocialLinks').innerHTML = renderSocialLinks(content.socialLinks);
    document.getElementById('locationHeading').textContent = content.locationHeading || '';
    document.getElementById('locationAddress').textContent = content.address || '';
    document.getElementById('mapFrame').src = content.mapUrl || '';
    document.getElementById('mapDirectionsLink').href = content.directionsUrl || '#';
    document.getElementById('landingUpdatedAtLabel').textContent = content.updatedAtLabel || '';
  }

  (async function loadLandingContent() {
    const response = await request('/api/content/landing');
    if (response?.success && response.data) {
      applyContent(response.data);
    }
  })();
})();
