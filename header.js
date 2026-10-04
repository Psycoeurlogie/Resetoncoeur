// Header commun : menu « Gratuit » et menu mobile.
(function () {
  var rh = document.getElementById('rh');
  if (!rh) return;
  var burger = rh.querySelector('.rh-burger');
  var free = rh.querySelector('.rh-free');
  var freeBtn = rh.querySelector('.rh-free-btn');

  burger.addEventListener('click', function () {
    var open = rh.classList.toggle('open');
    burger.setAttribute('aria-expanded', open);
  });

  freeBtn.addEventListener('click', function (e) {
    e.stopPropagation();
    var open = free.classList.toggle('open');
    freeBtn.setAttribute('aria-expanded', open);
  });
  document.addEventListener('click', function (e) {
    if (!free.contains(e.target)) {
      free.classList.remove('open');
      freeBtn.setAttribute('aria-expanded', false);
    }
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { free.classList.remove('open'); rh.classList.remove('open'); }
  });
})();
