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
      input: [{
        role: "user",
        content: [
          {
            type: "input_text",
            text: `
Eres un asistente experto en nutrición para diabéticos tipo 1 en España.

Analiza esta imagen de comida.

Para cada alimento:
- identifica el alimento
- estima gramos
- calcula HC por 100g
- calcula HC totales
- estima índice glucémico

IMPORTANTE:
Si dudas (ej: pan vs salchicha), marca "posible_confusion": true

RESPONDE SOLO JSON:

{
  "alimentos": [
    {
      "nombre": "string",
      "gramos_estimados": number,
      "hc_por_100g": number,
      "hc_totales": number,
      "ig": number,
      "confianza": "alta|media|baja",
      "posible_confusion": true|false
    }
  ]
}
`
          },
          {
            type: "input_image",
            image_url: imageBase64
          }
        ]
      }]
    });

    const text = response.output_text || "{}";
    const clean = text.replace(/```json|```/g, "").trim();

    return Response.json(JSON.parse(clean));

  } catch (error) {
    return Response.json({ error: error.message });
  }
}