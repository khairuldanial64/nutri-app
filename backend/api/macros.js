export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { meal } = req.body;
  if (!meal) return res.status(400).json({ error: 'No meal provided' });

  try {
    const aiRes = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: `You are a nutrition assistant. When the user describes a meal,
respond ONLY with a valid JSON object — no extra text, no markdown, no backticks.
The JSON must have exactly these fields:
{
  "meal_name": "short name for the meal",
  "calories": 000,
  "protein_g": 00,
  "carbs_g": 00,
  "fat_g": 00
}
Use realistic average nutrition values. If the meal is Malaysian or Southeast Asian, use accurate local values.`,
          },
          { role: 'user', content: meal },
        ],
        max_tokens: 200,
      }),
    });

    const aiData = await aiRes.json();
    if (!aiRes.ok) throw new Error(aiData.error?.message);
    const raw = aiData.choices[0].message.content.trim();
    return res.status(200).json({ ...JSON.parse(raw), source: 'ai' });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}