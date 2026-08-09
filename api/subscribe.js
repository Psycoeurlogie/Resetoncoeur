const ALLOWED_ORIGINS = [
  'https://resetoncoeur.fr',
  'https://www.resetoncoeur.fr',
  'https://resetoncoeur.vercel.app'
];

const ALLOWED_LIST_IDS = [9, 10, 11, 12, 13, 14];

// Aimants à mails livrés immédiatement par email transactionnel.
// Clé envoyée par la landing page -> id du template Brevo qui porte le lien de téléchargement.
// Pour en ajouter un : créer le template dans Brevo, ajouter une ligne ici.
const GUIDES = {
  blocages: 36, // « Ce que tu répètes » -> guides/ce-que-tu-repetes.pdf
};

// Rate limiter: max 5 requests per IP per 10 minutes
const rateLimiter = new Map();
const RATE_LIMIT = 5;
const RATE_WINDOW = 10 * 60 * 1000;

function isRateLimited(ip) {
  const now = Date.now();
  const entry = rateLimiter.get(ip);
  if (!entry || now - entry.start > RATE_WINDOW) {
    rateLimiter.set(ip, { count: 1, start: now });
    return false;
  }
  if (entry.count >= RATE_LIMIT) return true;
  entry.count++;
  return false;
}

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const ip = req.headers['x-forwarded-for']?.split(',')[0]?.trim() || 'unknown';
  if (isRateLimited(ip)) {
    return res.status(429).json({ error: 'Too many requests' });
  }

  const { email, prenom, listId, guide } = req.body;
  if (!email || !listId) return res.status(400).json({ error: 'Missing fields' });

  if (guide !== undefined && !GUIDES[guide]) {
    return res.status(400).json({ error: 'Invalid guide' });
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return res.status(400).json({ error: 'Invalid email' });

  if (!ALLOWED_LIST_IDS.includes(Number(listId))) return res.status(400).json({ error: 'Invalid list' });

  const safeName = String(prenom || '').slice(0, 50).replace(/[<>"'&]/g, '');

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        email,
        attributes: { PRENOM: safeName },
        listIds: [Number(listId)],
        updateEnabled: true
      })
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      console.error('Brevo error', response.status, body);
      return res.status(500).json({ error: 'Brevo error' });
    }

    // Aimant à mails : on livre le guide tout de suite, sans dépendre d'une automation Brevo.
    // Le contact est déjà inscrit à ce stade ; si l'envoi échoue on renvoie une erreur pour
    // que la page propose de réessayer (l'inscription est idempotente, updateEnabled est actif).
    if (guide) {
      const sent = await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY
        },
        body: JSON.stringify({
          to: [{ email }],
          templateId: GUIDES[guide]
        })
      });

      if (!sent.ok) {
        const body = await sent.json().catch(() => ({}));
        console.error('Brevo delivery error', guide, sent.status, body);
        return res.status(502).json({ error: 'Delivery failed' });
      }
    }

    res.status(200).end();
  } catch (err) {
    console.error('Subscribe handler error', err);
    res.status(500).json({ error: 'internal' });
  }
}
