/* =========================================================
   easter-egg.js
   Pannello segreto protetto da password + easter egg minori
   sparsi nel sito. In totale:

   1. Bottone discreto nel footer OPPURE Konami Code
      (↑ ↑ ↓ ↓ ← → ← → B A) -> apre il modal password.
      Password corretta -> sblocca il tema "Dark Retro/Hacker".

   2. 5 click veloci sul logo "BsQuik." in nav -> sblocca il
      minigioco bonus nascosto (Reflex Test) nella sezione
      Minigiochi, senza bisogno di password.

   3. Parole segrete digitate in un punto qualsiasi della pagina
      (fuori da campi di testo) -> piccoli effetti a schermo:
      "minecraft", "brawl", "gg". Vedi SECRET_WORDS più sotto per
      aggiungerne altre.

   PER CAMBIARE LA PASSWORD: modifica SECRET_PASSWORD qui sotto.
   Il confronto avviene solo lato client: per un vero contenuto
   riservato la verifica andrebbe fatta lato server.
   ========================================================= */
(function () {
  'use strict';

  /* =========================================================
     UTILITY CONDIVISE: toast + piccole animazioni a schermo
     ========================================================= */
  function showToast(text) {
    var toast = document.createElement('div');
    toast.className = 'eg-toast';
    toast.textContent = text;
    document.body.appendChild(toast);
    setTimeout(function () { toast.remove(); }, 3200);
  }

  function getOverlay() {
    var overlay = document.getElementById('egOverlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'egOverlay';
      overlay.className = 'eg-overlay';
      document.body.appendChild(overlay);
    }
    return overlay;
  }

  // Pioggia di piccoli blocchi (richiamo a Minecraft)
  function spawnBlockRain() {
    var overlay = getOverlay();
    var colors = ['#A8D93A', '#8B5A2B', '#6B6B6B', '#4FD8E0'];
    for (var i = 0; i < 18; i++) {
      (function () {
        var block = document.createElement('div');
        block.className = 'eg-block';
        block.style.left = Math.random() * 100 + 'vw';
        block.style.background = colors[Math.floor(Math.random() * colors.length)];
        var duration = 1.6 + Math.random() * 1.2;
        block.style.animationDuration = duration + 's';
        block.style.animationDelay = (Math.random() * 0.6) + 's';
        overlay.appendChild(block);
        setTimeout(function () { block.remove(); }, (duration + 1) * 1000);
      })();
    }
  }

  // Coriandoli colorati (richiamo a Brawl Stars: una "Super" attivata)
  function spawnConfetti() {
    var overlay = getOverlay();
    var colors = ['#FF5A36', '#A8D93A', '#4FD8E0', '#F5C518', '#EDE9F5'];
    for (var i = 0; i < 26; i++) {
      (function () {
        var piece = document.createElement('div');
        piece.className = 'eg-confetti';
        piece.style.left = Math.random() * 100 + 'vw';
        piece.style.background = colors[Math.floor(Math.random() * colors.length)];
        var duration = 1.1 + Math.random() * 1;
        piece.style.animationDuration = duration + 's';
        piece.style.animationDelay = (Math.random() * 0.4) + 's';
        overlay.appendChild(piece);
        setTimeout(function () { piece.remove(); }, (duration + 1) * 1000);
      })();
    }
  }

  /* =========================================================
     1) PANNELLO SEGRETO PRINCIPALE (password -> tema Hacker)
     ========================================================= */
  var SECRET_PASSWORD = 'brawlcode';     // <-- personalizza qui la password
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
    showToast(window.t ? window.t('unlockedBanner') : 'Easter egg sbloccato: benvenuto nella modalità Hacker.');
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
        if (errorEl) errorEl.textContent = window.t ? window.t('wrongPassword') : 'Password errata. Riprova.';
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
  if (localStorage.getItem(UNLOCK_KEY) === '1') {
    document.body.classList.add('theme-hacker');
  }

  /* =========================================================
     2) EASTER EGG DEL LOGO -> sblocca il minigioco bonus
     5 click sul logo entro 2.5 secondi rivelano il pannello
     "Bonus: prova di riflessi" nella sezione Minigiochi.
     ========================================================= */
  var LOGO_UNLOCK_KEY = 'bsquik_bonus_unlocked';
  var LOGO_CLICKS_NEEDED = 5;
  var LOGO_CLICK_WINDOW_MS = 2500;

  var logoEl = document.querySelector('.nav__brand');
  var bonusPanel = document.getElementById('bonusGamePanel');
  var logoClicks = [];

  function revealBonusGame(silent) {
    if (!bonusPanel || !bonusPanel.hidden) return;
    bonusPanel.hidden = false;
    localStorage.setItem(LOGO_UNLOCK_KEY, '1');
    if (!silent) {
      showToast(window.t ? window.t('bonusUnlocked') : 'Hai sbloccato un minigioco bonus!');
      bonusPanel.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }

  if (logoEl) {
    logoEl.style.cursor = 'pointer';
    logoEl.addEventListener('click', function (evt) {
      var now = Date.now();
      logoClicks.push(now);
      logoClicks = logoClicks.filter(function (t) { return now - t <= LOGO_CLICK_WINDOW_MS; });

      if (logoClicks.length >= LOGO_CLICKS_NEEDED) {
        logoClicks = [];
        if (bonusPanel && bonusPanel.hidden) {
          evt.preventDefault(); // evita di saltare a #home mentre si "festeggia"
          revealBonusGame(false);
        }
      }
    });
  }

  // Se già sbloccato in una visita precedente, mostra subito il pannello
  /*if (bonusPanel && localStorage.getItem(LOGO_UNLOCK_KEY) === '1') {
    revealBonusGame(true);
  }*/

  /* =========================================================
     3) PAROLE SEGRETE DIGITATE SULLA PAGINA
     Digitando una di queste parole (senza premere invio, basta
     scriverla) in un punto qualsiasi del sito si attiva un
     piccolo effetto a schermo. Non serve essere nel modal.
     Per aggiungerne una nuova: aggiungi una voce a SECRET_WORDS
     con la parola e la funzione da eseguire.
     ========================================================= */
  var SECRET_WORDS = [
    { word: 'minecraft', run: function () { spawnBlockRain(); showToast(window.t ? window.t('minecraftToast') : 'Achievement get: Blocco di Diamante 💎'); } },
    { word: 'brawl', run: function () { spawnConfetti(); showToast(window.t ? window.t('brawlToast') : 'Super attivata! ⭐'); } },
    { word: 'gg', run: function () { showToast(window.t ? window.t('ggToast') : 'GG! 🏆'); } },
    { word: 'hi', run: function () { showToast(window.t ? window.t('hiToast') : 'hi! 🏆'); } }
  ];
  var typedBuffer = '';
  var TYPED_BUFFER_MAX = 20;

  function isTypingInField() {
    var el = document.activeElement;
    if (!el) return false;
    var tag = el.tagName ? el.tagName.toLowerCase() : '';
    return tag === 'input' || tag === 'textarea' || el.isContentEditable;
  }

  document.addEventListener('keydown', function (evt) {
    if (isTypingInField()) return;
    if (evt.key.length !== 1) return; // ignora tasti speciali (Shift, Arrow, ecc.)

    typedBuffer = (typedBuffer + evt.key.toLowerCase()).slice(-TYPED_BUFFER_MAX);

    SECRET_WORDS.forEach(function (entry) {
      if (typedBuffer.indexOf(entry.word) !== -1) {
        typedBuffer = '';
        entry.run();
      }
    });
  });

})();
