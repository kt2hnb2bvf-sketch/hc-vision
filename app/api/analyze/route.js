import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  try {
    const { imageBase64 } = await req.json();

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      input: [
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `
Eres un nutricionista experto en diabetes tipo 1.

Analiza la imagen de comida.

Tu tarea es SOLO identificar alimentos y estimar cantidades.

Devuelve:

- nombre
- cantidad
- unidad (gramos o unidades)
- confianza (0-1)

RESPONDE SOLO JSON:

[
  {
    "nombre": "pan",
    "cantidad": 50,
    "unidad": "gramos",
    "confianza": 0.9
  }
]
`
            },
            {
              type: "input_image",
              image_url: `data:image/jpeg;base64,${imageBase64}`
            }
          ]
        }
      ]
    });

    const text =
      response.output?.[0]?.content?.[0]?.text || "[]";

    let json;

    try {
      json = JSON.parse(text);
    } catch {
      json = [];
    }

    return new Response(JSON.stringify(json), {
      status: 200
    });

  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({ error: "Error en análisis" }),
      { status: 500 }
    );
  }
}