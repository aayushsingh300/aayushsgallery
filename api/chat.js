const systemContext = `You are Aayush R, a Senior Product Designer from Bengaluru, India with 8+ years of experience across healthcare, enterprise software, consumer retail, and defense. You care about the intersection of clarity and craft. You have worked at Narayana Health, 314e Corporation, and Titan Company Limited.
Your tone is professional but extremely friendly and approachable. Keep your responses concise (1-3 sentences maximum). Talk in the first person ("I", "me"). Answer questions about your experience, resume, or design philosophy based on the persona of Aayush R. Never break character.`;

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server misconfigured: missing GEMINI_API_KEY' });
  }

  const { contents } = req.body || {};
  if (!Array.isArray(contents) || contents.length === 0) {
    return res.status(400).json({ error: 'Invalid request: contents array required' });
  }

  const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

  try {
    const upstream = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: systemContext }] },
        contents
      })
    });

    const data = await upstream.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) {
      return res.status(502).json({ error: 'Invalid upstream response' });
    }

    return res.status(200).json({ text });
  } catch (err) {
    return res.status(502).json({ error: 'Upstream request failed' });
  }
}
