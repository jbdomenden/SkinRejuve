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

  function renderGalleryCards(items) {
    return (items || []).map((item, index) => {
      const hasImage = Boolean(item.imageUrl);
      const media = hasImage
        ? `<img src="${escapeHtml(item.imageUrl)}" alt="${escapeHtml(item.title)}" loading="lazy" />`
        : `<div class="clinic-gallery-placeholder" aria-hidden="true">0${index + 1}</div>`;
      return `
        <a class="clinic-gallery-card" href="${escapeHtml(item.href)}" target="_blank" rel="noreferrer">
          <div class="clinic-gallery-media ${hasImage ? 'has-image' : 'is-placeholder'}">${media}</div>
          <div class="clinic-gallery-copy">
            <span class="showcase-label">Editable media</span>
            <h3>${escapeHtml(item.title)}</h3>
            <p>${escapeHtml(item.description)}</p>
            <strong>${escapeHtml(item.ctaLabel || 'View source')}</strong>
          </div>
        </a>
      `;
    }).join('');
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
    document.getElementById('galleryHeading').textContent = content.galleryHeading || 'Explore Skin Rejuve across its public channels.';
    document.getElementById('galleryDescription').textContent = content.galleryDescription || '';
    document.getElementById('landingGalleryGrid').innerHTML = renderGalleryCards(content.galleryImages);
    document.getElementById('experienceHeading').textContent = content.experienceHeading || '';
    document.getElementById('experiencePoints').innerHTML = renderExperiencePoints(content.experiencePoints);
    document.getElementById('contactHeading').textContent = content.contactHeading || '';
    document.getElementById('contactDescription').textContent = content.contactDescription || '';
    document.getElementById('contactPhoneLabel').textContent = content.contactPhoneLabel || 'Clinic line';
    const phoneLink = document.getElementById('contactPhone');
    phoneLink.textContent = content.contactPhone || '';
    phoneLink.href = `tel:${(content.contactPhone || '').replace(/[^\d+]/g, '')}`;
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
