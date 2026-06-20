export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(204).end()
  }

  const API_KEY = process.env.GEMINI_API_KEY
  if (!API_KEY) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(500).json({ error: { message: 'GEMINI_API_KEY not configured.' } })
  }

  try {
    const { system, messages } = req.body
    const contents = messages.map(m => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }]
    }))

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          system_instruction: { parts: [{ text: system }] },
          contents,
        }),
      }
    )

    const data = await response.json()

    if (data.error) {
      res.setHeader('Access-Control-Allow-Origin', '*')
      return res.status(response.status).json({ error: { message: 'Gemini error: ' + data.error.message } })
    }

    const text = data.candidates?.[0]?.content?.parts?.[0]?.text
    if (!text) {
      res.setHeader('Access-Control-Allow-Origin', '*')
      return res.status(200).json({ error: { message: 'Gemini returned empty response: ' + JSON.stringify(data).slice(0, 200) } })
    }

    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json({ content: [{ text }] })
  } catch (err) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(500).json({ error: { message: err.message } })
  }
}
