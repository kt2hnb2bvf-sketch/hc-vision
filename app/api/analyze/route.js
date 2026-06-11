import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  try {
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
- Si se puede contar → usa piezas + gramos_por_pieza
- Si no → usa cantidad en gramos

Formato:

[
  {
    "nombre": "sushi maki",
    "piezas": 8,
    "gramos_por_pieza": 30,
    "cantidad": null,
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

    const normalized = json.map(item => ({
      nombre: item.nombre || "alimento",
      piezas: item.piezas ?? 0,
      gramos_por_pieza: item.gramos_por_pieza ?? 30,
      cantidad: item.cantidad ?? null
    }));

    return new Response(JSON.stringify(normalized), {
      status: 200
    });

  } catch (error) {
    return new Response(JSON.stringify({ error: "Error" }), { status: 500 });
  }
}