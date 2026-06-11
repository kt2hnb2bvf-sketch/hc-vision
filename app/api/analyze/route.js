import OpenAI from "openai";

export async function POST(req) {
  try {
    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const { images } = await req.json();

    if (!images || images.length === 0) {
      return new Response(JSON.stringify({ error: "No images" }), {
        status: 400,
      });
    }

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

Analiza TODAS las imágenes del mismo plato (pueden ser distintos ángulos).

Tu tarea:
- identificar alimentos
- estimar cantidades

Para cada alimento devuelve:

- nombre
- cantidad
- unidad ("gramos" o "unidades")
- confianza (0 a 1)

RESPONDE SOLO JSON:

[
  {
    "nombre": "pan",
    "cantidad": 50,
    "unidad": "gramos",
    "confianza": 0.8
  }
]
`
            },

            // 🔥 AÑADE TODAS LAS IMÁGENES
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
    } catch (e) {
      console.error("Error parsing JSON:", text);
      return new Response(JSON.stringify([]), { status: 200 });
    }

    return new Response(JSON.stringify(json), {
      status: 200,
    });

  } catch (error) {
    console.error(error);

    return new Response(JSON.stringify({ error: "Error en análisis" }), {
      status: 500,
    });
  }
}