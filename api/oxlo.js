export const config = { maxDuration: 60 };

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(204).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const apiKey = process.env.OXLO_API_KEY;
  if (!apiKey) return res.status(500).json({ error: 'OXLO_API_KEY not configured' });

  try {
    const oxloRes = await fetch('https://api.oxlo.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
      },
      body: JSON.stringify(req.body),
    });

    const data = await oxloRes.json();
    return res.status(oxloRes.status).json(data);
  } catch (err) {
    return res.status(502).json({ error: `Upstream error: ${err.message}` });
  }
}
