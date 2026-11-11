// Données communes à la livraison des livres (page merci via /api/telecharger, e-mail via
// /api/stripe-webhook). Le préfixe « _ » empêche Vercel d'en faire une route publique.

export const LIENS = {
  base: 'https://drive.google.com/uc?export=download&id=1nh3KJu94lEkh3RUje2N-IWUn0Ft4UXPC',
  racines: 'https://drive.google.com/uc?export=download&id=1s0moHrI6nZXX0RNRIUMMYbXqNFF2Lxm7',
};

export const TITRES = {
  base: 'Reset ton cœur, le programme 21 jours',
  racines: 'Les racines des blocages de la femme',
};

// Lien de paiement Stripe -> livres livrés. Un paiement venu d'un autre lien (Beacons,
// ancien lien à 17 €) n'est pas un achat de livre sur le site : on ne livre rien.
export const PRODUITS_PAR_LIEN = {
  plink_1TW5NrBO4RXS4DkAS9VECyJp: ['base'],
  plink_1TwAqjBO4RXS4DkANeO99RoD: ['racines'],
  plink_1UMyLDBO4RXS4DkAgbKPJD5y: ['racines', 'base'], // pack, les deux livres
  plink_1UacUbBO4RXS4DkAlW4PQma4: ['racines'], // TEMPORAIRE : lien de test à 0 € (11/11/2026), à retirer
};
