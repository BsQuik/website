/* =========================================================
   games.js
   Minigioco 1: Gem Rush (clicker/reazione su Canvas)
   Minigioco 2: Tech & Arena Quiz (trivia con punteggio)
   ========================================================= */
(function () {
  'use strict';

  /* =========================================================
     MINIGIOCO 1 — GEM RUSH
     Canvas: le gemme compaiono in punti casuali e restano
     visibili per un tempo limitato. Un click su una gemma
     assegna un punto. Durata partita: 20 secondi.
     ========================================================= */
  var canvas = document.getElementById('gemCanvas');
  var ctx = canvas ? canvas.getContext('2d') : null;

  var GR_DURATION = 20;       // secondi di gioco
  var GR_SPAWN_MS = 650;      // ogni quanto appare una nuova gemma
  var GR_GEM_LIFETIME = 900;  // quanto resta visibile una gemma (ms)
  var GR_RADIUS = 20;

  var grState = {
    running: false,
    score: 0,
    timeLeft: GR_DURATION,
    gems: [],          // { x, y, bornAt }
    spawnTimer: null,
    countdownTimer: null,
    rafId: null
  };

  var grScoreEl = document.getElementById('grScore');
  var grTimeEl = document.getElementById('grTime');
  var grBestEl = document.getElementById('grBest');
  var grStartBtn = document.getElementById('grStart');
  var grMessageEl = document.getElementById('grMessage');

  var GR_BEST_KEY = 'bsquik_gemrush_best';

  function grLoadBest() {
    var best = Number(localStorage.getItem(GR_BEST_KEY) || 0);
    if (grBestEl) grBestEl.textContent = String(best);
    return best;
  }

  function grSaveBestIfNeeded() {
    var best = grLoadBest();
    if (grState.score > best) {
      localStorage.setItem(GR_BEST_KEY, String(grState.score));
      grLoadBest();
    }
  }

  function grRandomGem() {
    var pad = GR_RADIUS + 6;
    return {
      x: pad + Math.random() * (canvas.width - pad * 2),
      y: pad + Math.random() * (canvas.height - pad * 2),
      bornAt: performance.now()
    };
  }

  function grDraw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    var now = performance.now();
    grState.gems = grState.gems.filter(function (g) {
      return now - g.bornAt < GR_GEM_LIFETIME;
    });

    grState.gems.forEach(function (g) {
      var age = (now - g.bornAt) / GR_GEM_LIFETIME;
      var alpha = 1 - age;

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.fillStyle = '#A8D93A';
      ctx.strokeStyle = '#14111F';
      ctx.lineWidth = 3;
      ctx.beginPath();
      // Rombo stile "gemma" invece di un cerchio generico
      ctx.moveTo(g.x, g.y - GR_RADIUS);
      ctx.lineTo(g.x + GR_RADIUS, g.y);
      ctx.lineTo(g.x, g.y + GR_RADIUS);
      ctx.lineTo(g.x - GR_RADIUS, g.y);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    if (grState.running) {
      grState.rafId = requestAnimationFrame(grDraw);
    }
  }

  function grHandleClick(evt) {
    if (!grState.running || !canvas) return;
    var rect = canvas.getBoundingClientRect();
    var scaleX = canvas.width / rect.width;
    var scaleY = canvas.height / rect.height;
    var clickX = (evt.clientX - rect.left) * scaleX;
    var clickY = (evt.clientY - rect.top) * scaleY;

    for (var i = grState.gems.length - 1; i >= 0; i--) {
      var g = grState.gems[i];
      var dist = Math.hypot(clickX - g.x, clickY - g.y);
      if (dist <= GR_RADIUS) {
        grState.gems.splice(i, 1);
        grState.score++;
        if (grScoreEl) grScoreEl.textContent = String(grState.score);
        break;
      }
    }
  }

  function grStart() {
    if (grState.running) return;
    grState.running = true;
    grState.score = 0;
    grState.timeLeft = GR_DURATION;
    grState.gems = [];

    if (grScoreEl) grScoreEl.textContent = '0';
    if (grTimeEl) grTimeEl.textContent = String(GR_DURATION);
    if (grMessageEl) grMessageEl.textContent = '';
    if (grStartBtn) grStartBtn.disabled = true;

    grState.spawnTimer = setInterval(function () {
      grState.gems.push(grRandomGem());
    }, GR_SPAWN_MS);

    grState.countdownTimer = setInterval(function () {
      grState.timeLeft--;
      if (grTimeEl) grTimeEl.textContent = String(Math.max(grState.timeLeft, 0));
      if (grState.timeLeft <= 0) {
        grStop();
      }
    }, 1000);

    grDraw();
  }

  function grStop() {
    grState.running = false;
    clearInterval(grState.spawnTimer);
    clearInterval(grState.countdownTimer);
    cancelAnimationFrame(grState.rafId);
    grState.gems = [];
    if (ctx) ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (grStartBtn) grStartBtn.disabled = false;
    grSaveBestIfNeeded();
    if (grMessageEl) grMessageEl.textContent = 'Partita finita — punteggio: ' + grState.score;
  }

  if (canvas && ctx) {
    grLoadBest();
    canvas.addEventListener('click', grHandleClick);
    if (grStartBtn) grStartBtn.addEventListener('click', grStart);
  }

  /* =========================================================
     MINIGIOCO 2 — TECH & ARENA QUIZ
     Domande miste su sviluppo web e cultura gaming.
     Per aggiungere domande: aggiungi un oggetto all'array
     QUIZ_QUESTIONS seguendo la stessa struttura.
     ========================================================= */
  var QUIZ_QUESTIONS = [
    {
      q: 'In CSS, quale proprietà controlla lo spazio interno di un elemento?',
      options: ['margin', 'padding', 'gap', 'inset'],
      correct: 1
    },
    {
      q: 'Quale metodo JavaScript converte una stringa JSON in un oggetto?',
      options: ['JSON.stringify()', 'JSON.parse()', 'Object.fromJSON()', 'JSON.toObject()'],
      correct: 1
    },
    {
      q: 'In Minecraft, quale blocco è necessario per craftare un Nether Portal?',
      options: ['Ossidiana', 'Pietra', 'Ferro', 'Quarzo'],
      correct: 0
    },
    {
      q: 'In Brawl Stars, a cosa serve una Star Power rispetto a un Gadget?',
      options: [
        'È un bonus passivo sempre attivo, il Gadget si attiva a comando',
        'Si equipaggiano entrambi solo nelle amichevoli',
        'La Star Power si ricarica come un attacco speciale',
        'Non c\'è differenza, sono lo stesso sistema'
      ],
      correct: 0
    },
    {
      q: 'Cosa fa il comando "git commit"?',
      options: [
        'Scarica le modifiche dal server remoto',
        'Salva uno snapshot delle modifiche nel repository locale',
        'Crea un nuovo branch',
        'Elimina la cronologia del progetto'
      ],
      correct: 1
    },
    {
      q: 'Quale linguaggio gira lato server per generare pagine dinamiche prima di inviarle al browser?',
      options: ['CSS', 'PHP', 'SVG', 'HTML'],
      correct: 1
    },
    {
      q: 'In un\'API REST, quale metodo HTTP si usa tipicamente per leggere una risorsa senza modificarla?',
      options: ['GET', 'DELETE', 'PUT', 'PATCH'],
      correct: 0
    },
    {
      q: 'In Minecraft, quale mob esplode se si avvicina troppo al giocatore?',
      options: ['Zombie', 'Creeper', 'Enderman', 'Skeleton'],
      correct: 1
    },
    {
      q: 'Cosa indica il termine "meta" nel linguaggio dei giocatori competitivi?',
      options: [
        'Un tipo di mappa specifica',
        'Le strategie/personaggi più efficaci nel periodo attuale',
        'Un bug del gioco',
        'La modalità allenamento'
      ],
      correct: 1
    },
    {
      q: 'A cosa serve principalmente cURL in un progetto PHP?',
      options: [
        'Formattare il CSS',
        'Fare richieste HTTP verso altri server/API',
        'Compilare il codice JavaScript',
        'Gestire il database senza query'
      ],
      correct: 1
    }
  ];

  var qzState = {
    index: 0,
    score: 0,
    answered: false
  };

  var qzStartBtn = document.getElementById('qzStart');
  var quizBody = document.getElementById('quizBody');
  var qzIndexEl = document.getElementById('qzIndex');
  var qzScoreEl = document.getElementById('qzScore');

  function qzUpdateStats() {
    if (qzIndexEl) qzIndexEl.textContent = Math.min(qzState.index, QUIZ_QUESTIONS.length) + '/' + QUIZ_QUESTIONS.length;
    if (qzScoreEl) qzScoreEl.textContent = String(qzState.score);
  }

  function qzStart() {
    qzState.index = 0;
    qzState.score = 0;
    qzState.answered = false;
    qzUpdateStats();
    qzRenderQuestion();
  }

  function qzRenderQuestion() {
    if (!quizBody) return;

    if (qzState.index >= QUIZ_QUESTIONS.length) {
      qzRenderResult();
      return;
    }

    var current = QUIZ_QUESTIONS[qzState.index];
    qzState.answered = false;

    var html = '<p class="quiz-question">' + current.q + '</p>';
    html += '<div class="quiz-options">';
    current.options.forEach(function (opt, i) {
      html += '<button type="button" class="quiz-option" data-index="' + i + '">' + opt + '</button>';
    });
    html += '</div>';

    quizBody.innerHTML = html;
    qzUpdateStats();

    quizBody.querySelectorAll('.quiz-option').forEach(function (btn) {
      btn.addEventListener('click', qzHandleAnswer);
    });
  }

  function qzHandleAnswer(evt) {
    if (qzState.answered) return;
    qzState.answered = true;

    var chosenIndex = Number(evt.currentTarget.dataset.index);
    var current = QUIZ_QUESTIONS[qzState.index];
    var buttons = quizBody.querySelectorAll('.quiz-option');

    buttons.forEach(function (btn, i) {
      btn.disabled = true;
      if (i === current.correct) btn.classList.add('is-correct');
      else if (i === chosenIndex) btn.classList.add('is-wrong');
    });

    if (chosenIndex === current.correct) {
      qzState.score++;
      qzUpdateStats();
    }

    setTimeout(function () {
      qzState.index++;
      qzRenderQuestion();
    }, 900);
  }

  function qzRenderResult() {
    if (!quizBody) return;
    quizBody.innerHTML =
      '<div class="quiz-result">' +
      '<p>Quiz completato.</p>' +
      '<span class="quiz-result__score">' + qzState.score + ' / ' + QUIZ_QUESTIONS.length + '</span>' +
      '<p>Premi "Avvia" per rigiocare con le stesse domande.</p>' +
      '</div>';
    if (qzIndexEl) qzIndexEl.textContent = QUIZ_QUESTIONS.length + '/' + QUIZ_QUESTIONS.length;
  }

  if (qzStartBtn) qzStartBtn.addEventListener('click', qzStart);

})();
