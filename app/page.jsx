import OpenAI from "openai";

const client = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export async function POST(req) {
  try {
    const { imageBase64 } = await req.json();

    const response = await client.responses.create({
      model: "gpt-5.4-nano",
      max_output_tokens: 800,
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

Para cada alimento devuelve:

- nombre (lo más específico posible)
- cantidad estimada (número)
- unidad ("gramos" o "unidades")
- confianza (número entre 0 y 1)

IMPORTANTE:
- NO calcules hidratos de carbono
- NO calcules índice glucémico
- NO inventes datos nutricionales
- Sé conservador con las cantidades
- Si dudas entre alimentos, elige el más probable

RESPONDE SOLO JSON:

[
  {
    "nombre": "pan tipo pico",
    "cantidad": 5,
    "unidad": "unidades",
    "confianza": 0.9
  }
]
`
            },
            {
              type: "input_image",
              image_url: imageBase64
            }
          ]
        }
      ]
    });

    // 🔥 PARSEAR RESPUESTA
    const text = response.output_text;

    let json;

    try {
      json = JSON.parse(text);
    } catch (e) {
      console.error("Error parsing JSON:", text);
      return new Response(JSON.stringify([]), { status: 200 });
    }

    return new Response(JSON.stringify(json), { status: 200 });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: "Error en análisis" }), {
      status: 500
    });
  }
}