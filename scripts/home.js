/* ===== HOMEPAGINA: wisselende uitgelichte stad =====
   De uitgelichte foto toont steden met een foto, maximaal 8 per dag.
   Elke dag schuift de selectie een stad op over een vaste, door elkaar
   gezette volgorde, zodat elke stad even vaak aan bod komt. Is er
   een stad minder dan 8 met foto, dan doen ze allemaal mee en schuift
   alleen de stad waarmee het begint.
   Elke 8 seconden komt de volgende stad in beeld (zacht overvloeien).
   Stopt zolang de muis of het toetsenbord op het blok staat, of als de
   bezoeker op Pauzeer klikt. Met de bolletjes kiest de bezoeker zelf een
   stad; daarna loopt de wisseling door vanaf die stad. Bij "beperkte
   beweging" in de instellingen van het apparaat wisselt de stad niet
   vanzelf, maar werken de bolletjes wel. Zonder JavaScript blijft alleen
   de eerste stad staan en zijn de bolletjes verborgen. */
(function () {
  var hero = document.querySelector('[data-hero]');
  if (!hero) return;

  var MAX = 8;
  var slidesbak = hero.querySelector('.hero-slides');
  var stippenbak = hero.querySelector('.hero-stippen');
  var pauzeknop = hero.querySelector('.hero-pauze');
  var alle = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
  var vanzelf = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (alle.length === 0) return;

  function hash(tekst) {
    var h = 5381;
    for (var i = 0; i < tekst.length; i++) {
      h = ((h * 33) ^ tekst.charCodeAt(i)) >>> 0;
    }
    return h;
  }

  function sleutel(slide) { return slide.getAttribute('data-sleutel') || ''; }

  // Vaste, door elkaar gezette volgorde (zelfde voor elke bezoeker)
  var vast = alle.slice().sort(function (a, b) {
    var verschil = hash(sleutel(a)) - hash(sleutel(b));
    if (verschil !== 0) return verschil;
    return sleutel(a) < sleutel(b) ? -1 : 1;
  });

  // Dagnummer volgens de datum van de bezoeker
  var nu = new Date();
  var dag = Math.floor(Date.UTC(nu.getFullYear(), nu.getMonth(), nu.getDate()) / 86400000);

  var aantal = Math.min(MAX, vast.length);
  var slides = [];
  for (var k = 0; k < aantal; k++) {
    slides.push(vast[(dag + k) % vast.length]);
  }

  // Alleen de gekozen steden blijven staan, in de gekozen volgorde
  alle.forEach(function (s) {
    if (slides.indexOf(s) < 0) s.parentNode.removeChild(s);
  });
  slides.forEach(function (s) {
    s.classList.remove('actief');
    slidesbak.appendChild(s);
  });
  slides[0].classList.add('actief');

  function laad(slide) {
    var img = slide.querySelector('img[data-src]');
    if (img && !img.getAttribute('src')) img.setAttribute('src', img.getAttribute('data-src'));
  }

  var huidige = 0;
  laad(slides[0]);
  if (slides.length < 2) return; // geen bolletjes, geen pauzeknop
  laad(slides[1]);

  hero.classList.add('met-js');

  var stippen = slides.map(function (s) {
    var knop = document.createElement('button');
    knop.type = 'button';
    knop.className = 'hero-stip';
    knop.setAttribute('aria-label', 'Toon ' + (s.getAttribute('data-naam') || 'stad'));
    knop.appendChild(document.createElement('span'));
    stippenbak.appendChild(knop);
    return knop;
  });

  var timer = null;
  var gepauzeerd = false;
  var erop = false;

  function toon(n) {
    huidige = (n + slides.length) % slides.length;
    laad(slides[huidige]);
    laad(slides[(huidige + 1) % slides.length]);
    slides.forEach(function (s, i) { s.classList.toggle('actief', i === huidige); });
    stippen.forEach(function (s, i) {
      s.classList.toggle('actief', i === huidige);
      s.setAttribute('aria-current', i === huidige ? 'true' : 'false');
    });
  }

  function stop() {
    if (timer) { clearInterval(timer); timer = null; }
  }

  function start() {
    stop();
    if (!vanzelf || gepauzeerd || erop) return;
    timer = setInterval(function () { toon(huidige + 1); }, 8000);
  }

  stippen.forEach(function (stip, i) {
    stip.addEventListener('click', function () {
      toon(i);
      start();
    });
  });

  toon(0);

  if (!vanzelf) return;

  hero.classList.add('met-auto');

  pauzeknop.addEventListener('click', function () {
    gepauzeerd = !gepauzeerd;
    pauzeknop.textContent = gepauzeerd ? 'Afspelen' : 'Pauzeer';
    pauzeknop.setAttribute('aria-label', gepauzeerd
      ? 'Wisselen van uitgelichte stad hervatten'
      : 'Wisselen van uitgelichte stad pauzeren');
    start();
  });

  hero.addEventListener('mouseenter', function () { erop = true; stop(); });
  hero.addEventListener('mouseleave', function () { erop = false; start(); });
  hero.addEventListener('focusin', function () { erop = true; stop(); });
  hero.addEventListener('focusout', function () { erop = false; start(); });

  start();
})();
