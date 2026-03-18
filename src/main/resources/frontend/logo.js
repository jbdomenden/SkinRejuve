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
            <path d="M56 150 C59 300, 5 250 , 320 320" fill="none" stroke="#0EA95B" stroke-width="8" stroke-linecap="round"></path>
            <path d="M58 25 C98 30, 120 95, 58 188 C20 161, 1 120, 50 22 C51 37, 70 2" fill="#129E57"></path>
            <path d="M59 24 C67 58, 68 106, 54 174" fill="none" stroke="#F5EAD9" stroke-width="5" stroke-linecap="round" stroke-opacity=".25"></path>
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
