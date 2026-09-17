/* =========================================================
   secret-gate.js
   Gate password per secret.html. Nessuna persistenza: ogni volta
   che questa pagina viene aperta o ricaricata, la password va
   reinserita da capo. Include:
   - Rate limiting sui tentativi (stessa logica di easter-egg.js,
     tenuta separata perché questa pagina non carica quel file).
   - Rivelazione del contenuto con effetto "terminale" (digitazione
     progressiva), rispettando prefers-reduced-motion.
   - Un bottone "Chiudi sessione" per tornare al gate senza dover
     ricaricare manualmente.

   PER CAMBIARE LA PASSWORD: aggiorna SECRET_PASSWORD qui sotto
   E la costante omonima in easter-egg.js, così restano allineate.
   ========================================================= */
(function () {
  'use strict';

  var SECRET_PASSWORD = 'brawlcode'; // <-- tieni sincronizzata con easter-egg.js

  var gate = document.getElementById('secretGate');
  var content = document.getElementById('secretContent');
  var form = document.getElementById('secretPageForm');
  var input = document.getElementById('secretPageInput');
  var errorEl = document.getElementById('secretPageError');
  var submitBtn = form ? form.querySelector('button[type="submit"]') : null;
  var logoutBtn = document.getElementById('secretLogout');

  if (input) input.focus();

  /* ---------- Rate limiting sui tentativi ----------
     Dopo RATE_MAX_ATTEMPTS tentativi sbagliati, il form si blocca per
     RATE_LOCK_MS millisecondi, raddoppiando ad ogni nuovo blocco (fino
     a un massimo). Solo in memoria: si azzera ricaricando la pagina. */
  var RATE_MAX_ATTEMPTS = 5;
  var RATE_LOCK_MS = 15000;
  var rateState = { attempts: 0, lockUntil: 0, lockMs: RATE_LOCK_MS, timer: null };

  function rateFormat(ms) {
    return Math.ceil(ms / 1000);
  }

  function rateSetLocked() {
    if (submitBtn) submitBtn.disabled = true;
    if (input) input.disabled = true;
    clearInterval(rateState.timer);
    rateState.timer = setInterval(function () {
      var left = rateState.lockUntil - Date.now();
      if (left <= 0) {
        clearInterval(rateState.timer);
        rateState.attempts = 0;
        if (submitBtn) submitBtn.disabled = false;
        if (input) input.disabled = false;
        if (errorEl) errorEl.textContent = '';
        return;
      }
      if (errorEl) errorEl.textContent = 'Troppi tentativi. Riprova tra ' + rateFormat(left) + 's.';
    }, 250);
  }

  function rateRegisterFailure() {
    rateState.attempts++;
    if (rateState.attempts >= RATE_MAX_ATTEMPTS) {
      rateState.lockUntil = Date.now() + rateState.lockMs;
      rateState.lockMs = Math.min(rateState.lockMs * 2, 120000); // raddoppia, max 2 minuti
      rateSetLocked();
    }
  }

  function rateIsLocked() {
    return Date.now() < rateState.lockUntil;
  }

  /* ---------- Rivelazione con effetto terminale ---------- */
  function revealContent() {
    document.body.classList.add('theme-hacker'); // tema attivo solo su questa pagina, non salvato
    if (gate) gate.hidden = true;
    if (content) content.hidden = false;

    var sourceEl = document.getElementById('secretLogSource');
    var targetEl = document.getElementById('secretLogText');
    var fullText = sourceEl ? sourceEl.content.textContent : '';
    if (!targetEl) return;

    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion || !fullText) {
      targetEl.textContent = fullText;
      return;
    }

    var i = 0;
    var speed = 14; // ms per carattere: più veloce del typing dell'hero, è un blocco di testo lungo
    (function typeNext() {
      if (i <= fullText.length) {
        targetEl.textContent = fullText.slice(0, i);
        i++;
        setTimeout(typeNext, speed);
      }
    })();
  }

  function resetToGate() {
    document.body.classList.remove('theme-hacker');
    if (content) content.hidden = true;
    if (gate) gate.hidden = false;
    if (input) {
      input.value = '';
      input.focus();
    }
    if (errorEl) errorEl.textContent = '';
  }

  if (form) {
    form.addEventListener('submit', function (evt) {
      evt.preventDefault();
      if (rateIsLocked()) return;

      var value = input ? input.value.trim() : '';

      if (value === SECRET_PASSWORD) {
        rateState.attempts = 0;
        revealContent();
      } else {
        rateRegisterFailure();
        if (!rateIsLocked() && errorEl) errorEl.textContent = 'Password errata. Riprova.';
        if (input && !rateIsLocked()) {
          input.value = '';
          input.focus();
        }
      }
    });
  }

  if (logoutBtn) logoutBtn.addEventListener('click', resetToGate);
})();
