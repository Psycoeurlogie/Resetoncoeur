const ALLOWED_ORIGINS = [
  'https://resetoncoeur.fr',
  'https://www.resetoncoeur.fr',
  'https://resetoncoeur.vercel.app'
];

const ALLOWED_LIST_IDS = [9, 10, 11, 12, 13];

export default async function handler(req, res) {
  const origin = req.headers.origin;
  if (ALLOWED_ORIGINS.includes(origin)) {
    res.setHeader('Access-Control-Allow-Origin', origin);
  }
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { email, prenom, listId } = req.body;
  if (!email || !listId) return res.status(400).json({ error: 'Missing fields' });

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) return res.status(400).json({ error: 'Invalid email' });

  if (!ALLOWED_LIST_IDS.includes(Number(listId))) return res.status(400).json({ error: 'Invalid list' });

  try {
    const response = await fetch('https://api.brevo.com/v3/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': process.env.BREVO_API_KEY
      },
      body: JSON.stringify({
        email,
        attributes: { PRENOM: prenom || '' },
        listIds: [listId],
        updateEnabled: true
      })
    });

    if (!response.ok) {
      const body = await response.json().catch(() => ({}));
      console.error('Brevo error', response.status, body);
      return res.status(500).json({ error: 'Brevo error' });
    }

    res.status(200).end();
  } catch (err) {
    console.error('Subscribe handler error', err);
    res.status(500).json({ error: 'internal' });
  }
}
