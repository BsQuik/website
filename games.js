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
    var finishedLabel = window.t ? window.t('grFinished') : 'Partita finita — punteggio: ';
    if (grMessageEl) grMessageEl.textContent = finishedLabel + grState.score;
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
  // Domande bilingue: stessa struttura per 'it' ed 'en', stesso ordine,
  // stesso indice "correct" — per aggiungere una domanda, aggiungi un
  // oggetto in ENTRAMBI gli array, alla stessa posizione.
  var QUIZ_QUESTIONS_BY_LANG = {
    it: [
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
    ],

    en: [
      {
        q: 'In CSS, which property controls the inner spacing of an element?',
        options: ['margin', 'padding', 'gap', 'inset'],
        correct: 1
      },
      {
        q: 'Which JavaScript method turns a JSON string into an object?',
        options: ['JSON.stringify()', 'JSON.parse()', 'Object.fromJSON()', 'JSON.toObject()'],
        correct: 1
      },
      {
        q: 'In Minecraft, which block is required to craft a Nether Portal?',
        options: ['Obsidian', 'Stone', 'Iron', 'Quartz'],
        correct: 0
      },
      {
        q: 'In Brawl Stars, how does a Star Power differ from a Gadget?',
        options: [
          'It\'s an always-on passive bonus, while a Gadget is activated on command',
          'Both can only be equipped in friendly matches',
          'A Star Power recharges like a special attack',
          'There\'s no difference, they\'re the same system'
        ],
        correct: 0
      },
      {
        q: 'What does the "git commit" command do?',
        options: [
          'Downloads changes from the remote server',
          'Saves a snapshot of changes to the local repository',
          'Creates a new branch',
          'Deletes the project history'
        ],
        correct: 1
      },
      {
        q: 'Which language runs server-side to generate dynamic pages before sending them to the browser?',
        options: ['CSS', 'PHP', 'SVG', 'HTML'],
        correct: 1
      },
      {
        q: 'In a REST API, which HTTP method is typically used to read a resource without changing it?',
        options: ['GET', 'DELETE', 'PUT', 'PATCH'],
        correct: 0
      },
      {
        q: 'In Minecraft, which mob explodes when it gets too close to the player?',
        options: ['Zombie', 'Creeper', 'Enderman', 'Skeleton'],
        correct: 1
      },
      {
        q: 'What does the term "meta" mean in competitive gaming slang?',
        options: [
          'A specific type of map',
          'The most effective strategies/characters in the current period',
          'A game bug',
          'The training mode'
        ],
        correct: 1
      },
      {
        q: 'What is cURL mainly used for in a PHP project?',
        options: [
          'Formatting CSS',
          'Making HTTP requests to other servers/APIs',
          'Compiling JavaScript code',
          'Managing the database without queries'
        ],
        correct: 1
      }
    ]
  };

  function getQuizQuestions() {
    var lang = window.getLang ? window.getLang() : 'it';
    return QUIZ_QUESTIONS_BY_LANG[lang] || QUIZ_QUESTIONS_BY_LANG.it;
  }

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
    var total = getQuizQuestions().length;
    if (qzIndexEl) qzIndexEl.textContent = Math.min(qzState.index, total) + '/' + total;
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

    var questions = getQuizQuestions();
    if (qzState.index >= questions.length) {
      qzRenderResult();
      return;
    }

    var current = questions[qzState.index];
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
    var current = getQuizQuestions()[qzState.index];
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
    var total = getQuizQuestions().length;
    var completedLabel = window.t ? window.t('quizCompleted') : 'Quiz completato.';
    var replayLabel = window.t ? window.t('quizReplay') : 'Premi "Avvia" per rigiocare con le stesse domande.';

    quizBody.innerHTML =
      '<div class="quiz-result">' +
      '<p>' + completedLabel + '</p>' +
      '<span class="quiz-result__score">' + qzState.score + ' / ' + total + '</span>' +
      '<p>' + replayLabel + '</p>' +
      '</div>';
    if (qzIndexEl) qzIndexEl.textContent = total + '/' + total;
  }

  if (qzStartBtn) qzStartBtn.addEventListener('click', qzStart);

  /* =========================================================
     MINIGIOCO 3 — BLOCK MATCH
     Sequenza di blocchi che si allunga di un passo a ogni round
     superato (stile "Simon"). Un click sbagliato termina la partita.
     ========================================================= */
  var bmCells = document.querySelectorAll('#blockMatch .block-match__cell');
  var bmStartBtn = document.getElementById('bmStart');
  var bmScoreEl = document.getElementById('bmScore');
  var bmBestEl = document.getElementById('bmBest');
  var bmMessageEl = document.getElementById('bmMessage');
  var BM_BEST_KEY = 'bsquik_blockmatch_best';
  var BM_FLASH_MS = 500;
  var BM_GAP_MS = 250;

  var bmState = {
    sequence: [],
    playerStep: 0,
    round: 0,
    accepting: false,
    playing: false
  };

  function bmLoadBest() {
    var best = Number(localStorage.getItem(BM_BEST_KEY) || 0);
    if (bmBestEl) bmBestEl.textContent = String(best);
    return best;
  }

  function bmSaveBestIfNeeded() {
    var best = bmLoadBest();
    if (bmState.round > best) {
      localStorage.setItem(BM_BEST_KEY, String(bmState.round));
      bmLoadBest();
    }
  }

  function bmFlashCell(index, duration) {
    return new Promise(function (resolve) {
      var cell = bmCells[index];
      if (!cell) { resolve(); return; }
      cell.classList.add('is-active');
      setTimeout(function () {
        cell.classList.remove('is-active');
        setTimeout(resolve, BM_GAP_MS);
      }, duration || BM_FLASH_MS);
    });
  }

  function bmPlaySequence() {
    bmState.accepting = false;
    bmState.playerStep = 0;
    if (bmMessageEl) bmMessageEl.textContent = window.t ? window.t('bmWatch') : 'Guarda bene...';

    var chain = Promise.resolve();
    bmState.sequence.forEach(function (cellIndex) {
      chain = chain.then(function () { return bmFlashCell(cellIndex); });
    });
    chain.then(function () {
      bmState.accepting = true;
      if (bmMessageEl) bmMessageEl.textContent = window.t ? window.t('bmYourTurn') : 'Tocca a te.';
    });
  }

  function bmNextRound() {
    bmState.round++;
    if (bmScoreEl) bmScoreEl.textContent = String(bmState.round);
    bmState.sequence.push(Math.floor(Math.random() * bmCells.length));
    bmPlaySequence();
  }

  function bmStart() {
    bmState.sequence = [];
    bmState.round = 0;
    bmState.playing = true;
    if (bmScoreEl) bmScoreEl.textContent = '0';
    if (bmStartBtn) bmStartBtn.disabled = true;
    bmNextRound();
  }

  function bmGameOver() {
    bmState.playing = false;
    bmState.accepting = false;
    bmSaveBestIfNeeded();
    if (bmStartBtn) bmStartBtn.disabled = false;
    var finishedLabel = window.t ? window.t('bmFinished') : 'Sequenza sbagliata — punteggio: ';
    if (bmMessageEl) bmMessageEl.textContent = finishedLabel + bmState.round;
  }

  function bmHandleCellClick(evt) {
    if (!bmState.playing || !bmState.accepting) return;
    var clicked = Number(evt.currentTarget.dataset.cell);
    var expected = bmState.sequence[bmState.playerStep];

    if (clicked !== expected) {
      bmGameOver();
      return;
    }

    bmState.playerStep++;
    if (bmState.playerStep === bmState.sequence.length) {
      bmState.accepting = false;
      setTimeout(bmNextRound, 500);
    }
  }

  if (bmCells.length) {
    bmLoadBest();
    bmCells.forEach(function (cell) {
      cell.addEventListener('click', bmHandleCellClick);
    });
    if (bmStartBtn) bmStartBtn.addEventListener('click', bmStart);
  }

  /* =========================================================
     MINIGIOCO BONUS — REFLEX TEST
     Nascosto di default: rivelato da js/easter-egg.js quando si
     scopre l'easter egg del logo. Misura il tempo di reazione tra
     il cambio colore del pad e il click dell'utente.
     ========================================================= */
  var rxPad = document.getElementById('rxPad');
  var rxStartBtn = document.getElementById('rxStart');
  var rxLastEl = document.getElementById('rxLast');
  var rxBestEl = document.getElementById('rxBest');
  var RX_BEST_KEY = 'bsquik_reflex_best';

  var rxState = {
    phase: 'idle', // idle | waiting | ready
    readyAt: 0,
    timer: null
  };

  function rxLoadBest() {
    var best = localStorage.getItem(RX_BEST_KEY);
    if (rxBestEl) rxBestEl.textContent = best ? best + ' ms' : '—';
    return best ? Number(best) : null;
  }

  function rxSaveBestIfNeeded(ms) {
    var best = rxLoadBest();
    if (best === null || ms < best) {
      localStorage.setItem(RX_BEST_KEY, String(ms));
      rxLoadBest();
    }
  }

  function rxSetPhase(phase, text) {
    rxState.phase = phase;
    if (!rxPad) return;
    rxPad.classList.remove('is-waiting', 'is-ready');
    if (phase === 'waiting') rxPad.classList.add('is-waiting');
    if (phase === 'ready') rxPad.classList.add('is-ready');
    rxPad.textContent = text;
  }

  function rxStart() {
    clearTimeout(rxState.timer);
    rxSetPhase('waiting', window.t ? window.t('rxWait') : 'Aspetta...');
    var delay = 1000 + Math.random() * 2500;
    rxState.timer = setTimeout(function () {
      rxState.readyAt = performance.now();
      rxSetPhase('ready', window.t ? window.t('rxReady') : 'Clicca ora!');
    }, delay);
  }

  function rxHandlePadClick() {
    if (rxState.phase === 'waiting') {
      clearTimeout(rxState.timer);
      rxSetPhase('idle', window.t ? window.t('rxEarly') : 'Troppo presto! Riprova.');
      return;
    }
    if (rxState.phase === 'ready') {
      var ms = Math.round(performance.now() - rxState.readyAt);
      if (rxLastEl) rxLastEl.textContent = ms + ' ms';
      rxSaveBestIfNeeded(ms);
      rxSetPhase('idle', window.t ? window.t('rxIdle') : 'Premi "Avvia" per iniziare');
    }
  }

  if (rxPad) {
    rxLoadBest();
    rxPad.addEventListener('click', rxHandlePadClick);
    if (rxStartBtn) rxStartBtn.addEventListener('click', rxStart);
  }

})();
