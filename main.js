/* =========================================================
   main.js
   Comportamenti generali del sito: nav mobile, effetto
   "typing" nell'hero, footer, contatori YouTube.
   ========================================================= */
(function () {
  'use strict';

  /* ---------- Anno nel footer ---------- */
  var yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------- Nav mobile ---------- */
  var navToggle = document.getElementById('navToggle');
  var navLinks = document.getElementById('navLinks');

  if (navToggle && navLinks) {
    navToggle.addEventListener('click', function () {
      var isOpen = navLinks.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', String(isOpen));
    });

    // Chiude il menu quando si sceglie una voce (utile su mobile)
    navLinks.querySelectorAll('a').forEach(function (link) {
      link.addEventListener('click', function () {
        navLinks.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      });
    });
  }

  /* ---------- Effetto typing nel titolo hero ---------- */
  // Unico "momento animato" orchestrato della pagina: si esegue una sola
  // volta al caricamento, poi il cursore continua a lampeggiare via CSS.
  var heroTyped = document.getElementById('heroTyped');
  var HERO_TEXT = 'Gioco. Registro. Costruisco.';

  function typeHeroTitle() {
    if (!heroTyped) return;

    // Rispetta la preferenza di riduzione del movimento: mostra il testo intero
    var prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) {
      heroTyped.textContent = HERO_TEXT;
      return;
    }

    var i = 0;
    var speed = 42; // ms per carattere

    (function typeNext() {
      if (i <= HERO_TEXT.length) {
        heroTyped.textContent = HERO_TEXT.slice(0, i);
        i++;
        setTimeout(typeNext, speed);
      }
    })();
  }
  typeHeroTitle();

  /* ---------- Contatori YouTube (YouTube Data API) ----------
     In locale/senza backend questa chiamata fallirà silenziosamente
     e il testo di fallback nell'HTML resterà visibile: è previsto.
     Vedi php/youtube_stats.php per il proxy lato server. */
  function loadYouTubeStats() {
    var targets = [
      { id: 'ytSubsBsQuik', channel: 'BsQuik' },
      { id: 'ytSubsPizzaa', channel: 'ttmPizzaa' }
    ];

    targets.forEach(function (t) {
      var el = document.getElementById(t.id);
      if (!el) return;

      fetch('php/youtube_stats.php?channel=' + encodeURIComponent(t.channel))
        .then(function (res) {
          if (!res.ok) throw new Error('Richiesta non riuscita');
          return res.json();
        })
        .then(function (data) {
          if (data && typeof data.subscriberCount !== 'undefined') {
            el.textContent = formatCount(data.subscriberCount) + ' iscritti';
          }
        })
        .catch(function () {
          // Nessuna azione: resta il testo statico già presente nell'HTML.
        });
    });
  }

  function formatCount(n) {
    n = Number(n);
    if (n >= 1000000) return (n / 1000000).toFixed(1).replace('.0', '') + 'M';
    if (n >= 1000) return (n / 1000).toFixed(1).replace('.0', '') + 'k';
    return String(n);
  }

  loadYouTubeStats();

  /* ---------- Popolamento dinamico Tech Stack (opzionale) ----------
     Il markup statico nell'HTML resta come fallback. Se in futuro vuoi
     gestire lo stack da un unico array JS, aggiungi qui gli elementi e
     decommenta renderStackGrid(). */
  var STACK_ITEMS = [
    { glyph: '</>', name: 'HTML / CSS / JS', tag: 'frontend' },
    { glyph: '$php', name: 'PHP', tag: 'backend' },
    { glyph: '↔', name: 'cURL / REST API', tag: 'integrazioni' },
    { glyph: '~$', name: 'Linux', tag: 'sistema' },
    { glyph: '⎇', name: 'Git / GitHub', tag: 'versionamento' },
    { glyph: '▶', name: 'CapCut', tag: 'editing video' },
    { glyph: '✎', name: 'Wacom', tag: 'tavoletta grafica' }
  ];

  function renderStackGrid() {
    var grid = document.getElementById('stackGrid');
    if (!grid) return;
    grid.innerHTML = '';
    STACK_ITEMS.forEach(function (item) {
      var div = document.createElement('div');
      div.className = 'stack-item';
      div.dataset.tag = item.tag;
      div.innerHTML =
        '<span class="stack-item__glyph">' + item.glyph + '</span>' +
        '<span class="stack-item__name">' + item.name + '</span>' +
        '<span class="stack-item__tag">' + item.tag + '</span>';
      grid.appendChild(div);
    });
  }
  // renderStackGrid(); // decommenta se preferisci generare la griglia solo da JS

})();
