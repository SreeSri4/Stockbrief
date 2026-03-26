export default async function handler(req, res) {
  try {
    const { ticker } = req.body;

    if (!ticker) {
      return res.status(400).json({ error: "Ticker required" });
    }

    const prompt = `You are a professional equity research analyst. Research the stock ticker "${ticker}" using web search and produce a detailed JSON report.

Return ONLY JSON in required format.`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-20250514",
        max_tokens: 2000,
        tools: [{ type: "web_search_20250305", name: "web_search" }],
        messages: [{ role: "user", content: prompt }]
      })
    });

    const data = await response.json();

    const textBlocks = (data.content || [])
      .filter(b => b.type === 'text')
      .map(b => b.text)
      .join('');

    const cleaned = textBlocks.replace(/```json|```/g, '').trim();
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);

    if (!jsonMatch) {
      return res.status(500).json({ error: "Parsing failed" });
    }

    const parsed = JSON.parse(jsonMatch[0]);

    res.status(200).json(parsed);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
