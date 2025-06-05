  let translations = {};
  let currentLang = "fr";

  function setLanguage(lang) {
    return fetch(lang + '.json')
      .then(response => response.json())
      .then(data => {
        translations = data;
        currentLang = lang;
        translatePage();
        localStorage.setItem('lang', lang);
        // Gérer l'affichage des boutons ici, **après la traduction**
        if (lang === 'fr') {
          document.getElementById('btn-fr').style.display = 'none';
          document.getElementById('btn-en').style.display = 'inline-block';
        } else {
          document.getElementById('btn-en').style.display = 'none';
          document.getElementById('btn-fr').style.display = 'inline-block';
        }
      });
  }

  // Modification pour que switchTo attende la fin de setLanguage
  function switchTo(lang) {
    setLanguage(lang);
  }

  function t(key) {
    return translations[key] || key;
  }

  function translatePage() {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
        el.placeholder = t(el.getAttribute('data-i18n'));
      } else {
        el.innerHTML = t(el.getAttribute('data-i18n'));
      }
    });
    if (typeof translateGallery === "function") {
      translateGallery();
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    const savedLang = localStorage.getItem('lang') || 'fr';
    setLanguage(savedLang);
  });

