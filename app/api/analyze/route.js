import OpenAI from "openai";

export async function POST(req) {
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { images } = await req.json();

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Eres experto en nutrición.

Analiza imágenes de comida.

Devuelve SOLO JSON:

[
  {
    "nombre": "arroz",
    "cantidad": 200,
    "unidad": "gramos",
    "confianza": 0.9
  }
]
`
            },
            ...images.map(img => ({
              type: "input_image",
              image_url: img
            }))
          ]
        }
      ]
    });

    const text = response.output_text;

    let json;

    try {
      json = JSON.parse(text);
    } catch {
      return new Response(JSON.stringify([]), { status: 200 });
    }

    return new Response(JSON.stringify(json), { status: 200 });

  } catch (error) {
    return new Response(JSON.stringify({ error: "error" }), { status: 500 });
  }
}