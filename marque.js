// Intro cinématographique de l'accueil : une seule fois par visite, 2,6 s, un clic la passe.
(function () {
  var intro = document.getElementById('pc-intro');
  if (!intro) return;
  // Le script en ligne placé juste après l'intro ne la rend visible que pour une première visite
  if (intro.hidden) { intro.remove(); return; }
  try { sessionStorage.setItem('pc-intro', '1'); } catch (e) {}
  function fermer() {
    intro.classList.add('is-out');
    setTimeout(function () { intro.remove(); }, 900);
  }
  intro.addEventListener('click', fermer);
  setTimeout(fermer, 2600);
})();
