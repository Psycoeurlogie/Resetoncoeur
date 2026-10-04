// Vérification de paiement Stripe avant de livrer le lien de téléchargement.
//
// La page /merci*.html appelle : GET /api/telecharger?produit=<base|racines>&session_id=<cs_...>
// On interroge Stripe avec la clé secrète (variable d'env Vercel STRIPE_SECRET_KEY) pour
// confirmer que la session existe ET qu'elle est payée. Ce n'est qu'alors qu'on renvoie
// le lien Drive. Les liens ne sont JAMAIS dans le HTML : ils vivent ici, côté serveur.
//
// Cas particulier « pack » (les deux livres, 39€) : on renvoie les deux liens, mais seulement si
// la session a réellement payé au moins le prix du pack. Sans ce contrôle, une session de 25€
// (un seul livre) suffirait à ouvrir les deux.

const LIENS = {
  base: 'https://drive.google.com/uc?export=download&id=1nh3KJu94lEkh3RUje2N-IWUn0Ft4UXPC',
  racines: 'https://drive.google.com/uc?export=download&id=1s0moHrI6nZXX0RNRIUMMYbXqNFF2Lxm7',
};

const PACK_MIN_CENTIMES = 3900;

export default async function handler(req, res) {
  const produit = String((req.query && req.query.produit) || '');
  const sessionId = String((req.query && req.query.session_id) || '');

  const estPack = produit === 'pack';
  const estLivre = Object.prototype.hasOwnProperty.call(LIENS, produit);

  if ((!estLivre && !estPack) || !sessionId) {
    return res.status(400).json({ ok: false, error: 'requete_invalide' });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) {
    return res.status(500).json({ ok: false, error: 'config_manquante' });
  }

  // On refuse un id qui ne ressemble pas à une session Checkout (garde-fou léger).
  if (!/^cs_[A-Za-z0-9_]+$/.test(sessionId)) {
    return res.status(403).json({ ok: false, error: 'session_invalide' });
  }

  try {
    const r = await fetch(
      'https://api.stripe.com/v1/checkout/sessions/' + encodeURIComponent(sessionId),
      { headers: { Authorization: 'Bearer ' + key } }
    );

    if (!r.ok) {
      // 404 = session inconnue, 401 = clé invalide, etc.
      return res.status(403).json({ ok: false, error: 'session_introuvable' });
    }

    const session = await r.json();
    const paye = session.payment_status === 'paid' || session.status === 'complete';

    if (!paye) {
      return res.status(403).json({ ok: false, error: 'paiement_non_confirme' });
    }

    // Paiement confirmé : on livre le lien correspondant au produit demandé.
    res.setHeader('Cache-Control', 'no-store');

    if (estPack) {
      // Adaptive Pricing est actif : une cliente hors zone euro paie dans sa devise, et
      // `currency_conversion` porte alors le montant d'origine, en euros.
      const conv = session.currency_conversion;
      const devise = conv ? conv.source_currency : session.currency;
      const montant = conv ? conv.amount_total : session.amount_total;
      if (devise !== 'eur' || !(montant >= PACK_MIN_CENTIMES)) {
        return res.status(403).json({ ok: false, error: 'montant_insuffisant' });
      }
      return res.status(200).json({ ok: true, urls: { racines: LIENS.racines, base: LIENS.base } });
    }

    return res.status(200).json({ ok: true, url: LIENS[produit] });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'erreur_verification' });
  }
}
