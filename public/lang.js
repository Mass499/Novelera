let translations = {};
let currentLang = "fr";

function setLanguage(lang) {
  fetch(lang + '.json')
    .then(response => response.json())
    .then(data => {
      translations = data;
      currentLang = lang;
      translatePage();
    });
}

function t(key) {
  return translations[key] || key;
}

function translatePage() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    // Si l’élément est un input/textarea/button
    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      el.placeholder = t(el.getAttribute('data-i18n'));
    } else if (el.tagName === 'BUTTON' || el.tagName === 'A') {
      el.innerHTML = t(el.getAttribute('data-i18n'));
    } else {
      el.innerHTML = t(el.getAttribute('data-i18n'));
    }
  });
  // Pour la galerie dynamique, appelle aussi translateGallery si besoin
  if (typeof translateGallery === "function") {
    translateGallery();
  }
}

// Rendre t accessible globalement pour toute la page
window.t = t;

// Initialiser la langue au chargement
document.addEventListener('DOMContentLoaded', () => {
  setLanguage('fr');
});
