// Interactions communes : filtres de la bibliothèque, apparitions au défilement, curseur doré.
(function () {
  var reduit = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Filtres de la bibliothèque
  var chips = document.querySelectorAll('.lib-chip');
  var cartes = document.querySelectorAll('.lib-card');
  chips.forEach(function (chip) {
    chip.addEventListener('click', function () {
      var f = chip.dataset.f;
      chips.forEach(function (c) {
        var on = c === chip;
        c.classList.toggle('is-on', on);
        c.setAttribute('aria-pressed', on);
      });
      cartes.forEach(function (carte) {
        var garde = f === 'tout' || carte.dataset.tags.split(' ').indexOf(f) !== -1;
        carte.classList.toggle('is-hidden', !garde);
      });
    });
  });

  // Apparitions au défilement
  if (!reduit && 'IntersectionObserver' in window) {
    document.documentElement.classList.add('js-anim');
    var io = new IntersectionObserver(function (entrees) {
      entrees.forEach(function (e) {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    document.querySelectorAll('.ph-band, .lib-card, .ph-strip div').forEach(function (el) { io.observe(el); });
  }

  // Curseur doré : seulement avec une vraie souris
  if (reduit || !window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
  var ring = document.createElement('div'); ring.className = 'cur-ring';
  var dot = document.createElement('div'); dot.className = 'cur-dot';
  document.body.appendChild(ring); document.body.appendChild(dot);
  var mx = 0, my = 0, rx = 0, ry = 0, actif = false;
  document.addEventListener('mousemove', function (e) {
    mx = e.clientX; my = e.clientY;
    dot.style.transform = 'translate(' + mx + 'px,' + my + 'px)';
    if (!actif) { actif = true; rx = mx; ry = my; document.documentElement.classList.add('has-cursor'); }
  });
  document.addEventListener('mouseleave', function () { document.documentElement.classList.remove('has-cursor'); actif = false; });
  document.addEventListener('mouseover', function (e) {
    ring.classList.toggle('is-big', !!e.target.closest('a, button, .lib-chip'));
  });
  // L'anneau rejoint la souris puis la boucle s'arrête : rien ne tourne quand la souris est immobile
  var enCours = false;
  function boucle() {
    rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
    ring.style.transform = 'translate(' + rx + 'px,' + ry + 'px)';
    if (Math.abs(mx - rx) + Math.abs(my - ry) > 0.3) requestAnimationFrame(boucle);
    else enCours = false;
  }
  document.addEventListener('mousemove', function () {
    if (!enCours) { enCours = true; requestAnimationFrame(boucle); }
  });
})();
