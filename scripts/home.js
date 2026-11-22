/* ===== HOMEPAGINA: wisselende uitgelichte stad =====
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

  var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
  var stippen = Array.prototype.slice.call(hero.querySelectorAll('.hero-stip'));
  var pauzeknop = hero.querySelector('.hero-pauze');
  var vanzelf = !window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (slides.length < 2) return;

  hero.classList.add('met-js');

  var huidige = 0;
  var timer = null;
  var gepauzeerd = false;
  var erop = false;

  function toon(n) {
    huidige = (n + slides.length) % slides.length;
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
