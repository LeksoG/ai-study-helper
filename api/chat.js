export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.MISTRAL_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'MISTRAL_API_KEY is not configured' });
  }

  const { model, system, prompt } = req.body;
  if (!prompt) {
    return res.status(400).json({ error: 'Missing prompt' });
  }

  const mistralRes = await fetch('https://api.mistral.ai/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: model || 'mistral-medium-latest',
      temperature: 0.7,
      max_tokens: 1800,
      messages: [
        { role: 'system', content: system },
        { role: 'user', content: prompt },
      ],
    }),
  });

  if (!mistralRes.ok) {
    const err = await mistralRes.json().catch(() => ({}));
    return res.status(mistralRes.status).json({ error: err?.message || `HTTP ${mistralRes.status}` });
  }

  const data = await mistralRes.json();
  return res.status(200).json(data);
}
