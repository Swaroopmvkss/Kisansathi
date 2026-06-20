export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(204).end()
  }

  const API_KEY = process.env.ANTHROPIC_API_KEY

  if (!API_KEY) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(500).json({ error: { message: 'API key not configured on server.' } })
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify(req.body),
    })

    const data = await response.json()
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(response.status).json(data)
  } catch (err) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(500).json({ error: { message: err.message } })
  }
}
