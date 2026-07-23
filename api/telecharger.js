// Vérification de paiement Stripe avant de livrer le lien de téléchargement.
//
// La page /merci*.html appelle : GET /api/telecharger?produit=<base|racines>&session_id=<cs_...>
// On interroge Stripe avec la clé secrète (variable d'env Vercel STRIPE_SECRET_KEY) pour
// confirmer que la session existe ET qu'elle est payée. Ce n'est qu'alors qu'on renvoie
// le lien Drive. Les liens ne sont JAMAIS dans le HTML : ils vivent ici, côté serveur.

const LIENS = {
  base: 'https://drive.google.com/uc?export=download&id=1D-76KneIIkpoyodY3uoopAYrQ-AKmm4A',
  racines: 'https://drive.google.com/uc?export=download&id=1pxOuD0CyNpRMvReM7rEMNPAjdZYgrz8c',
};

export default async function handler(req, res) {
  const produit = String((req.query && req.query.produit) || '');
  const sessionId = String((req.query && req.query.session_id) || '');

  if (!LIENS[produit] || !sessionId) {
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
    return res.status(200).json({ ok: true, url: LIENS[produit] });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'erreur_verification' });
  }
}
