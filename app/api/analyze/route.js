import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  try {
    const { images } = await req.json();

    const content = [
      {
        type: "input_text",
        text: `
Eres nutricionista experto en diabetes tipo 1.

Analiza TODAS las imágenes.

Devuelve JSON con:
- nombre
- cantidad (gramos)
- unidad

IMPORTANTE:
- Sé conservador
- Si hay varias fotos, mejora la precisión
`
      },
      ...images.map(img => ({
        type: "input_image",
        image_url: img
      }))
    ];

    const response = await client.responses.create({
      model: "gpt-5.4-nano",
      input: [{ role: "user", content }]
    });

    return new Response(JSON.stringify(JSON.parse(response.output_text)), {
      status: 200
    });

  } catch (e) {
    return new Response(JSON.stringify([]), { status: 200 });
  }
}