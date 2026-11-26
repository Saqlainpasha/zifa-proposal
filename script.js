
/* ═══════════════════════════════════════════════
   Zifa's Proposal — script.js
   Stable iPhone + desktop version
   ═══════════════════════════════════════════════ */

'use strict';

const $ = (id) => document.getElementById(id);

document.addEventListener('DOMContentLoaded', () => {

  /* ── Elements ── */
  const gate = $('gate');
  const openBtn = $('openBtn');
  const envelope = $('envelope');
  const mainContent = $('mainContent');
  const muteBtn = $('muteBtn');
  const progressBar = $('progressBar');
  const lilyEgg = $('lilyEgg');
  const questionSec = $('question');
  const yesBtn = $('yesBtn');
  const noBtn = $('noBtn');
  const noMessage = $('noMessage');
  const yesScreen = $('yesScreen');
  const replayBtn = $('replayBtn');
  const officialDate = $('officialDate');

  /* ── Music ── */
  const music = new Audio('assets/music.mp3');
  music.loop = true;
  music.volume = 0;

  const MUSIC_FULL = 0.5;
  let musicMuted = false;
  let musicStarted = false;

  function fadeMusic(target, duration = 2000) {
    const start = music.volume;
    const steps = 30;
    let i = 0;

    clearInterval(fadeMusic.timer);

    fadeMusic.timer = setInterval(() => {
      i++;
      music.volume = Math.max(0, Math.min(1,
        start + (target - start) * (i / steps)
      ));

      if (i >= steps) {
        music.volume = target;
        clearInterval(fadeMusic.timer);
      }
    }, duration / steps);
  }

  /* ══════════ OPEN WEBSITE ══════════ */

  let siteOpened = false;

  function openSite(e) {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    if (siteOpened) return;
    siteOpened = true;

    if (gate) {
      gate.classList.add('opened');
    }

    if (mainContent) {
      mainContent.hidden = false;
      mainContent.style.display = 'block';
    }

    if (muteBtn) {
      muteBtn.hidden = false;
    }

    music.play().then(() => {
      musicStarted = true;
      fadeMusic(musicMuted ? 0 : MUSIC_FULL, 2000);
    }).catch((err) => {
      console.log('Music playback issue:', err);
    });

    setTimeout(() => {
      if (gate) gate.remove();
    }, 900);
  }

  if (openBtn) {
    openBtn.addEventListener('click', openSite);
    openBtn.addEventListener('touchend', openSite, { passive: false });
  }

  if (envelope) {
    envelope.addEventListener('click', openSite);

    envelope.addEventListener('touchend', openSite, {
      passive: false
    });

    envelope.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        openSite(e);
      }
    });
  }

  /* ── Mute button ── */
  if (muteBtn) {
    muteBtn.addEventListener('click', () => {
      musicMuted = !musicMuted;
      fadeMusic(musicMuted ? 0 : MUSIC_FULL, 400);

      muteBtn.textContent = musicMuted ? '🔇' : '🎵';
      muteBtn.classList.toggle('muted', musicMuted);
    });
  }

  /* ══════════ VIDEO CONTROLS ══════════ */

  function setupVideo(videoId, buttonId) {
    const video = $(videoId);
    const button = $(buttonId);

    if (!video || !button) return;

    button.addEventListener('click', () => {
      if (video.paused) {
        video.play().catch(() => {});
      } else {
        video.pause();
      }
    });

    video.addEventListener('play', () => {
      button.classList.add('hidden');
      if (musicStarted && !musicMuted) fadeMusic(0.1, 600);
    });

    function restoreMusic() {
      button.classList.remove('hidden');
      if (musicStarted && !musicMuted) {
        fadeMusic(MUSIC_FULL, 600);
      }
    }

    video.addEventListener('pause', restoreMusic);
    video.addEventListener('ended', restoreMusic);
  }

  setupVideo('sunscreenVideo', 'sunscreenPlay');
  setupVideo('memoriesVideo', 'memoriesPlay');

  /* ══════════ SCROLL PROGRESS ══════════ */

  if (progressBar) {
    window.addEventListener('scroll', () => {
      const h = document.documentElement;
      const max = h.scrollHeight - h.clientHeight;

      progressBar.style.width =
        (max > 0 ? h.scrollTop / max * 100 : 0) + '%';
    }, { passive: true });
  }

  /* ══════════ SCROLL REVEAL ══════════ */

  if ('IntersectionObserver' in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          revealObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.15 });

    document.querySelectorAll('.reveal').forEach((el) => {
      revealObserver.observe(el);
    });

    if (questionSec) {
      new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
          document.body.classList.toggle(
            'question-active',
            entry.isIntersecting
          );
        });
      }, { threshold: 0.4 }).observe(questionSec);
    }
  } else {
    document.querySelectorAll('.reveal').forEach((el) => {
      el.classList.add('visible');
    });
  }

  /* ══════════ LILY EASTER EGG ══════════ */

  if (lilyEgg) {
    let eggTaps = 0;
    let eggTimer;

    lilyEgg.addEventListener('click', () => {
      eggTaps++;
      clearTimeout(eggTimer);

      eggTimer = setTimeout(() => {
        eggTaps = 0;
      }, 1200);

      if (eggTaps >= 3) {
        eggTaps = 0;

        const toast = document.createElement('div');
        toast.className = 'egg-toast';
        toast.textContent =
          'Tumhara favourite phool, mere favourite insaan ke liye 🌸';

        document.body.appendChild(toast);

        requestAnimationFrame(() => toast.classList.add('show'));

        setTimeout(() => {
          toast.classList.remove('show');
          setTimeout(() => toast.remove(), 600);
        }, 3200);
      }
    });
  }

  /* ══════════ NO BUTTON — DODGE ══════════ */

  const noMessages = [
    'Arre arre, galat button 😜',
    'Zifa, ek baar aur socho...',
    'Ye wala chalta hi nahi 🙈',
    'Dil se bolo na ❤️',
    'Saqlain ro dega 🥺'
  ];

  let noAttempts = 0;
  const MAX_ATTEMPTS = 8;
  const SAFE_MARGIN = 16;
  const BTN_GAP = 24;

  function rectsOverlap(a, b, gap) {
    return !(
      a.right + gap < b.left ||
      b.right + gap < a.left ||
      a.bottom + gap < b.top ||
      b.bottom + gap < a.top
    );
  }

  function dodgeNo() {
    if (!noBtn || !yesBtn) return;

    const btnW = noBtn.offsetWidth;
    const btnH = noBtn.offsetHeight;

    const maxX = window.innerWidth - btnW - SAFE_MARGIN;
    const maxY = window.innerHeight - btnH - SAFE_MARGIN;

    const yesRect = yesBtn.getBoundingClientRect();

    for (let tries = 0; tries < 30; tries++) {
      const x = SAFE_MARGIN +
        Math.random() * Math.max(0, maxX - SAFE_MARGIN);

      const y = SAFE_MARGIN +
        Math.random() * Math.max(0, maxY - SAFE_MARGIN);

      const candidate = {
        left: x,
        top: y,
        right: x + btnW,
        bottom: y + btnH
      };

      if (!rectsOverlap(candidate, yesRect, BTN_GAP)) {
        noBtn.style.position = 'fixed';
        noBtn.style.left = x + 'px';
        noBtn.style.top = y + 'px';
        return;
      }
    }
  }

  function handleNoAttempt(e) {
    if (!noBtn || !yesBtn || noAttempts >= MAX_ATTEMPTS) return;

    e.preventDefault();
    e.stopPropagation();

    noAttempts++;
    noBtn.classList.add('dodging');
    dodgeNo();

    if (noMessage) {
      noMessage.textContent =
        noMessages[(noAttempts - 1) % noMessages.length];
    }

    const noScale = Math.max(0.5, 1 - 0.08 * noAttempts);
    const yesScale = 1 + 0.08 * noAttempts;

    noBtn.style.transform = `scale(${noScale})`;

    const yesCurrentW = yesBtn.offsetWidth;
    const yesMaxW = window.innerWidth * 0.9;

    yesBtn.style.width = Math.min(
      yesCurrentW * (
        yesScale / (1 + 0.08 * (noAttempts - 1))
      ),
      yesMaxW
    ) + 'px';

    yesBtn.style.fontSize =
      Math.min(18 + noAttempts * 1.5, 26) + 'px';

    if (noAttempts >= MAX_ATTEMPTS) {
      noBtn.textContent = 'Okay, YES 😌';
      if (noMessage) {
        noMessage.textContent = 'Maan hi gaye na? ❤️';
      }
    }
  }

  if (noBtn) {
    noBtn.addEventListener('click', (e) => {
      if (noAttempts < MAX_ATTEMPTS) {
        handleNoAttempt(e);
      } else {
        sayYes();
      }
    });

    noBtn.addEventListener('touchstart', handleNoAttempt, {
      passive: false
    });

    noBtn.addEventListener('mouseover', handleNoAttempt);
  }

  /* ══════════ YES BUTTON ══════════ */

  function sayYes() {
    if (navigator.vibrate) navigator.vibrate(200);
    startConfetti();
    showYesScreen();
  }

  if (yesBtn) {
    yesBtn.addEventListener('click', sayYes);
  }

  function fillOfficialDate() {
    if (!officialDate) return;

    const d = new Date();
    const months = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    officialDate.textContent =
      `${d.getDate()} ${months[d.getMonth()]} ${d.getFullYear()}`;
  }

  function showYesScreen() {
    if (!yesScreen) return;

    fillOfficialDate();
    yesScreen.hidden = false;

    fadeMusic(0, 1500);

    requestAnimationFrame(() => {
      yesScreen.classList.add('show');
    });

    document.body.style.overflow = 'hidden';
  }

  if (replayBtn && yesScreen) {
    replayBtn.addEventListener('click', () => {
      stopConfetti();

      yesScreen.classList.remove('show');
      document.body.style.overflow = '';

      setTimeout(() => {
        yesScreen.hidden = true;

        window.scrollTo({
          top: 0,
          behavior: 'smooth'
        });

        if (musicStarted && !musicMuted) {
          fadeMusic(MUSIC_FULL, 1000);
        }
      }, 1000);
    });
  }

  /* ══════════ CONFETTI ══════════ */

  const confettiCanvas = $('confettiCanvas');
  const cctx = confettiCanvas
    ? confettiCanvas.getContext('2d')
    : null;

  let confettiPieces = [];
  let confettiRunning = false;

  const CONFETTI_COLORS = [
    '#F8D7E0', '#E6DDF5', '#DCE8D8',
    '#FFF8F2', '#F8AFC4', '#C9B6F2'
  ];

  const CONFETTI_EMOJI = ['🌸', '❤️'];

  function sizeConfettiCanvas() {
    if (!confettiCanvas) return;
    confettiCanvas.width = window.innerWidth;
    confettiCanvas.height = window.innerHeight;
  }

  function startConfetti() {
    if (!confettiCanvas || !cctx) return;

    sizeConfettiCanvas();
    confettiPieces = [];

    const count = window.innerWidth < 500 ? 90 : 140;

    for (let i = 0; i < count; i++) {
      confettiPieces.push({
        x: Math.random() * confettiCanvas.width,
        y: -20 - Math.random() * confettiCanvas.height * 0.5,
        w: 6 + Math.random() * 8,
        h: 8 + Math.random() * 10,
        vy: 1.2 + Math.random() * 2.2,
        vx: -1 + Math.random() * 2,
        rot: Math.random() * Math.PI * 2,
        vr: -0.05 + Math.random() * 0.1,
        color: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
        emoji: i % 5 === 0,
        glyph: CONFETTI_EMOJI[i % 2]
      });
    }

    if (!confettiRunning) {
      confettiRunning = true;
      requestAnimationFrame(confettiLoop);
    }
  }

  function confettiLoop() {
    if (!cctx || !confettiCanvas) return;

    cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);

    confettiPieces = confettiPieces.filter(
      (p) => p.y < confettiCanvas.height + 30
    );

    confettiPieces.forEach((p) => {
      p.y += p.vy;
      p.x += p.vx + Math.sin(p.y * 0.02);
      p.rot += p.vr;

      cctx.save();
      cctx.translate(p.x, p.y);
      cctx.rotate(p.rot);

      if (p.emoji) {
        cctx.font = '16px serif';
        cctx.fillText(p.glyph, -8, 0);
      } else {
        cctx.fillStyle = p.color;
        cctx.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      }

      cctx.restore();
    });

    if (confettiPieces.length > 0) {
      requestAnimationFrame(confettiLoop);
    } else {
      confettiRunning = false;
      cctx.clearRect(0, 0, confettiCanvas.width, confettiCanvas.height);
    }
  }

  function stopConfetti() {
    confettiPieces = [];
  }

  if (confettiCanvas) {
    sizeConfettiCanvas();
    window.addEventListener('resize', sizeConfettiCanvas);
  }

  /* ══════════ FALLING PETALS ══════════ */

  const petalCanvas = $('petalCanvas');
  const pctx = petalCanvas
    ? petalCanvas.getContext('2d')
    : null;

  const reduceMotion = window.matchMedia
    ? window.matchMedia('(prefers-reduced-motion: reduce)').matches
    : false;

  let petals = [];

  function sizePetalCanvas() {
    if (!petalCanvas) return;
    petalCanvas.width = window.innerWidth;
    petalCanvas.height = window.innerHeight;
  }

  function makePetal(anywhere) {
    return {
      x: Math.random() * petalCanvas.width,
      y: anywhere ? Math.random() * petalCanvas.height : -20,
      s: 10 + Math.random() * 14,
      vy: 0.3 + Math.random() * 0.6,
      sway: Math.random() * Math.PI * 2,
      swaySpeed: 0.005 + Math.random() * 0.01,
      alpha: 0.25 + Math.random() * 0.3
    };
  }

  function petalLoop() {
    if (!petalCanvas || !pctx) return;

    pctx.clearRect(0, 0, petalCanvas.width, petalCanvas.height);

    const maxPetals = window.innerWidth < 500 ? 12 : 20;

    while (petals.length < maxPetals) {
      petals.push(makePetal(false));
    }

    petals.forEach((p) => {
      p.sway += p.swaySpeed * 16;
      p.y += p.vy;
      p.x += Math.sin(p.sway) * 0.4;

      if (p.y > petalCanvas.height + 20) {
        Object.assign(p, makePetal(false));
      }

      pctx.save();
      pctx.translate(p.x, p.y);
      pctx.rotate(p.sway);
      pctx.globalAlpha = p.alpha;

      pctx.fillStyle =
        Math.random() < 0.5 ? '#F8AFC4' : '#C9B6F2';

      pctx.beginPath();
      pctx.ellipse(0, 0, p.s / 2, p.s / 3.2, 0, 0, Math.PI * 2);
      pctx.fill();
      pctx.restore();
    });

    requestAnimationFrame(petalLoop);
  }

  if (petalCanvas) {
    sizePetalCanvas();
    window.addEventListener('resize', sizePetalCanvas);

    if (!reduceMotion) {
      requestAnimationFrame(petalLoop);
    }
  }

  console.log('Zifa website initialized successfully 💌');

});
