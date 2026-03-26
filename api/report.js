export default async function handler(req, res) {
  try {
    const { ticker } = req.body;

    if (!ticker) {
      return res.status(400).json({ error: "Ticker required" });
    }

    const prompt = `
You are a professional equity research analyst.

Research stock "${ticker}" and return ONLY valid JSON.

No markdown. No explanation.

Use structured format like:
{
  "ticker": "...",
  "company": "...",
  "currentPrice": "...",
  "marketCap": "...",
  "pe": "...",
  "description": "...",
  "catalysts": [],
  "risks": []
}
`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        temperature: 0.3,
        messages: [
          { role: "user", content: prompt }
        ]
      })
    });

    const data = await response.json();

    const text = data.choices?.[0]?.message?.content || "";

    let parsed;

    try {
      parsed = JSON.parse(text);
    } catch {
      const match = text.match(/\{[\s\S]*\}/);
      if (!match) {
        return res.status(500).json({
          error: "Parsing failed",
          preview: text.substring(0, 300)
        });
      }
      parsed = JSON.parse(match[0]);
    }

    res.status(200).json(parsed);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
