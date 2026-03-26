export default async function handler(req, res) {
  try {
    const { ticker } = req.body;

    if (!ticker) {
      return res.status(400).json({ error: "Ticker required" });
    }

    const prompt = `
You are a professional equity research analyst.

Research the stock ticker "${ticker}" using web search.

Return ONLY valid JSON.
Do NOT include:
- markdown
- code blocks
- explanations
- text before or after JSON

Ensure JSON is strictly valid and parsable.

Use this exact schema:

{
  "ticker": "...",
  "exchange": "...",
  "company": "...",
  "sector": "...",
  "description": "...",
  "currentPrice": "...",
  "currency": "...",
  "priceChange": "...",
  "priceChangeDir": "up|down|neutral",
  "week52High": "...",
  "week52Low": "...",
  "week52Position": 70,
  "marketCap": "...",
  "pe": "...",
  "pb": "...",
  "eps": "...",
  "roe": "...",
  "divYield": "...",
  "analystRating": "...",
  "avgTarget": "...",
  "upsidePercent": "...",
  "upsideDir": "up|down",
  "ytdPerformance": "...",
  "ytdDir": "up|down|neutral",
  "metrics": [],
  "recentResults": {
    "period": "...",
    "highlights": []
  },
  "catalysts": [],
  "risks": [],
  "analystBreakdown": {
    "buy": 0,
    "hold": 0,
    "sell": 0
  },
  "priceTargets": [],
  "technicalSignal": "...",
  "movingAvg50": "...",
  "movingAvg200": "...",
  "technicalNote": "...",
  "reportDate": "March 26, 2026"
}
`;

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

    // 🔍 Debug log (check in Vercel logs if needed)
    console.log("RAW AI RESPONSE:", JSON.stringify(data, null, 2));

    // ✅ Extract text safely
    let text = "";

    if (data.content && Array.isArray(data.content)) {
      for (const block of data.content) {
        if (block.type === "text") {
          text += block.text;
        }
      }
    }

    // Clean formatting
    text = text.replace(/```json|```/g, "").trim();

    let parsed;

    // ✅ Try direct parse
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      // ✅ Fallback extraction
      const match = text.match(/\{[\s\S]*\}/);

      if (!match) {
        return res.status(500).json({
          error: "Parsing failed",
          preview: text.substring(0, 300)
        });
      }

      try {
        parsed = JSON.parse(match[0]);
      } catch (e) {
        return res.status(500).json({
          error: "JSON parse failed",
          preview: match[0].substring(0, 300)
        });
      }
    }

    return res.status(200).json(parsed);

  } catch (err) {
    return res.status(500).json({
      error: err.message || "Server error"
    });
  }
}
