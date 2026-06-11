export async function POST(req) {
  try {
    const { images } = await req.json();

    const content = images.map(img => ({
      type: "image",
      source: {
        type: "base64",
        media_type: "image/jpeg",
        data: img.split(",")[1]
      }
    }));

    content.push({
      type: "text",
      text: "Devuelve alimentos con gramos, hc_per_100g y units"
    });

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01"
      },
      body: JSON.stringify({
        model: "claude-3-sonnet-20240229",
        max_tokens: 1000,
        messages: [{ role: "user", content }]
      })
    });

    const data = await response.json();

    let text = data.content?.[0]?.text || "{}";
    text = text.replace(/```json|```/g, "").trim();

    return new Response(text);

  } catch {
    return new Response(JSON.stringify({ error: "error IA" }), { status: 500 });
  }
}