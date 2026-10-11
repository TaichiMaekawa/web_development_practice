// =========================================
// MONGOL800 — script
// =========================================

const isTouch = window.matchMedia('(hover: none)').matches;
const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// ---------- 文字を1文字ずつspanに分割 ----------
document.querySelectorAll('.split').forEach((el) => {
  const text = el.textContent;
  el.textContent = '';
  [...text].forEach((ch, i) => {
    const span = document.createElement('span');
    span.className = 'char';
    span.textContent = ch;
    span.style.transitionDelay = `${0.05 * i + (el.classList.contains('split--accent') ? 0.35 : 0)}s`;
    el.appendChild(span);
  });
});

// ---------- ローディング（0 → 800 カウント） ----------
const loader = document.getElementById('loader');
const loaderNum = document.getElementById('loaderNum');
const loaderBar = document.getElementById('loaderBar');
document.body.classList.add('is-loading');

let loaderFinished = false;
function finishLoader() {
  if (loaderFinished) return;
  loaderFinished = true;
  loaderNum.textContent = 800;
  loaderBar.style.width = '100%';
  setTimeout(() => {
    loader.classList.add('is-done');
    document.body.classList.remove('is-loading');
    document.body.classList.add('is-ready');
    document.querySelectorAll('.hero .reveal-up').forEach((el, i) => {
      el.style.setProperty('--d', `${0.6 + i * 0.15}s`);
      el.classList.add('is-in');
    });
  }, 250);
}

function runLoader() {
  setTimeout(finishLoader, 3000); // rAFが止まる環境用の保険
  const duration = reduceMotion ? 0 : 1600;
  const start = performance.now();
  function tick(now) {
    const t = duration ? Math.min((now - start) / duration, 1) : 1;
    const eased = 1 - Math.pow(1 - t, 3);
    loaderNum.textContent = Math.round(eased * 800);
    loaderBar.style.width = `${eased * 100}%`;
    if (loaderFinished) return;
    if (t < 1) requestAnimationFrame(tick);
    else finishLoader();
  }
  requestAnimationFrame(tick);
}
runLoader();

// ---------- カスタムカーソル ----------
const cursor = document.getElementById('cursor');
const cursorDot = document.getElementById('cursorDot');
let mouseX = window.innerWidth / 2, mouseY = window.innerHeight / 2;
let curX = mouseX, curY = mouseY;

if (!isTouch) {
  window.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
    cursorDot.style.transform = `translate(${mouseX}px, ${mouseY}px) translate(-50%, -50%)`;
  });
  (function followCursor() {
    curX += (mouseX - curX) * 0.15;
    curY += (mouseY - curY) * 0.15;
    cursor.style.transform = `translate(${curX}px, ${curY}px) translate(-50%, -50%)`;
    requestAnimationFrame(followCursor);
  })();
  document.querySelectorAll('a, button, .album').forEach((el) => {
    el.addEventListener('mouseenter', () => cursor.classList.add('is-hover'));
    el.addEventListener('mouseleave', () => cursor.classList.remove('is-hover'));
  });
}

// ---------- ヘッダー / 進捗バー / ナビのアクティブ ----------
const header = document.getElementById('header');
const progress = document.getElementById('progress');
const navLinks = document.querySelectorAll('.nav__link');
const sections = [...navLinks].map((a) => document.querySelector(a.getAttribute('href')));
let lastY = 0;

