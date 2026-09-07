/* =========================================================
   easter-egg.js
   Pannello segreto protetto da password.
   Si attiva con il bottone discreto nel footer OPPURE con il
   Konami Code (↑ ↑ ↓ ↓ ← → ← → B A).
   Password corretta -> sblocca il tema "Dark Retro / Hacker".

   PER CAMBIARE LA PASSWORD: modifica la costante SECRET_PASSWORD
   qui sotto. Il confronto avviene solo lato client: per un vero
   contenuto riservato la verifica andrebbe fatta lato server.
   ========================================================= */
(function () {
  'use strict';

  var SECRET_PASSWORD = 'Quik';     // <-- personalizza qui la password
  var UNLOCK_KEY = 'bsquik_secret_unlocked';

  var modal = document.getElementById('secretModal');
  var form = document.getElementById('secretForm');
  var input = document.getElementById('secretInput');
  var errorEl = document.getElementById('secretError');
  var closeBtn = document.getElementById('secretClose');
  var triggerBtn = document.getElementById('secretTrigger');

  function openModal() {
    if (!modal) return;
    modal.hidden = false;
    if (errorEl) errorEl.textContent = '';
    if (input) {
      input.value = '';
      input.focus();
    }
  }

  function closeModal() {
    if (!modal) return;
    modal.hidden = true;
  }

  function unlockEasterEgg() {
    document.body.classList.add('theme-hacker');
    localStorage.setItem(UNLOCK_KEY, '1');
    closeModal();
    showUnlockMessage();
  }

  function showUnlockMessage() {
    // Messaggio custom mostrato dopo lo sblocco: un piccolo banner temporaneo,
    // niente alert() invasivi.
    var banner = document.createElement('div');
    banner.textContent = 'Easter egg sbloccato: benvenuto nella modalità Hacker.';
    banner.style.position = 'fixed';
    banner.style.bottom = '20px';
    banner.style.left = '50%';
    banner.style.transform = 'translateX(-50%)';
    banner.style.background = '#071a08';
    banner.style.color = '#33ff66';
    banner.style.border = '1px solid #33ff66';
    banner.style.padding = '10px 18px';
    banner.style.borderRadius = '6px';
    banner.style.fontFamily = "'IBM Plex Mono', monospace";
    banner.style.fontSize = '0.85rem';
    banner.style.zIndex = '200';
    document.body.appendChild(banner);

    setTimeout(function () {
      banner.remove();
    }, 3200);
  }

  /* ---------- Apertura tramite bottone discreto ---------- */
  if (triggerBtn) triggerBtn.addEventListener('click', openModal);
  if (closeBtn) closeBtn.addEventListener('click', closeModal);

  // Chiude cliccando fuori dal box o con Esc
  if (modal) {
    modal.addEventListener('click', function (evt) {
      if (evt.target === modal) closeModal();
    });
  }
  document.addEventListener('keydown', function (evt) {
    if (evt.key === 'Escape' && modal && !modal.hidden) closeModal();
  });

  /* ---------- Validazione password ---------- */
  if (form) {
    form.addEventListener('submit', function (evt) {
      evt.preventDefault();
      var value = input ? input.value.trim() : '';

      if (value === SECRET_PASSWORD) {
        unlockEasterEgg();
      } else {
        if (errorEl) errorEl.textContent = 'Password errata. Riprova.';
        if (input) {
          input.value = '';
          input.focus();
        }
      }
    });
  }

  /* ---------- Konami Code ----------
     ↑ ↑ ↓ ↓ ← → ← → B A apre direttamente il pannello. */
  var KONAMI_SEQUENCE = [
    'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
    'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
    'b', 'a'
  ];
  var konamiProgress = 0;

  document.addEventListener('keydown', function (evt) {
    var key = evt.key.length === 1 ? evt.key.toLowerCase() : evt.key;
    var expected = KONAMI_SEQUENCE[konamiProgress];

    if (key === expected) {
      konamiProgress++;
      if (konamiProgress === KONAMI_SEQUENCE.length) {
        konamiProgress = 0;
        openModal();
      }
    } else {
      // Ricomincia, ma controlla subito se il tasto corrente è il primo della sequenza
      konamiProgress = (key === KONAMI_SEQUENCE[0]) ? 1 : 0;
    }
  });

  /* ---------- Persistenza dello sblocco tra visite ---------- */
  /*if (localStorage.getItem(UNLOCK_KEY) === '1') {
    document.body.classList.add('theme-hacker');
  }*/

})();
