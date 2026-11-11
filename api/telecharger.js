// Vérification de paiement Stripe avant de livrer le lien de téléchargement.
//
// La page /merci*.html appelle : GET /api/telecharger?produit=<base|racines>&session_id=<cs_...>
// On interroge Stripe avec la clé secrète (variable d'env Vercel STRIPE_SECRET_KEY) pour
// confirmer que la session existe ET qu'elle est payée. Ce n'est qu'alors qu'on renvoie
// le lien Drive. Les liens ne sont JAMAIS dans le HTML : ils vivent ici, côté serveur.
//
// Le livre demandé doit correspondre au lien de paiement de la session : sans ce contrôle, une
// session à 25 € d'un livre ouvrirait l'autre livre (ou le pack) en changeant `?produit=`.
// Contrôler le lien plutôt que le montant laisse passer un achat à 0 € par code promo.

import { LIENS, PRODUITS_PAR_LIEN } from './_livres.js';

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
      // 401/403 = clé refusée par Stripe : c'est une panne de configuration, pas une cliente
      // inconnue. Elle a tourné en silence du 9 août au 11 novembre 2026, d'où ce log.
      console.error('telecharger Stripe a répondu', r.status);
      if (r.status === 401 || r.status === 403) {
        return res.status(500).json({ ok: false, error: 'config_invalide' });
      }
      return res.status(403).json({ ok: false, error: 'session_introuvable' });
    }

    const session = await r.json();
    const paye = session.payment_status === 'paid' || session.status === 'complete';

    if (!paye) {
      return res.status(403).json({ ok: false, error: 'paiement_non_confirme' });
    }

    const achetes = PRODUITS_PAR_LIEN[session.payment_link] || [];
    const autorise = estPack ? achetes.length === 2 : achetes.includes(produit);
    if (!autorise) {
      return res.status(403).json({ ok: false, error: 'produit_non_achete' });
    }

    // Paiement confirmé : on livre le lien correspondant au produit demandé.
    res.setHeader('Cache-Control', 'no-store');

    if (estPack) {
      return res.status(200).json({ ok: true, urls: { racines: LIENS.racines, base: LIENS.base } });
    }

    return res.status(200).json({ ok: true, url: LIENS[produit] });
  } catch (e) {
    return res.status(500).json({ ok: false, error: 'erreur_verification' });
  }
}