function onScroll() {
  const y = window.scrollY;
  const max = document.documentElement.scrollHeight - window.innerHeight;
  progress.style.transform = `scaleX(${max > 0 ? y / max : 0})`;

  header.classList.toggle('is-scrolled', y > 50);
  header.classList.toggle('is-hidden', y > lastY && y > 400 && !nav.classList.contains('is-open'));
  lastY = y;

  let current = -1;
  sections.forEach((sec, i) => {
    if (sec && sec.getBoundingClientRect().top < window.innerHeight * 0.4) current = i;
  });
  navLinks.forEach((a, i) => a.classList.toggle('is-active', i === current));

  // パララックス画像
  document.querySelectorAll('.parallax-img').forEach((img) => {
    const rect = img.parentElement.getBoundingClientRect();
    const p = Math.max(-1, Math.min(1, (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight));
    img.style.transform = `translateY(${-8.3 + p * 8.3}%)`;
  });
}
window.addEventListener('scroll', onScroll, { passive: true });

// ---------- ハンバーガーメニュー ----------
const burger = document.getElementById('burger');
const nav = document.getElementById('nav');
burger.addEventListener('click', () => {
  burger.classList.toggle('is-open');
  nav.classList.toggle('is-open');
});
navLinks.forEach((a) => a.addEventListener('click', () => {
  burger.classList.remove('is-open');
  nav.classList.remove('is-open');
}));

// ---------- スクロールで出現 ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.classList.add('is-in');
      io.unobserve(entry.target);
    }
  });
}, { threshold: 0.15, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal-up:not(.hero .reveal-up), .reveal-mask, .reveal-clip').forEach((el) => io.observe(el));

// ---------- 数字カウントアップ ----------
const countIO = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) return;
    const el = entry.target;
    const target = Number(el.dataset.count);
    const from = target > 1000 ? target - 60 : 0;
    const start = performance.now();
    const dur = 1800;
    (function step(now) {
      const t = Math.min((now - start) / dur, 1);
      const eased = 1 - Math.pow(1 - t, 4);
      el.textContent = Math.round(from + (target - from) * eased);
      if (t < 1) requestAnimationFrame(step);
    })(start);
    countIO.unobserve(el);
  });
}, { threshold: 0.6 });
document.querySelectorAll('[data-count]').forEach((el) => countIO.observe(el));

