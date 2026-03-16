(function () {
  function logoMarkup(options) {
    const subtitle = options.subtitle || '';
    const sizeClass = options.size === 'large' ? 'skin-rejuve-logo--large' : 'skin-rejuve-logo--compact';
    return `
      <span class="skin-rejuve-logo ${sizeClass}" aria-label="SKIN REJUVE logo">
        <span class="logo-word">SKIN REJU</span>
        <span class="v-wrapper" aria-hidden="true">
          <span class="v-letter">V</span>
          <svg class="v-leaf" viewBox="0 0 100 250" role="presentation" focusable="false" aria-hidden="true">
            <path d="M58 10 C98 30, 103 98, 58 188 C20 161, 14 95, 48 22 C51 17, 55 12, 58 10 Z" fill="#129E57"/>
            <path d="M59 24 C67 58, 68 106, 54 174" fill="none" stroke="#F5EAD9" stroke-width="7" stroke-linecap="round" stroke-opacity="0.12"/>
            <path d="M56 184 C59 202, 65 223, 73 244" fill="none" stroke="#0EA95B" stroke-width="7" stroke-linecap="round"/>
          </svg>
        </span>
        <span class="logo-word">E</span>
      </span>
      ${subtitle ? `<p class="logo-subtitle">${subtitle}</p>` : ''}
    `;
  }

  function SkinRejuveLogo(element, options) {
    if (!element) return;
    element.innerHTML = logoMarkup(options || {});
  }

  function mountSkinRejuveLogos() {
    document.querySelectorAll('[data-skin-rejuve-logo]').forEach((node) => {
      SkinRejuveLogo(node, {
        subtitle: node.dataset.logoSubtitle,
        size: node.dataset.logoSize === 'large' ? 'large' : 'compact',
      });
    });
  }

  window.SkinRejuveLogo = SkinRejuveLogo;
  window.mountSkinRejuveLogos = mountSkinRejuveLogos;
})();
