export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).end();

  const { email, prenom, listId } = req.body;
  if (!email || !listId) return res.status(400).json({ error: 'Missing fields' });

  const response = await fetch('https://api.brevo.com/v3/contacts', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'api-key': process.env.BREVO_API_KEY
    },
    body: JSON.stringify({
      email,
      attributes: { FIRSTNAME: prenom || '' },
      listIds: [listId],
      updateEnabled: true
    })
  });

  res.status(response.ok ? 200 : 500).end();
}
