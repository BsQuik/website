/* =========================================================
   i18n.js
   Gestisce la traduzione IT/EN del sito.
   - applyLanguage(lang) traduce tutti gli elementi [data-i18n]
   - window.t(key) restituisce una stringa dinamica (usata dagli
     altri script per messaggi generati via JS, es. games.js)
   - window.getLang() restituisce la lingua corrente ('it' | 'en')
   La lingua scelta viene salvata in localStorage e riapplicata
   ad ogni visita.
   ========================================================= */
(function () {
  'use strict';

  var LANG_KEY = 'bsquik_lang';

  /* ---------- Testi statici, collegati agli attributi data-i18n ---------- */
  var STATIC = {
    it: {
      'nav.about': 'Chi sono',
      'nav.stack': 'Stack',
      'nav.projects': 'Progetti',
      'nav.games': 'Minigiochi',
      'nav.contact': 'Contatti',

      'hero.eyebrow': 'creator · developer',
      'hero.lead': 'Faccio video su Brawl Stars, Clash Royale e Minecraft — e quando spengo la camera costruisco siti, bot e piccoli strumenti che vivono di API vere.',
      'hero.ctaProjects': 'Guarda i progetti',
      'hero.ctaGames': 'Gioca ora',

      'about.title': 'Chi sono',
      'about.p1': 'Mi chiamo <strong>BsQuik</strong> (in giro anche come <strong>ttm | Pizzaa</strong>). Creo contenuti gaming incentrati sull\'universo Supercell — soprattutto Brawl Stars — e su Minecraft: gameplay, build, sfide e tutto quello che rende un match raccontabile.',
      'about.p2': 'In parallelo studio e costruisco progetti web: dashboard che parlano con API reali, piccole web app, automazioni. Mi interessa il punto dove gaming e codice si incontrano — contatori live, bot per server, strumenti che i creator come me userebbero davvero.',
      'about.cardLabel': 'Focus attuale',
      'about.card1': 'Contenuti Brawl Stars & Minecraft',
      'about.card2': 'Integrazioni API (Supercell, YouTube)',
      'about.card3': 'Web app leggere, senza framework pesanti',

      'stack.title': 'Stack & strumenti',
      'stack.sub': 'Quello che uso davvero, ordinato per come lo uso io — non per hype.',
      'stack.tag.frontend': 'frontend',
      'stack.tag.backend': 'backend',
      'stack.tag.api': 'integrazioni',
      'stack.tag.sistema': 'sistema',
      'stack.tag.workflow': 'versionamento',
      'stack.tag.editing': 'editing video',
      'stack.tag.creative': 'tavoletta grafica',

      'projects.title': 'Progetti',
      'projects.sub': 'Progetti web costruiti attorno a dati veri, non mockup statici.',
      'projects.statusLive': 'live',
      'projects.statusProgress': 'in corso',
      'projects.p1Title': 'Club & Player Tracker',
      'projects.p1Text': 'Web app che interroga l\'API ufficiale Brawl Stars (via proxy PHP per non esporre la chiave) e mostra trofei, brawler e statistiche del club in tempo reale.',
      'projects.p2Title': 'Contatore iscritti dinamico',
      'projects.p2Text': 'Widget che legge le statistiche pubbliche dei canali @BsQuik e @ttm|Pizzaa e aggiorna il contatore sul sito senza ricaricare la pagina.',
      'projects.p3Label': 'Web app',
      'projects.p3Title': 'Questo sito',
      'projects.p3Text': 'Portfolio personale con minigiochi in Canvas/JS puro e un pannello segreto — niente framework, solo HTML, CSS e JavaScript vanilla.',

      'games.title': 'Minigiochi',
      'games.sub': 'Qualche pausa veloce mentre esplori il sito. Punteggi salvati solo in questo browser. Ce n\'è anche uno nascosto, se sai dove cercare.',
      'games.start': 'Avvia',
      'games.gr.desc': 'Colpisci le gemme prima che spariscano. 20 secondi, ogni colpo conta.',
      'games.gr.score': 'Punteggio',
      'games.gr.time': 'Tempo',
      'games.gr.best': 'Record',
      'games.qz.desc': '10 domande tra sviluppo web e mondo gaming. Una risposta giusta vale un punto.',
      'games.qz.question': 'Domanda',
      'games.qz.intro': 'Premi "Avvia" per iniziare il quiz.',
      'games.bm.desc': 'Guarda la sequenza di blocchi e ripetila cliccando nello stesso ordine. Un errore e si riparte da zero.',
      'games.rx.title': 'Bonus: prova di riflessi',
      'games.rx.desc': 'Clicca l\'area appena diventa verde. Misuriamo il tuo tempo di reazione in millisecondi.',
      'games.rx.last': 'Ultimo',
      'games.rx.idle': 'Premi "Avvia" per iniziare',

      'contact.title': 'Trovami altrove',
      'contact.bsquikSub': 'contenuti Brawl Stars',
      'contact.pizzaaSub': 'contenuti Minecraft',
      'contact.githubHandle': 'i miei repo',
      'contact.githubSub': 'codice dei progetti',
      'contact.emailHandle': 'Scrivimi',
      'contact.emailSub': 'collaborazioni & domande',

      'footer.made': 'Fatto a mano, senza framework.',

      'modal.title': 'Accesso riservato',
      'modal.hint': 'Hai trovato il pannello nascosto. Serve una password.',
      'modal.enter': 'Entra'
    },

    en: {
      'nav.about': 'About',
      'nav.stack': 'Stack',
      'nav.projects': 'Projects',
      'nav.games': 'Mini-games',
      'nav.contact': 'Contact',

      'hero.eyebrow': 'creator · developer',
      'hero.lead': 'I make videos about Brawl Stars, Clash Royale and Minecraft — and when the camera\'s off I build sites, bots and small tools that run on real APIs.',
      'hero.ctaProjects': 'See the projects',
      'hero.ctaGames': 'Play now',

      'about.title': 'About me',
      'about.p1': 'I\'m <strong>BsQuik</strong> (also known as <strong>ttm | Pizzaa</strong>). I create gaming content focused on the Supercell universe — mainly Brawl Stars — and on Minecraft: gameplay, builds, challenges, anything worth telling a story about.',
      'about.p2': 'Alongside that I study and build web projects: dashboards talking to real APIs, small web apps, automations. I like the spot where gaming and code meet — live counters, server bots, tools creators like me would actually use.',
      'about.cardLabel': 'Current focus',
      'about.card1': 'Brawl Stars & Minecraft content',
      'about.card2': 'API integrations (Supercell, YouTube)',
      'about.card3': 'Lightweight web apps, no heavy frameworks',

      'stack.title': 'Stack & tools',
      'stack.sub': 'What I actually use, ranked by how much I use it — not by hype.',
      'stack.tag.frontend': 'frontend',
      'stack.tag.backend': 'backend',
      'stack.tag.api': 'integrations',
      'stack.tag.sistema': 'system',
      'stack.tag.workflow': 'versioning',
      'stack.tag.editing': 'video editing',
      'stack.tag.creative': 'graphics tablet',

      'projects.title': 'Projects',
      'projects.sub': 'Web projects built around real data, not static mockups.',
      'projects.statusLive': 'live',
      'projects.statusProgress': 'in progress',
      'projects.p1Title': 'Club & Player Tracker',
      'projects.p1Text': 'A web app that queries the official Brawl Stars API (through a PHP proxy so the key is never exposed) and shows trophies, brawlers and club stats in real time.',
      'projects.p2Title': 'Live subscriber counter',
      'projects.p2Text': 'A widget that reads public stats from the @BsQuik and @ttm|Pizzaa channels and updates the counter on the site without reloading the page.',
      'projects.p3Label': 'Web app',
      'projects.p3Title': 'This website',
      'projects.p3Text': 'Personal portfolio with mini-games in pure Canvas/JS and a secret panel — no frameworks, just vanilla HTML, CSS and JavaScript.',

      'games.title': 'Mini-games',
      'games.sub': 'A few quick breaks while you explore the site. Scores are saved only in this browser. There\'s a hidden one too, if you know where to look.',
      'games.start': 'Start',
      'games.gr.desc': 'Hit the gems before they disappear. 20 seconds, every hit counts.',
      'games.gr.score': 'Score',
      'games.gr.time': 'Time',
      'games.gr.best': 'Best',
      'games.qz.desc': '10 questions mixing web development and gaming culture. One point per correct answer.',
      'games.qz.question': 'Question',
      'games.qz.intro': 'Press "Start" to begin the quiz.',
      'games.bm.desc': 'Watch the block sequence and repeat it by clicking in the same order. One mistake and you start over.',
      'games.rx.title': 'Bonus: reflex test',
      'games.rx.desc': 'Click the area as soon as it turns green. We measure your reaction time in milliseconds.',
      'games.rx.last': 'Last',
      'games.rx.idle': 'Press "Start" to begin',

      'contact.title': 'Find me elsewhere',
      'contact.bsquikSub': 'Brawl Stars content',
      'contact.pizzaaSub': 'Minecraft content',
      'contact.githubHandle': 'my repos',
      'contact.githubSub': 'project source code',
      'contact.emailHandle': 'Get in touch',
      'contact.emailSub': 'collabs & questions',

      'footer.made': 'Handmade, no frameworks.',

      'modal.title': 'Restricted access',
      'modal.hint': 'You found the hidden panel. It needs a password.',
      'modal.enter': 'Enter'
    }
  };

  /* ---------- Testi dinamici, usati dagli altri script via window.t() ---------- */
  var DYNAMIC = {
    it: {
      heroTyped: 'Gioco. Registro. Costruisco.',
      grFinished: 'Partita finita — punteggio: ',
      quizCompleted: 'Quiz completato.',
      quizReplay: 'Premi "Avvia" per rigiocare con le stesse domande.',
      wrongPassword: 'Password errata. Riprova.',
      unlockedBanner: 'Easter egg sbloccato: benvenuto nella modalità Hacker.',
      pageTitle: 'BsQuik — Gaming & Web Dev',
      metaDescription: 'Creatore di contenuti gaming (Brawl Stars, Minecraft) e sviluppatore web. Progetti, API, minigiochi.',
      bmWatch: 'Guarda bene...',
      bmYourTurn: 'Tocca a te.',
      bmFinished: 'Sequenza sbagliata — punteggio: ',
      rxWait: 'Aspetta...',
      rxReady: 'Clicca ora!',
      rxEarly: 'Troppo presto! Riprova.',
      rxIdle: 'Premi "Avvia" per iniziare',
      bonusUnlocked: 'Hai sbloccato un minigioco bonus!',
      minecraftToast: 'Achievement get: Blocco di Diamante 💎',
      brawlToast: 'Super attivata! ⭐',
      ggToast: 'GG! 🏆'
    },
    en: {
      heroTyped: 'I play. I record. I build.',
      grFinished: 'Round over — score: ',
      quizCompleted: 'Quiz completed.',
      quizReplay: 'Press "Start" to replay with the same questions.',
      wrongPassword: 'Wrong password. Try again.',
      unlockedBanner: 'Easter egg unlocked: welcome to Hacker mode.',
      pageTitle: 'BsQuik — Gaming & Web Dev',
      metaDescription: 'Gaming content creator (Brawl Stars, Minecraft) and web developer. Projects, APIs, mini-games.',
      bmWatch: 'Watch closely...',
      bmYourTurn: 'Your turn.',
      bmFinished: 'Wrong sequence — score: ',
      rxWait: 'Wait...',
      rxReady: 'Click now!',
      rxEarly: 'Too early! Try again.',
      rxIdle: 'Press "Start" to begin',
      bonusUnlocked: 'You unlocked a bonus mini-game!',
      minecraftToast: 'Achievement get: Diamond Block 💎',
      brawlToast: 'Super activated! ⭐',
      ggToast: 'GG! 🏆'
    }
  };

  var currentLang = localStorage.getItem(LANG_KEY) || 'it';

  function getLang() {
    return currentLang;
  }

  function t(key) {
    var dict = DYNAMIC[currentLang] || DYNAMIC.it;
    return dict[key] || DYNAMIC.it[key] || '';
  }

  /* Applica le traduzioni statiche a tutti gli elementi [data-i18n].
     Salta gli elementi marcati data-live="1" (es. contatore YouTube già
     popolato con un dato reale dall'API), per non sovrascriverli. */
  function applyStaticTexts(lang) {
    var dict = STATIC[lang] || STATIC.it;
    document.querySelectorAll('[data-i18n]').forEach(function (el) {
      if (el.dataset.live === '1') return;
      var key = el.getAttribute('data-i18n');
      if (dict[key]) el.innerHTML = dict[key];
    });

    // Meta tag e title (SEO): aggiornati anche loro per coerenza
    var titleEl = document.getElementById('pageTitle');
    if (titleEl) titleEl.textContent = (DYNAMIC[lang] || DYNAMIC.it).pageTitle;

    ['metaDescription', 'ogDescription', 'twitterDescription'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.setAttribute('content', (DYNAMIC[lang] || DYNAMIC.it).metaDescription);
    });
    ['ogTitle', 'twitterTitle'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.setAttribute('content', (DYNAMIC[lang] || DYNAMIC.it).pageTitle);
    });
  }

  function updateToggleUI(lang) {
    document.querySelectorAll('[data-lang-label]').forEach(function (el) {
      el.classList.toggle('is-active', el.getAttribute('data-lang-label') === lang);
    });
    var toggle = document.getElementById('langToggle');
    if (toggle) toggle.setAttribute('aria-label', lang === 'it' ? 'Switch to English' : 'Passa all\'italiano');
  }

  function applyLanguage(lang) {
    if (lang !== 'it' && lang !== 'en') lang = 'it';
    currentLang = lang;
    localStorage.setItem(LANG_KEY, lang);
    document.documentElement.lang = lang;
    applyStaticTexts(lang);
    updateToggleUI(lang);

    // Notifica gli altri script (es. per ridisegnare il testo "typing" o il
    // quiz se erano già a schermo) che la lingua è cambiata.
    document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang: lang } }));
  }

  document.addEventListener('DOMContentLoaded', function () {
    applyLanguage(currentLang);

    var langToggle = document.getElementById('langToggle');
    if (langToggle) {
      langToggle.addEventListener('click', function () {
        applyLanguage(currentLang === 'it' ? 'en' : 'it');
      });
    }
  });

  // API esposta agli altri script
  window.getLang = getLang;
  window.t = t;
  window.applyLanguage = applyLanguage;
})();
