import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  const { images } = await req.json();

  const response = await client.responses.create({
    model: "gpt-5.4-nano",
    input: [
      {
        role: "user",
        content: [
          {
            type: "input_text",
            text: `
Eres experto en nutrición para diabetes tipo 1.

Analiza la comida.

IMPORTANTE:
- Devuelve piezas si aplica (sushi, pan, etc)
- Estima gramos por pieza
- Si no aplica, usa gramos directamente

Formato:

[
  {
    "nombre": "sushi maki",
    "piezas": 8,
    "gramos_por_pieza": 30,
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

  try {
    return new Response(text, { status: 200 });
  } catch {
    return new Response("[]");
  }
}