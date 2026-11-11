// Livraison des livres par e-mail, déclenchée par Stripe après chaque paiement.
//
// Stripe appelle POST /api/stripe-webhook avec l'événement checkout.session.completed (ou
// checkout.session.async_payment_succeeded pour un moyen de paiement différé). On vérifie la
// signature (STRIPE_WEBHOOK_SECRET), on déduit le ou les livres du lien de paiement, puis on
// envoie le lien de téléchargement par Brevo. La page /merci*.html reste un second accès :
// cet e-mail ne dépend ni d'elle, ni de STRIPE_SECRET_KEY.
//
// Toute erreur d'envoi répond 500 : Stripe relance alors l'événement pendant 3 jours.

import crypto from 'node:crypto';
import { PRODUITS_PAR_LIEN } from './_livres.js';
import { construireEmail } from './_email-livraison.js';

// Le corps brut est indispensable pour vérifier la signature.
export const config = { api: { bodyParser: false } };

const LISTE_ACHETEUSES = 27; // Brevo « Acheteuses · livres »
const TOLERANCE_SECONDES = 300;

function lireCorpsBrut(req) {
  return new Promise((resolve, reject) => {
    const morceaux = [];
    req.on('data', (m) => morceaux.push(m));
    req.on('end', () => resolve(Buffer.concat(morceaux)));
    req.on('error', reject);
  });
}

// En-tête Stripe-Signature : « t=<horodatage>,v1=<hmac>[,v1=...] ».
export function signatureValide(corps, entete, secret, maintenant = Date.now()) {
  if (!entete || !secret) return false;
  const parties = entete.split(',').map((p) => p.split('='));
  const t = parties.find(([k]) => k === 't')?.[1];
  const signatures = parties.filter(([k]) => k === 'v1').map(([, v]) => v);
  if (!t || signatures.length === 0) return false;
  if (Math.abs(maintenant / 1000 - Number(t)) > TOLERANCE_SECONDES) return false;

  const attendue = crypto.createHmac('sha256', secret).update(`${t}.${corps}`).digest('hex');
  return signatures.some((s) => {
    const a = Buffer.from(s, 'utf8');
    const b = Buffer.from(attendue, 'utf8');
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  });
}

async function brevo(chemin, donnees) {
  return fetch('https://api.brevo.com/v3' + chemin, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'api-key': process.env.BREVO_API_KEY },
    body: JSON.stringify(donnees),
  });
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  const corps = (await lireCorpsBrut(req)).toString('utf8');
  const secret = process.env.STRIPE_WEBHOOK_SECRET?.trim();
  if (!signatureValide(corps, req.headers['stripe-signature'], secret)) {
    console.error('stripe-webhook signature refusée', { secretPresent: Boolean(secret) });
    return res.status(400).json({ error: 'signature' });
  }

  const evenement = JSON.parse(corps);
  const types = ['checkout.session.completed', 'checkout.session.async_payment_succeeded'];
  if (!types.includes(evenement.type)) return res.status(200).json({ ignore: evenement.type });

  const session = evenement.data.object;
  // Paiement différé pas encore encaissé : on livrera sur async_payment_succeeded.
  // « no_payment_required » = achat à 0 € avec un code promo à 100 % : on livre aussi.
  if (!['paid', 'no_payment_required'].includes(session.payment_status)) {
    return res.status(200).json({ attente: true });
  }

  const produits = PRODUITS_PAR_LIEN[session.payment_link];
  if (!produits) {
    console.log('stripe-webhook paiement hors livres', session.id, session.payment_link);
    return res.status(200).json({ ignore: 'lien' });
  }

  const email = session.customer_details?.email;
  if (!email) {
    console.error('stripe-webhook session sans e-mail', session.id);
    return res.status(200).json({ ignore: 'email' });
  }

  const { sujet, html, texte } = construireEmail(produits);
  const envoi = await brevo('/smtp/email', {
    sender: { name: 'Psycœurlogie', email: 'contact@resetoncoeur.fr' },
    replyTo: { email: 'contact@resetoncoeur.fr', name: 'Psycœurlogie' },
    to: [{ email }],
    subject: sujet,
    htmlContent: html,
    textContent: texte,
    tags: ['livraison'],
  });
  if (!envoi.ok) {
    console.error('stripe-webhook envoi Brevo échoué', session.id, envoi.status, await envoi.text());
    return res.status(500).json({ error: 'envoi' });
  }

  // Ajout à la liste des acheteuses : utile, mais jamais bloquant pour la livraison.
  const contact = await brevo('/contacts', { email, listIds: [LISTE_ACHETEUSES], updateEnabled: true });
  if (!contact.ok) console.error('stripe-webhook ajout liste échoué', contact.status);

  console.log('stripe-webhook livré', session.id, produits.join('+'));
  return res.status(200).json({ livre: produits });
}
