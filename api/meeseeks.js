// Vercel Serverless Function
// Deploy: put this at  api/meeseeks.js  in a repo, then `vercel deploy`
// Env vars (Vercel dashboard -> Settings -> Environment Variables,
// or `vercel env add`):
//    ANTHROPIC_API_KEY
//    SHARED_SECRET

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "POST only" });
  }

  const body = req.body; // Vercel parses JSON automatically

  if (body.secret !== process.env.SHARED_SECRET) {
    return res.status(403).json({ error: "nope" });
  }

  const history = (body.history || []).slice(-12);

  const contextLine = `Owner: ${body.context?.owner ?? "?"}. Nearby players: ${
    (body.context?.nearby || []).join(", ") || "none"
  }.`;

  const messages = [
    { role: "user", content: contextLine },
    ...history.map((m) => ({
      role: m.role === "assistant" ? "assistant" : "user",
      content: String(m.content).slice(0, 500),
    })),
  ];

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "content-type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 200,
        system: body.system,
        messages,
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      return res.status(502).json({ error: errText });
    }

    const data = await anthropicRes.json();
    const text = (data.content || [])
      .filter((b) => b.type === "text")
      .map((b) => b.text)
      .join("\n");

    return res.status(200).json({ text });
  } catch (err) {
    return res.status(500).json({ error: String(err) });
  }
}
