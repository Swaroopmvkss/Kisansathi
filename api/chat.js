export default async function handler(req, res) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*')
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS')
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type')
    return res.status(204).end()
  }

  const API_KEY = process.env.GROQ_API_KEY
  if (!API_KEY) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(500).json({ error: { message: 'GROQ_API_KEY not configured.' } })
  }

  try {
    const { system, messages } = req.body
    const groqMessages = [
      { role: 'system', content: system },
      ...messages.map(m => ({ role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }))
    ]

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: groqMessages,
        max_tokens: 1024,
      }),
    })

    const data = await response.json()

    if (data.error) {
      res.setHeader('Access-Control-Allow-Origin', '*')
      return res.status(200).json({ error: { message: 'Groq error: ' + data.error.message } })
    }

    const text = data.choices?.[0]?.message?.content || 'Sorry, no response.'
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(200).json({ content: [{ text }] })
  } catch (err) {
    res.setHeader('Access-Control-Allow-Origin', '*')
    return res.status(500).json({ error: { message: err.message } })
  }
}
