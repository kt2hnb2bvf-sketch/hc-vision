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

Analiza la comida de las imágenes.

OBJETIVO:
El usuario NO sabe gramos → piensa en unidades (piezas, cucharadas, etc).

REGLAS CLAVE:
- Si el alimento se puede contar (sushi, pan, galletas, fruta...):
  devuelve SIEMPRE:
    "piezas" y "gramos_por_pieza"

- Si NO se puede contar:
  devuelve:
    "cantidad" en gramos

- NO dejes campos undefined

FORMATO EXACTO:

[
  {
    "nombre": "sushi maki (arroz con sésamo)",
    "piezas": 8,
    "gramos_por_pieza": 30,
    "cantidad": null,
    "confianza": 0.9
  }
]

IMPORTANTE:
- Sé realista con pesos (ej: sushi 25-35g por pieza)
- Si dudas, aproxima conservador
`
            },

            ...images.map((img) => ({
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

    // 🔥 NORMALIZACIÓN (EVITA NaN Y ERRORES)
    const normalized = json.map(item => ({
      nombre: item.nombre || "alimento",
      piezas: item.piezas ?? 0,
      gramos_por_pieza: item.gramos_por_pieza ?? 0,
      cantidad: item.cantidad ?? null,
      confianza: item.confianza ?? 0.8
    }));

    return new Response(JSON.stringify(normalized), {
      status: 200,
      headers: { "Content-Type": "application/json" }
    });

  } catch (error) {
    console.error(error);

    return new Response(
      JSON.stringify({ error: "Error en análisis" }),
      { status: 500 }
    );
  }
}