// ---------- 3Dチルト ----------
if (!isTouch) {
  document.querySelectorAll('.tilt').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      const y = (e.clientY - r.top) / r.height;
      el.style.transform = `perspective(900px) rotateX(${(0.5 - y) * 12}deg) rotateY(${(x - 0.5) * 12}deg)`;
      el.style.setProperty('--mx', `${x * 100}%`);
      el.style.setProperty('--my', `${y * 100}%`);
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

// ---------- マグネットボタン ----------
if (!isTouch) {
  document.querySelectorAll('.magnetic').forEach((el) => {
    el.addEventListener('mousemove', (e) => {
      const r = el.getBoundingClientRect();
      const x = e.clientX - r.left - r.width / 2;
      const y = e.clientY - r.top - r.height / 2;
      el.style.transform = `translate(${x * 0.3}px, ${y * 0.4}px)`;
    });
    el.addEventListener('mouseleave', () => { el.style.transform = ''; });
  });
}

// ---------- ハートボタン（旧サイトの機能をパワーアップ） ----------
const heartBtn = document.getElementById('heartBtn');
const heartCount = document.getElementById('heartCount');
let hearts = 0;
try { hearts = Number(localStorage.getItem('m800-hearts')) || 0; } catch (e) {}
heartCount.textContent = hearts;

heartBtn.addEventListener('click', (e) => {
  hearts++;
  heartCount.textContent = hearts;
  try { localStorage.setItem('m800-hearts', hearts); } catch (err) {}
  heartBtn.classList.remove('pop');
  void heartBtn.offsetWidth; // アニメーションをリスタート
  heartBtn.classList.add('pop');

  for (let i = 0; i < 6; i++) {
    const h = document.createElement('span');
    h.className = 'heart-fly';
    h.textContent = '♥';
    h.style.left = `${e.clientX}px`;
    h.style.top = `${e.clientY}px`;
    h.style.setProperty('--x', `${(Math.random() - 0.5) * 160}px`);
    h.style.setProperty('--r', `${(Math.random() - 0.5) * 90}deg`);
    h.style.animationDelay = `${i * 0.05}s`;
    h.style.color = ['#ff3b5c', '#ffc93c', '#1ec8e0'][i % 3];
    document.body.appendChild(h);
    h.addEventListener('animationend', () => h.remove());
  }
});

// ---------- リンクの文字ロール ----------
document.querySelectorAll('.big-link__text').forEach((el) => {
  const text = el.dataset.text;
  el.innerHTML = `<span class="roll">${text}<span class="roll__alt">${text}</span></span>`;
});

// ---------- ディスコグラフィ：ドラッグスクロール ----------
const scroller = document.getElementById('discoScroller');
let isDown = false, startX = 0, startScroll = 0;
scroller.addEventListener('mousedown', (e) => {
  isDown = true;
  startX = e.pageX;
  startScroll = scroller.scrollLeft;
  scroller.classList.add('is-dragging');
});
window.addEventListener('mouseup', () => {
  isDown = false;
  scroller.classList.remove('is-dragging');
});
scroller.addEventListener('mousemove', (e) => {
  if (!isDown) return;
  e.preventDefault();
  scroller.scrollLeft = startScroll - (e.pageX - startX) * 1.5;
});

// ---------- ヒーロー：波のアニメーション ----------
const wavePath = document.getElementById('wavePath');
function drawWave(time) {
  const w = 1440, h = 120, step = 24;
  let d = `M 0 ${h}`;
  for (let x = 0; x <= w; x += step) {
    const y = 60 + Math.sin(x * 0.006 + time * 0.0015) * 16 + Math.sin(x * 0.013 - time * 0.001) * 8;
    d += ` L ${x} ${y.toFixed(1)}`;
  }
  d += ` L ${w} ${h} Z`;
  wavePath.setAttribute('d', d);
  if (!reduceMotion) requestAnimationFrame(drawWave);
}
requestAnimationFrame(drawWave);

// ---------- ヒーロー：きらめく粒子（海のきらめき） ----------
const canvas = document.getElementById('heroCanvas');
const ctx = canvas.getContext('2d');
let particles = [];

function resizeCanvas() {
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = canvas.offsetWidth * dpr;
  canvas.height = canvas.offsetHeight * dpr;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  const count = Math.floor((canvas.offsetWidth * canvas.offsetHeight) / 12000);
  particles = Array.from({ length: count }, () => ({
    x: Math.random() * canvas.offsetWidth,
    y: Math.random() * canvas.offsetHeight,
    r: Math.random() * 1.8 + 0.4,
    vy: -(Math.random() * 0.4 + 0.1),
    vx: (Math.random() - 0.5) * 0.2,
    phase: Math.random() * Math.PI * 2,
    hue: ['30,200,224', '255,201,60', '255,255,255'][Math.floor(Math.random() * 3)],
  }));
}

function drawParticles(time) {
  const w = canvas.offsetWidth, h = canvas.offsetHeight;
  ctx.clearRect(0, 0, w, h);
  // マウスから逃げる
  const rect = canvas.getBoundingClientRect();
  const mx = mouseX - rect.left, my = mouseY - rect.top;
  particles.forEach((p) => {
    const dx = p.x - mx, dy = p.y - my;
    const dist = Math.hypot(dx, dy);
    if (dist < 120 && !isTouch) {
      p.x += (dx / dist) * 2;
      p.y += (dy / dist) * 2;
    }
    p.x += p.vx;
    p.y += p.vy;
    if (p.y < -10) { p.y = h + 10; p.x = Math.random() * w; }
    if (p.x < -10) p.x = w + 10;
    if (p.x > w + 10) p.x = -10;
    const alpha = 0.3 + Math.sin(time * 0.003 + p.phase) * 0.3 + 0.3;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(${p.hue},${alpha})`;
    ctx.fill();
  });
  if (!reduceMotion) requestAnimationFrame(drawParticles);
}

resizeCanvas();
window.addEventListener('resize', resizeCanvas);
requestAnimationFrame(drawParticles);
onScroll();
